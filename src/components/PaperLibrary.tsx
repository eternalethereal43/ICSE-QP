import React, { useMemo, useState } from 'react';
import {
  Download,
  FileCheck2,
  FilePlus2,
  FolderOpen,
  Search,
  Trash2,
} from 'lucide-react';
import { ICSE_SUBJECTS, formatDuration } from '../data/icseCurriculum';
import { filterLibraryPapers } from '../utils/paperLogic';
import type {
  DifficultyLevel,
  GeneratedPaper,
  LibraryFilter,
  SubjectId,
} from '../types/icse';

interface PaperLibraryProps {
  papers: GeneratedPaper[];
  onOpenPaper: (paper: GeneratedPaper) => void;
  onDownloadQuestionPdf: (paper: GeneratedPaper) => void;
  onDownloadAnswerPdf: (paper: GeneratedPaper) => void;
  onDeletePaper: (paperId: string) => void;
  onCreateNew: () => void;
}

const DIFFICULTIES: (DifficultyLevel | 'all')[] = [
  'all',
  'Easy',
  'Medium',
  'Hard',
  'Mixed',
];

function formatSavedDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return 'Saved';
  }
}

export const PaperLibrary: React.FC<PaperLibraryProps> = ({
  papers,
  onOpenPaper,
  onDownloadQuestionPdf,
  onDownloadAnswerPdf,
  onDeletePaper,
  onCreateNew,
}) => {
  const [filter, setFilter] = useState<LibraryFilter>({
    subjectId: 'all',
    difficulty: 'all',
    query: '',
  });

  const filteredPapers = useMemo(
    () => filterLibraryPapers(papers, filter),
    [papers, filter],
  );

  return (
    <div className="space-y-6">
      {/* Library Header & Filter Controls */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-editorial text-2xl font-semibold text-slate-900">
              Saved Paper Library
            </h1>
            <p className="mt-1 text-sm text-slate-600 tabular-nums">
              {papers.length} saved paper{papers.length === 1 ? '' : 's'} stored locally in this browser for instant review and PDF re-download.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            <FilePlus2 className="w-4 h-4" aria-hidden="true" />
            <span>Generate New Paper</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-4 border-t border-slate-100">
          <div className="md:col-span-5 relative">
            <label htmlFor="library-search" className="sr-only">
              Search saved papers by title or chapter
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="library-search"
              type="text"
              value={filter.query}
              onChange={(e) => setFilter((prev) => ({ ...prev, query: e.target.value }))}
              placeholder="Search by subject, title, or chapter..."
              className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="md:col-span-4">
            <label htmlFor="library-subject-filter" className="sr-only">
              Filter by subject
            </label>
            <select
              id="library-subject-filter"
              value={filter.subjectId}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  subjectId: e.target.value as SubjectId | 'all',
                }))
              }
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900"
            >
              <option value="all">All 8 Core Subjects</option>
              {ICSE_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="library-difficulty-filter" className="sr-only">
              Filter by difficulty
            </label>
            <select
              id="library-difficulty-filter"
              value={filter.difficulty}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  difficulty: e.target.value as DifficultyLevel | 'all',
                }))
              }
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d === 'all' ? 'All Difficulties' : `${d} Difficulty`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Saved Papers List */}
      <section className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
        {filteredPapers.length === 0 ? (
          <div className="p-10 text-center space-y-2.5">
            <FolderOpen className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
            <h2 className="font-editorial text-xl font-semibold text-slate-900">
              {papers.length === 0
                ? 'Your paper library is empty'
                : 'No saved papers match these filters'}
            </h2>
            <p className="text-sm text-slate-600">
              {papers.length === 0
                ? 'Generate your first ICSE Class X practice paper to archive it here.'
                : 'Try clearing the search query or selecting All 8 Core Subjects.'}
            </p>
            {papers.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setFilter({ subjectId: 'all', difficulty: 'all', query: '' })
                }
                className="mt-2 px-4 py-2 text-xs font-semibold text-[#1E3A5F] border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="p-5 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenPaper(paper)}
                    className="font-editorial text-lg font-semibold text-slate-950 hover:text-[#1E3A5F] text-left transition-colors cursor-pointer"
                  >
                    {paper.title}
                  </button>
                </div>

                {/* Unboxed metadata row */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 tabular-nums">
                  <span className="font-mono font-medium text-slate-800">
                    {paper.paperCode}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{paper.totalMarks} Marks</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDuration(paper.durationMinutes)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{paper.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {paper.scope === 'full'
                      ? 'Full Syllabus'
                      : `${paper.chapterTitles.length} Chapter${paper.chapterTitles.length === 1 ? '' : 's'}`}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{formatSavedDate(paper.createdAt)}</span>
                </div>

                <p className="text-xs text-slate-500 truncate max-w-2xl">
                  {paper.chapterTitles.join(' · ')}
                </p>
              </div>

              {/* Paper Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenPaper(paper)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded-md transition-colors whitespace-nowrap cursor-pointer min-h-[38px]"
                >
                  Open Paper
                </button>
                <button
                  type="button"
                  onClick={() => onDownloadQuestionPdf(paper)}
                  aria-label={`Download Question PDF for ${paper.title}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors whitespace-nowrap cursor-pointer min-h-[38px]"
                >
                  <Download className="w-3.5 h-3.5 text-[#1E3A5F]" aria-hidden="true" />
                  <span>Question PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDownloadAnswerPdf(paper)}
                  aria-label={`Download Answer Sheet PDF for ${paper.title}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors whitespace-nowrap cursor-pointer min-h-[38px]"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-[#9F1239]" aria-hidden="true" />
                  <span>Answer PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePaper(paper.id)}
                  aria-label={`Delete '${paper.title}'`}
                  className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-[#9F1239] hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-md transition-colors cursor-pointer min-h-[38px] min-w-[38px]"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};
