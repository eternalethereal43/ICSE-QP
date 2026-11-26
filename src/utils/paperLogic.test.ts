import test from 'node:test';
import assert from 'node:assert/strict';
import { ICSE_SUBJECTS, getPaperBlueprint } from '../data/icseCurriculum';
import { SAMPLE_CONCEPT_QUIZ, SAMPLE_PHYSICS_PAPER } from '../data/samplePaper';
import {
  buildPdfFilename,
  calculatePaperStats,
  filterLibraryPapers,
  normalizeGeneratedPaper,
  scoreQuiz,
  validatePaperConfig,
} from './paperLogic';
import type { PaperMarks } from '../types/icse';

test('curriculum contains all 8 core ICSE subjects (excluding Hindi and electives)', () => {
  assert.equal(ICSE_SUBJECTS.length, 8);
  const ids = ICSE_SUBJECTS.map((s) => s.id);
  assert.deepEqual(ids, [
    'english-language',
    'english-literature',
    'mathematics',
    'physics',
    'chemistry',
    'biology',
    'history-civics',
    'geography',
  ]);
  for (const subject of ICSE_SUBJECTS) {
    assert.ok(subject.chapters.length >= 8, `${subject.name} should have complete chapter coverage`);
  }
});

test('all 20, 40, and 80-mark blueprints sum cleanly to exact target marks', () => {
  const markPresets: PaperMarks[] = [20, 40, 80];
  for (const subject of ICSE_SUBJECTS) {
    for (const marks of markPresets) {
      const bp = getPaperBlueprint(subject.id, marks);
      assert.equal(bp.totalMarks, marks);
      const sectionSum = bp.sections.reduce((acc, s) => acc + s.marks, 0);
      assert.equal(
        sectionSum,
        marks,
        `${subject.name} ${marks}M blueprint sections sum to ${sectionSum} instead of ${marks}`,
      );
    }
  }
});

test('English Literature syllabus reflects 2026-2027 Julius Caesar Acts III-V and Treasure Chest', () => {
  const lit = ICSE_SUBJECTS.find((s) => s.id === 'english-literature');
  assert.ok(lit);
  const titles = lit.chapters.map((c) => c.title).join(' | ');
  assert.match(titles, /Julius Caesar — Act III/);
  assert.match(titles, /Julius Caesar — Act V/);
  assert.match(titles, /With the Photographer/);
  assert.match(titles, /The Last Lesson/);
  assert.match(titles, /The Power of Music/);
  assert.doesNotMatch(titles, /Merchant of Venice/i);
});

test('validatePaperConfig rejects empty chapter list when scope is chapters', () => {
  const invalid = validatePaperConfig({
    subjectId: 'physics',
    scope: 'chapters',
    chapterIds: [],
    totalMarks: 40,
    difficulty: 'Medium',
    competencyFocus: true,
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.error && invalid.error.length > 0);

  const valid = validatePaperConfig({
    subjectId: 'physics',
    scope: 'chapters',
    chapterIds: ['phy-force'],
    totalMarks: 40,
    difficulty: 'Hard',
    competencyFocus: true,
  });
  assert.equal(valid.valid, true);
});

test('calculatePaperStats and sample paper integrity', () => {
  const stats = calculatePaperStats(SAMPLE_PHYSICS_PAPER);
  assert.equal(stats.totalSections, 2);
  assert.equal(stats.attemptableMarks, 40);
  assert.equal(stats.mcqCount, 8);
  assert.equal(stats.totalQuestions, 5);
});

test('normalizeGeneratedPaper fills missing blueprint metadata cleanly', () => {
  const normalized = normalizeGeneratedPaper(
    {
      sections: [
        {
          code: 'A',
          title: 'SECTION A',
          subtitle: 'Compulsory',
          marks: 10,
          isCompulsory: true,
          attemptInstruction: 'Attempt all.',
          questions: [
            {
              questionNumber: 'Question 1',
              chapterTag: 'GST',
              questionType: 'mcq-group',
              marks: 0,
              stem: 'Choose the correct option.',
              subParts: [
                {
                  label: '(i)',
                  prompt: 'Intra-state GST splits equally into:',
                  marks: 1,
                  options: ['(a) CGST & SGST', '(b) IGST only'],
                  correctOption: '(a) CGST & SGST',
                  modelAnswer: '(a) CGST & SGST',
                  markingSteps: [],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      subjectId: 'mathematics',
      scope: 'chapters',
      chapterIds: ['math-gst'],
      totalMarks: 20,
      difficulty: 'Easy',
      competencyFocus: false,
    },
  );
  assert.equal(normalized.subjectName, 'Mathematics');
  assert.equal(normalized.paperCode, 'ICSE-MATH');
  assert.equal(normalized.durationMinutes, 45);
  assert.equal(normalized.sections[0].questions[0].marks, 1);
  assert.ok(normalized.sections[0].questions[0].subParts[0].markingSteps.length > 0);
});

test('scoreQuiz computes exact percentage and mastery band', () => {
  const allRight = scoreQuiz(SAMPLE_CONCEPT_QUIZ, {
    'sample-q1': 1,
    'sample-q2': 2,
    'sample-q3': 2,
    'sample-q4': 1,
  });
  assert.equal(allRight.correctCount, 4);
  assert.equal(allRight.percentage, 100);
  assert.equal(allRight.band, 'Board Ready');

  const halfRight = scoreQuiz(SAMPLE_CONCEPT_QUIZ, {
    'sample-q1': 1,
    'sample-q2': 0,
    'sample-q3': 2,
    'sample-q4': 0,
  });
  assert.equal(halfRight.correctCount, 2);
  assert.equal(halfRight.percentage, 50);
  assert.equal(halfRight.band, 'Needs Revision');
});

test('filterLibraryPapers filters by subject, difficulty, and query', () => {
  const papers = [SAMPLE_PHYSICS_PAPER];
  assert.equal(filterLibraryPapers(papers, { subjectId: 'all', difficulty: 'all', query: '' }).length, 1);
  assert.equal(filterLibraryPapers(papers, { subjectId: 'chemistry', difficulty: 'all', query: '' }).length, 0);
  assert.equal(filterLibraryPapers(papers, { subjectId: 'physics', difficulty: 'Mixed', query: 'lens' }).length, 1);
  assert.equal(filterLibraryPapers(papers, { subjectId: 'physics', difficulty: 'Hard', query: '' }).length, 0);
});

test('buildPdfFilename produces separate Question and Answer filenames', () => {
  assert.equal(
    buildPdfFilename(SAMPLE_PHYSICS_PAPER, 'question'),
    'ICSE_ClassX_Physics_40M_Question_Paper.pdf',
  );
  assert.equal(
    buildPdfFilename(SAMPLE_PHYSICS_PAPER, 'answer'),
    'ICSE_ClassX_Physics_40M_Answer_Sheet.pdf',
  );
});
