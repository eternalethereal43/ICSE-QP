import { getPaperBlueprint, getSubjectById } from '../data/icseCurriculum';
import type {
  ExamSection,
  GeneratedPaper,
  LibraryFilter,
  PaperConfig,
  QuizQuestion,
} from '../types/icse';

export interface ConfigValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePaperConfig(config: PaperConfig): ConfigValidationResult {
  try {
    const subject = getSubjectById(config.subjectId);
    if (![20, 40, 80].includes(config.totalMarks)) {
      return { valid: false, error: 'Please select a valid ICSE marks format (20, 40, or 80 marks).' };
    }
    if (!['Easy', 'Medium', 'Hard', 'Mixed'].includes(config.difficulty)) {
      return { valid: false, error: 'Please choose a valid difficulty level.' };
    }
    if (config.scope === 'chapters') {
      if (!config.chapterIds || config.chapterIds.length === 0) {
        return {
          valid: false,
          error: 'Select at least one chapter before generating a chapter-wise question paper.',
        };
      }
      const validIds = new Set(subject.chapters.map((c) => c.id));
      const matched = config.chapterIds.filter((id) => validIds.has(id));
      if (matched.length === 0) {
        return {
          valid: false,
          error: 'Selected chapters do not belong to the chosen subject. Please re-select chapters.',
        };
      }
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please select one of the 8 core ICSE Class X subjects.' };
  }
}

export interface PaperStats {
  totalSections: number;
  totalQuestions: number;
  totalSubParts: number;
  mcqCount: number;
  attemptableMarks: number;
}

export function calculatePaperStats(paper: GeneratedPaper): PaperStats {
  let totalQuestions = 0;
  let totalSubParts = 0;
  let mcqCount = 0;
  let attemptableMarks = 0;

  for (const section of paper.sections) {
    attemptableMarks += section.marks;
    for (const q of section.questions) {
      totalQuestions += 1;
      totalSubParts += q.subParts.length;
      if (q.questionType === 'mcq-group') {
        mcqCount += q.subParts.length;
      } else {
        mcqCount += q.subParts.filter((sp) => sp.options && sp.options.length > 0).length;
      }
    }
  }

  return {
    totalSections: paper.sections.length,
    totalQuestions,
    totalSubParts,
    mcqCount,
    attemptableMarks,
  };
}

export function normalizeGeneratedPaper(
  raw: Partial<GeneratedPaper> & { sections?: ExamSection[] },
  config: PaperConfig,
): GeneratedPaper {
  const subject = getSubjectById(config.subjectId);
  const blueprint = getPaperBlueprint(config.subjectId, config.totalMarks);

  const selectedChapters =
    config.scope === 'full'
      ? subject.chapters.map((c) => c.title)
      : subject.chapters.filter((c) => config.chapterIds.includes(c.id)).map((c) => c.title);

  const normalizedSections: ExamSection[] = (raw.sections ?? []).map((sec, idx) => {
    const bpSec = blueprint.sections[idx];
    return {
      code: sec.code || bpSec?.code || String.fromCharCode(65 + idx),
      title: sec.title || bpSec?.title || `SECTION ${String.fromCharCode(65 + idx)}`,
      subtitle: sec.subtitle || bpSec?.subtitle || '',
      marks: typeof sec.marks === 'number' && sec.marks > 0 ? sec.marks : (bpSec?.marks ?? 0),
      isCompulsory: typeof sec.isCompulsory === 'boolean' ? sec.isCompulsory : (bpSec?.isCompulsory ?? true),
      attemptInstruction: sec.attemptInstruction || bpSec?.attemptInstruction || 'Attempt questions as directed.',
      questions: (sec.questions ?? []).map((q, qIdx) => ({
        questionNumber: q.questionNumber || `Question ${qIdx + 1}`,
        chapterTag: q.chapterTag || selectedChapters[0] || subject.name,
        questionType: q.questionType || 'short-structured',
        marks:
          typeof q.marks === 'number' && q.marks > 0
            ? q.marks
            : (q.subParts ?? []).reduce((sum, sp) => sum + (Number(sp.marks) || 0), 0),
        stem: q.stem || '',
        extractText: q.extractText || undefined,
        subParts: (q.subParts ?? []).map((sp, spIdx) => ({
          label: sp.label || `(${String.fromCharCode(97 + spIdx)})`,
          prompt: sp.prompt || '',
          marks: typeof sp.marks === 'number' && sp.marks > 0 ? sp.marks : 1,
          options: Array.isArray(sp.options) && sp.options.length > 0 ? sp.options : undefined,
          correctOption: sp.correctOption || undefined,
          modelAnswer: sp.modelAnswer || 'Refer to ICSE textbook steps.',
          markingSteps: Array.isArray(sp.markingSteps) && sp.markingSteps.length > 0
            ? sp.markingSteps
            : ['Award full marks for accurate concept and correct units/terminology.'],
          examinerTip: sp.examinerTip || undefined,
        })),
      })),
    };
  });

  const scopeLabel = config.scope === 'full' ? 'Full Syllabus' : `${selectedChapters.length} Chapter${selectedChapters.length === 1 ? '' : 's'}`;

  return {
    id: raw.id || `icse-${config.subjectId}-${config.totalMarks}m-${Date.now()}`,
    createdAt: raw.createdAt || new Date().toISOString(),
    title: raw.title || `${subject.name} — ${config.totalMarks} Marks (${scopeLabel})`,
    subjectId: subject.id,
    subjectName: subject.name,
    paperSubtitle: subject.paperSubtitle,
    paperCode: subject.paperCode,
    totalMarks: config.totalMarks,
    durationMinutes: blueprint.durationMinutes,
    readingTimeMinutes: blueprint.readingTimeMinutes,
    difficulty: config.difficulty,
    competencyFocus: config.competencyFocus,
    scope: config.scope,
    chapterTitles: selectedChapters,
    generalInstructions:
      Array.isArray(raw.generalInstructions) && raw.generalInstructions.length > 0
        ? raw.generalInstructions
        : blueprint.generalInstructions,
    sections: normalizedSections,
  };
}

export interface QuizScoreSummary {
  answeredCount: number;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  band: 'Needs Revision' | 'Building Confidence' | 'Board Ready';
}

export function scoreQuiz(
  questions: QuizQuestion[],
  selectedAnswers: Record<string, number>,
): QuizScoreSummary {
  const totalQuestions = questions.length;
  let answeredCount = 0;
  let correctCount = 0;

  for (const q of questions) {
    const selected = selectedAnswers[q.id];
    if (typeof selected === 'number') {
      answeredCount += 1;
      if (selected === q.correctIndex) {
        correctCount += 1;
      }
    }
  }

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const band: QuizScoreSummary['band'] =
    percentage >= 80 ? 'Board Ready' : percentage >= 55 ? 'Building Confidence' : 'Needs Revision';

  return {
    answeredCount,
    correctCount,
    totalQuestions,
    percentage,
    band,
  };
}

export function filterLibraryPapers(papers: GeneratedPaper[], filter: LibraryFilter): GeneratedPaper[] {
  const q = filter.query.trim().toLowerCase();
  return papers.filter((paper) => {
    if (filter.subjectId !== 'all' && paper.subjectId !== filter.subjectId) {
      return false;
    }
    if (filter.difficulty !== 'all' && paper.difficulty !== filter.difficulty) {
      return false;
    }
    if (q.length > 0) {
      const haystack = [
        paper.title,
        paper.subjectName,
        paper.paperCode,
        paper.difficulty,
        ...paper.chapterTitles,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export function buildPdfFilename(paper: GeneratedPaper, kind: 'question' | 'answer'): string {
  const cleanSubject = paper.subjectName.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  const suffix = kind === 'question' ? 'Question_Paper' : 'Answer_Sheet';
  return `ICSE_ClassX_${cleanSubject}_${paper.totalMarks}M_${suffix}.pdf`;
}
