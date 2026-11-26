import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { getPaperBlueprint, getSubjectById } from './src/data/icseCurriculum';
import { normalizeGeneratedPaper, validatePaperConfig } from './src/utils/paperLogic';
import type { DifficultyLevel, PaperConfig, SubjectId, TutorMessage } from './src/types/icse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = 'gemini-4-hydrogen';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please check your Settings > Secrets panel.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw err;
      }
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      }
    }
  }
  throw lastError;
}

function formatApiError(err: unknown): { status: number; message: string } {
  const message = err instanceof Error ? err.message : 'Unexpected server error while contacting Gemini.';
  const status = (err as { status?: number })?.status;
  if (status === 403 || status === 400 || /API_KEY_INVALID|PERMISSION_DENIED/i.test(message)) {
    return {
      status: status || 400,
      message: 'Unable to authenticate with Gemini API. Please verify your API key in Settings > Secrets.',
    };
  }
  if (status === 429 || /RESOURCE_EXHAUSTED/i.test(message)) {
    return {
      status: 429,
      message: 'API rate limit reached. Please wait a few seconds and try again.',
    };
  }
  return { status: 500, message };
}

const PAPER_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Concise formal title for this ICSE Class X paper.' },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING },
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          marks: { type: Type.INTEGER },
          isCompulsory: { type: Type.BOOLEAN },
          attemptInstruction: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionNumber: { type: Type.STRING },
                chapterTag: { type: Type.STRING },
                questionType: {
                  type: Type.STRING,
                  description:
                    'One of: mcq-group, short-structured, long-structured, composition, comprehension, grammar, extract',
                },
                marks: { type: Type.INTEGER },
                stem: { type: Type.STRING },
                extractText: {
                  type: Type.STRING,
                  description:
                    'Optional authentic literary extract, unseen comprehension passage, data table, or topographical scenario text.',
                },
                subParts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      prompt: { type: Type.STRING },
                      marks: { type: Type.INTEGER },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'Four labeled MCQ options like "(a) ..." if MCQ; otherwise empty array.',
                      },
                      correctOption: { type: Type.STRING },
                      modelAnswer: {
                        type: Type.STRING,
                        description: 'Complete, board-examiner-grade model answer with exact calculations, equations, or textual references.',
                      },
                      markingSteps: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'CISCE step-marking breakdown showing how each mark is awarded.',
                      },
                      examinerTip: {
                        type: Type.STRING,
                        description: 'Optional concise CISCE examiner note on a common student mistake.',
                      },
                    },
                    required: ['label', 'prompt', 'marks', 'modelAnswer', 'markingSteps'],
                  },
                },
              },
              required: ['questionNumber', 'chapterTag', 'questionType', 'marks', 'stem', 'subParts'],
            },
          },
        },
        required: ['code', 'title', 'subtitle', 'marks', 'isCompulsory', 'attemptInstruction', 'questions'],
      },
    },
  },
  required: ['title', 'sections'],
};

