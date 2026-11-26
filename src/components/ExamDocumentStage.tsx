import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  Download,
  FileCheck2,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';
import { formatDuration } from '../data/icseCurriculum';
import { calculatePaperStats } from '../utils/paperLogic';
import type { ConceptLaunchContext, GeneratedPaper } from '../types/icse';

export type DocumentTab = 'question' | 'answer';

interface ExamDocumentStageProps {
  paper: GeneratedPaper | null;
  activeTab: DocumentTab;
  onTabChange: (tab: DocumentTab) => void;
  isGenerating: boolean;
  generationStageText: string;
  errorMessage: string | null;
  onRetryGenerate: () => void;
  onDownloadQuestionPdf: () => void;
  onDownloadAnswerPdf: () => void;
  onLaunchConcept: (ctx: ConceptLaunchContext) => void;
}

export const ExamDocumentStage: React.FC<ExamDocumentStageProps> = ({
  paper,
  activeTab,
  onTabChange,
  isGenerating,
  generationStageText,
  errorMessage,
  onRetryGenerate,
  onDownloadQuestionPdf,
  onDownloadAnswerPdf,
  onLaunchConcept,
}) => {
  if (isGenerating) {
    return (
      <section
        aria-live="polite"
        aria-busy="true"
        className="flex-1 min-w-0"
      >
        <div className="exam-sheet rounded-lg p-6 sm:p-10 space-y-6">
          <div className="text-center border-b border-slate-200 pb-6">
            <p className="text-xs font-mono text-[#1E3A5F] font-medium">
              Preparing CISCE Board Format
            </p>
            <h2 className="mt-2 font-editorial text-2xl font-semibold text-slate-900">
              {generationStageText}
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              Drafting syllabus-aligned questions, checking internal choice mark totals, and compiling the step-by-step marking scheme.
            </p>
          </div>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-11/12" />
            <div className="h-24 bg-slate-100 rounded w-full mt-4" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
            <div className="h-3 bg-slate-100 rounded w-4/5" />
            <div className="h-24 bg-slate-100 rounded w-full mt-4" />
          </div>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="flex-1 min-w-0">
        <div
          role="alert"
          className="bg-white border border-rose-200 rounded-lg p-6 sm:p-8 text-center max-w-2xl mx-auto"
        >
          <AlertTriangle
            className="w-8 h-8 text-[#9F1239] mx-auto"
            aria-hidden="true"
          />
          <h2 className="mt-3 font-editorial text-xl font-semibold text-slate-900">
            Could not generate the question paper
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={onRetryGenerate}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded-md transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Try Generating Again</span>
          </button>
        </div>
      </section>
    );
  }

  if (!paper) {
    return (
      <section className="flex-1 min-w-0">
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
          <h2 className="mt-3 font-editorial text-xl font-semibold text-slate-900">
            Configure your first ICSE Class X paper
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Select a subject, chapter scope, marks format, and difficulty on the left to generate a board-style paper and separate marking scheme.
          </p>
        </div>
      </section>
    );
  }

  const stats = calculatePaperStats(paper);

  return (
    <section className="flex-1 min-w-0 space-y-4">
      {/* Document Toolbar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-3 sm:px-4">
        {/* View Mode Switch */}
        <div
          role="tablist"
          aria-label="Exam paper view"
          className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-md"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'question'}
            onClick={() => onTabChange('question')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'question'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Question Paper
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'answer'}
            onClick={() => onTabChange('answer')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'answer'
                ? 'bg-white text-[#9F1239] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Detailed Answer Sheet
          </button>
        </div>

        {/* Separate PDF Export Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onDownloadQuestionPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            <Download className="w-4 h-4 text-[#1E3A5F]" aria-hidden="true" />
            <span>Question PDF</span>
          </button>
          <button
            type="button"
            onClick={onDownloadAnswerPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            <FileCheck2 className="w-4 h-4" aria-hidden="true" />
            <span>Answer Sheet PDF</span>
          </button>
        </div>
      </div>

      {/* Clean unboxed inline metadata summary (Zero-pill discipline) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-600 tabular-nums">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-medium text-slate-800">{paper.paperCode}</span>
          <span aria-hidden="true">·</span>
          <span>{paper.totalMarks} Marks</span>
          <span aria-hidden="true">·</span>
          <span>{formatDuration(paper.durationMinutes)}</span>
          <span aria-hidden="true">·</span>
          <span>Difficulty: {paper.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span>
            {paper.scope === 'full'
              ? 'Full Syllabus'
              : `${paper.chapterTitles.length} Chapter${paper.chapterTitles.length === 1 ? '' : 's'}`}
          </span>
          {paper.isSample && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#1E3A5F] font-medium">Sample Paper</span>
            </>
          )}
        </div>
        <span className="text-slate-500">
          {stats.totalQuestions} Questions · {stats.totalSubParts} Sub-parts
        </span>
      </div>

      {/* A4 Proportioned Examination Sheet */}
      <article className="exam-sheet rounded-lg p-6 sm:p-10 lg:p-12">
        {/* Formal CISCE Masthead */}
        <header className="border-t-2 border-b border-slate-900 pt-5 pb-4 text-center">
          <p className="text-xs font-mono tracking-wider text-slate-600">
            ICSE CLASS X EXAMINATION PRACTICE PAPER
          </p>
          <h2 className="mt-1.5 font-editorial text-2xl sm:text-3xl font-semibold text-slate-950">
            {paper.paperSubtitle}
          </h2>
          {activeTab === 'answer' && (
            <p className="mt-1.5 text-sm font-semibold text-[#9F1239]">
              Detailed Answer Sheet &amp; CISCE Step-Marking Scheme
            </p>
          )}
          <p className="mt-2 text-xs text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {paper.scope === 'full'
              ? `Full Prescribed Class X Syllabus (${paper.subjectName})`
              : `Chapters Covered: ${paper.chapterTitles.join(' · ')}`}
          </p>

          <div className="mt-5 pt-3 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-slate-900 tabular-nums">
            <span>Maximum Marks: {paper.totalMarks}</span>
            <span className="font-mono text-xs text-slate-600">
              Reading Time: {paper.readingTimeMinutes} mins
            </span>
            <span>Time Allowed: {formatDuration(paper.durationMinutes)}</span>
          </div>
        </header>

        {/* General Instructions (shown on Question Paper view) */}
        {activeTab === 'question' && (
          <div className="mt-6 pb-6 border-b border-slate-200 space-y-1.5 text-sm text-slate-700 italic leading-relaxed">
            {paper.generalInstructions.map((inst, idx) => (
              <p key={idx}>{inst}</p>
            ))}
          </div>
        )}

        {/* Exam Sections */}
        <div className="mt-8 space-y-10">
          {paper.sections.map((section) => (
            <div key={section.code} className="space-y-6">
              {/* Section Heading */}
              <div className="text-center pb-3 border-b border-slate-200">
                <h3 className="font-editorial text-lg sm:text-xl font-semibold text-slate-900">
                  {section.title}{' '}
                  <span className="font-mono text-sm font-medium text-slate-600 tabular-nums">
                    ({section.marks} Marks)
                  </span>
                </h3>
                <p className="mt-1 text-xs sm:text-sm italic text-slate-600">
                  {section.attemptInstruction}
                </p>
              </div>

              {/* Questions in Section */}
              <div className="space-y-8">
                {section.questions.map((question) => (
                  <div
                    key={`${section.code}-${question.questionNumber}`}
                    className="space-y-3.5"
                  >
                    {/* Question Header Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                          <h4 className="text-base font-bold text-slate-950">
                            {question.questionNumber}
                          </h4>
                          <span className="text-xs text-slate-500">
                            {question.chapterTag}
                          </span>
                        </div>
                        {question.stem && (
                          <p className="mt-1.5 text-[15px] text-slate-800 leading-relaxed max-w-[72ch]">
                            {question.stem}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            onLaunchConcept({
                              subjectId: paper.subjectId,
                              chapterTitle: question.chapterTag,
                              questionContext: `${question.questionNumber}: ${question.stem} ${question.subParts
                                .slice(0, 2)
                                .map((sp) => `${sp.label} ${sp.prompt}`)
                                .join(' ')}`,
                              initialMode: 'tutor',
                            })
                          }
                          className="no-print inline-flex items-center gap-1 text-xs font-medium text-[#1E3A5F] hover:underline whitespace-nowrap cursor-pointer"
                        >
                          <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Clear Concept</span>
                        </button>
                        <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                          [{question.marks}]
                        </span>
                      </div>
                    </div>

                    {/* Optional Literary Extract / Passage / Data Box */}
                    {question.extractText && (
                      <blockquote className="p-4 sm:p-5 rounded-md bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-serif">
                        {question.extractText}
                      </blockquote>
                    )}

                    {/* Sub-parts */}
                    <div className="space-y-4 pl-1 sm:pl-4">
                      {question.subParts.map((sp, spIdx) => (
                        <div
                          key={`${question.questionNumber}-${sp.label}-${spIdx}`}
                          className="pb-3.5 border-b border-slate-100 last:border-b-0 last:pb-0"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              <span className="font-mono text-sm font-semibold text-slate-700 shrink-0 pt-0.5">
                                {sp.label}
                              </span>
                              <div className="space-y-2.5 flex-1 min-w-0">
                                <p className="text-[15px] text-slate-900 leading-relaxed whitespace-pre-line max-w-[70ch]">
                                  {sp.prompt}
                                </p>

                                {/* MCQ Options */}
                                {sp.options && sp.options.length > 0 && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pt-1 text-sm text-slate-700">
                                    {sp.options.map((opt, optIdx) => {
                                      const isCorrect =
                                        activeTab === 'answer' &&
                                        sp.correctOption &&
                                        opt.trim() === sp.correctOption.trim();
                                      return (
                                        <div
                                          key={optIdx}
                                          className={`py-1 px-2 rounded ${
                                            isCorrect
                                              ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
                                              : ''
                                          }`}
                                        >
                                          {opt}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Answer Sheet Details */}
                                {activeTab === 'answer' && (
                                  <div className="mt-3 p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2.5">
                                    <div>
                                      <span className="text-xs font-semibold text-[#1E3A5F] block mb-1">
                                        Model Answer
                                      </span>
                                      <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-line">
                                        {sp.modelAnswer}
                                      </p>
                                    </div>

                                    {sp.markingSteps.length > 0 && (
                                      <div className="pt-2 border-t border-slate-200">
                                        <span className="text-xs font-semibold text-slate-700 block mb-1">
                                          CISCE Step-Marking Breakdown
                                        </span>
                                        <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
                                          {sp.markingSteps.map((step, sIdx) => (
                                            <li key={sIdx} className="leading-relaxed">
                                              {step}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {sp.examinerTip && (
                                      <div className="pt-2 border-t border-slate-200 text-xs text-[#9F1239] leading-relaxed">
                                        <span className="font-semibold">Examiner Note: </span>
                                        <span>{sp.examinerTip}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <span className="font-mono text-xs sm:text-sm font-medium text-slate-700 shrink-0 tabular-nums pt-0.5">
                              [{sp.marks}]
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Formal Sheet Footer */}
        <footer className="mt-10 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{paper.paperCode} · CISCE Class X Alignment</span>
          <span>End of {activeTab === 'question' ? 'Question Paper' : 'Marking Scheme'}</span>
        </footer>
      </article>
    </section>
  );
};