const QUIZ_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Exactly 4 crisp options without letter prefixes.',
          },
          correctIndex: { type: Type.INTEGER, description: '0-based index of the correct option (0 to 3).' },
          explanation: { type: Type.STRING, description: 'Clear step-by-step ICSE conceptual explanation.' },
          conceptTag: { type: Type.STRING },
          commonMistake: { type: Type.STRING },
          icseMarksHint: { type: Type.STRING },
        },
        required: [
          'id',
          'question',
          'options',
          'correctIndex',
          'explanation',
          'conceptTag',
          'commonMistake',
          'icseMarksHint',
        ],
      },
    },
  },
  required: ['questions'],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/papers/generate', async (req, res) => {
    try {
      const config = req.body as PaperConfig;
      const validation = validatePaperConfig(config);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const subject = getSubjectById(config.subjectId);
      const blueprint = getPaperBlueprint(config.subjectId, config.totalMarks);
      const selectedChapterNames =
        config.scope === 'full'
          ? subject.chapters.map((c) => `${c.unit}: ${c.title}`)
          : subject.chapters
              .filter((c) => config.chapterIds.includes(c.id))
              .map((c) => `${c.unit}: ${c.title}`);

      const sectionSpecs = blueprint.sections
        .map(
          (s) =>
            `- ${s.title} (${s.marks} attemptable marks | ${s.isCompulsory ? 'Compulsory' : `Provide ${s.questionCount} questions, student attempts ${s.attemptCount}`}): ${s.structureNotes}`,
        )
        .join('\n');

      const difficultyDirective: Record<DifficultyLevel, string> = {
        Easy: 'Focus on foundational CISCE recall, direct definitions, straightforward 1-step numericals, and clear comprehension.',
        Medium: 'Match standard ICSE Board exam level with balanced conceptual understanding, standard numericals, and application.',
        Hard: 'Focus on challenging HOTS (Higher Order Thinking Skills), multi-step numericals, tricky assertion-reason items, and deep analytical extract questions.',
        Mixed: 'Follow authentic CISCE 2026-2027 board weightage: ~30% Easy foundational, ~45% Medium standard application, ~25% Hard analytical/competency questions.',
      };

      const prompt = `Generate a complete, authentic CISCE ICSE Class X (2026-2027 syllabus) Question Paper and Detailed Answer Sheet.

SUBJECT: ${subject.name} (${subject.paperSubtitle}, Code: ${subject.paperCode})
TOTAL MARKS: ${config.totalMarks} Marks | WRITING TIME: ${blueprint.durationMinutes} minutes
SCOPE: ${config.scope === 'full' ? 'Full Prescribed Class X Syllabus' : 'Chapter-Wise Focused Test'}
CHAPTERS TO COVER STRICTLY:
${selectedChapterNames.map((c) => `- ${c}`).join('\n')}

DIFFICULTY SETTING: ${config.difficulty}
${difficultyDirective[config.difficulty]}
COMPETENCY-BASED EMPHASIS (CISCE 2026-2027): ${
        config.competencyFocus
          ? 'HIGH — include assertion-reason MCQs, real-life application scenarios, and analytical reasoning sub-parts.'
          : 'STANDARD — classic balanced CISCE board style.'
      }

EXACT SECTION BLUEPRINT TO FOLLOW:
${sectionSpecs}

STRICT EXAMINER RULES:
1. Stay 100% strictly within the 2026-2027 ICSE Class X syllabus and the selected chapters above. (For English Literature, ONLY use Julius Caesar Acts III-V and Treasure Chest Class X stories & poems — never Merchant of Venice or outdated texts).
2. Ensure every question's marks equal the sum of its sub-parts' marks, and every section matches the exact question count, attempt instruction, and marks specified above.
3. For MCQs, include exactly 4 options labeled "(a) ...", "(b) ...", "(c) ...", "(d) ..." and provide the exact correctOption.
4. For every single sub-part, provide a thorough, accurate modelAnswer (with balanced chemical equations / SI units / step-by-step math calculations / precise textual points) AND an explicit CISCE step-marking breakdown in markingSteps.
5. Do not leave placeholder text like "[insert passage here]" or "refer to diagram on page 5" — if a question needs an extract, comprehension passage, data table, or topographical description, write the complete self-contained text in extractText.`;

      const ai = getAiClient();
      const response = await withRetry(() =>
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            systemInstruction:
              'You are a Senior CISCE ICSE Class X Chief Examiner with 25 years of experience setting official board question papers and step-marking schemes. Output strictly valid JSON matching the schema.',
            responseMimeType: 'application/json',
            responseSchema: PAPER_RESPONSE_SCHEMA,
          },
        }),
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('The AI examiner returned an empty paper. Please try generating again.');
      }

      const parsed = JSON.parse(rawText);
      const paper = normalizeGeneratedPaper(parsed, config);
      return res.json({ paper });
    } catch (err) {
      const formatted = formatApiError(err);
      return res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post('/api/quiz/generate', async (req, res) => {
    try {
      const { subjectId, chapterTitle, difficulty = 'Mixed', questionCount = 6, focusPrompt } = req.body as {
        subjectId: SubjectId;
        chapterTitle: string;
        difficulty?: DifficultyLevel;
        questionCount?: number;
        focusPrompt?: string;
      };

      const subject = getSubjectById(subjectId);
      if (!chapterTitle || !chapterTitle.trim()) {
        return res.status(400).json({ error: 'Please select a chapter to generate a concept quiz.' });
      }

      const count = Math.min(Math.max(Number(questionCount) || 6, 4), 10);
      const prompt = `Create ${count} high-yield ICSE Class X (2026-2027 syllabus) concept-clearance MCQs for:
Subject: ${subject.name} (${subject.paperSubtitle})
Chapter: ${chapterTitle}
Difficulty: ${difficulty}
${focusPrompt ? `Specific student doubt / question context to emphasize: ${focusPrompt}` : ''}

Rules:
- Focus on conceptual clarity, common ICSE board traps, assertion-reason thinking, and application.
- Each question must have exactly 4 distinct, unambiguous options (plain text without "(a)" prefix).
- Provide a crisp, clear ICSE board explanation, conceptTag, commonMistake warning, and icseMarksHint.`;

      const ai = getAiClient();
      const response = await withRetry(() =>
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            systemInstruction:
              'You are an encouraging, rigorous ICSE Class X specialist teacher creating targeted diagnostic concept-clearance quizzes. Return valid JSON only.',
            responseMimeType: 'application/json',
            responseSchema: QUIZ_RESPONSE_SCHEMA,
          },
        }),
      );

      const rawText = (response.text ?? '').trim();
      const parsed = JSON.parse(rawText);
      return res.json({ questions: parsed.questions ?? [] });
    } catch (err) {
      const formatted = formatApiError(err);
      return res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post('/api/tutor/chat', async (req, res) => {
    try {
      const { subjectId, chapterTitle, questionContext, messages } = req.body as {
        subjectId: SubjectId;
        chapterTitle: string;
        questionContext?: string;
        messages: Pick<TutorMessage, 'role' | 'content'>[];
      };

      const subject = getSubjectById(subjectId);
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Please enter a question for the concept tutor.' });
      }

      const systemInstruction = `You are an expert, warm, step-by-step ICSE Class X Concept Tutor helping a student prepare for the 2026-2027 CISCE Board Examinations.
Current Subject: ${subject.name} (${subject.paperSubtitle})
Current Chapter: ${chapterTitle}
${questionContext ? `Specific Exam Question Context: ${questionContext}` : ''}

Teaching Style Rules:
1. Keep explanations clear, structured in short digestible steps (never dump a massive wall of text).
2. Highlight exact ICSE board keywords, SI units, balanced equations, or textbook references that earn full marks.
3. Call out one common ICSE board trap where relevant.
4. End every teaching turn with one quick, encouraging "Check Your Understanding" question so the student actively practices the concept.`;

      const transcript = messages
        .slice(-10)
        .map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
        .join('\n\n');

      const ai = getAiClient();
      const response = await withRetry(() =>
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: `Conversation so far:\n${transcript}\n\nRespond as the Tutor to the student's latest message.`,
          config: {
            systemInstruction,
          },
        }),
      );

      const reply = (response.text ?? '').trim();
      if (!reply) {
        throw new Error('Tutor returned an empty response. Please try again.');
      }
      return res.json({ reply });
    } catch (err) {
      const formatted = formatApiError(err);
      return res.status(formatted.status).json({ error: formatted.message });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Scholaris ICSE server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
