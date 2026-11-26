import React, { useMemo, useState } from 'react';
import { AlertCircle, Check, FileText, Loader2, Search } from 'lucide-react';
import {
  ICSE_SUBJECTS,
  formatDuration,
  getPaperBlueprint,
  getSubjectById,
} from '../data/icseCurriculum';
import type {
  DifficultyLevel,
  PaperConfig,
  PaperMarks,
  PaperScope,
  SubjectId,
} from '../types/icse';

interface PaperConfigRailProps {
  config: PaperConfig;
  onChange: (next: PaperConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  validationError: string | null;
}

const MARK_OPTIONS: { value: PaperMarks; label: string; hint: string }[] = [
  { value: 20, label: '20 Marks', hint: '45 min' },
  { value: 40, label: '40 Marks', hint: '75 min' },
  { value: 80, label: '80 Marks', hint: 'Board' },
];

const DIFFICULTY_OPTIONS: DifficultyLevel[] = ['Easy', 'Medium', 'Hard', 'Mixed'];

export const PaperConfigRail: React.FC<PaperConfigRailProps> = ({
  config,
  onChange,
  onGenerate,
  isGenerating,
  validationError,
}) => {
  const [chapterQuery, setChapterQuery] = useState('');

  const subject = useMemo(() => getSubjectById(config.subjectId), [config.subjectId]);
  const blueprint = useMemo(
    () => getPaperBlueprint(config.subjectId, config.totalMarks),
    [config.subjectId, config.totalMarks],
  );

  const groupedChapters = useMemo(() => {
    const q = chapterQuery.trim().toLowerCase();
    const filtered = q
      ? subject.chapters.filter(
          (ch) =>
            ch.title.toLowerCase().includes(q) || ch.unit.toLowerCase().includes(q),
        )
      : subject.chapters;

    const groups: { unit: string; chapters: typeof filtered }[] = [];
    for (const ch of filtered) {
      let existing = groups.find((g) => g.unit === ch.unit);
      if (!existing) {
        existing = { unit: ch.unit, chapters: [] };
        groups.push(existing);
      }
      existing.chapters.push(ch);
    }
    return groups;
  }, [subject, chapterQuery]);

  const handleSubjectChange = (subjectId: SubjectId) => {
    const nextSubject = getSubjectById(subjectId);
    setChapterQuery('');
    onChange({
      ...config,
      subjectId,
      chapterIds: nextSubject.chapters.slice(0, 3).map((c) => c.id),
    });
  };

  const handleScopeChange = (scope: PaperScope) => {
    onChange({
      ...config,
      scope,
      chapterIds:
        scope === 'chapters' && config.chapterIds.length === 0
          ? subject.chapters.slice(0, 3).map((c) => c.id)
          : config.chapterIds,
    });
  };

  const toggleChapter = (chapterId: string) => {
    const exists = config.chapterIds.includes(chapterId);
    const nextIds = exists
      ? config.chapterIds.filter((id) => id !== chapterId)
      : [...config.chapterIds, chapterId];
    onChange({ ...config, chapterIds: nextIds });
  };

  const selectAllChapters = () => {
    onChange({ ...config, chapterIds: subject.chapters.map((c) => c.id) });
  };

  const clearAllChapters = () => {
    onChange({ ...config, chapterIds: [] });
  };

  return (
    <aside
      aria-label="Question paper configuration"
      className="no-print w-full lg:w-[372px] xl:w-[396px] shrink-0 bg-white border border-slate-200 rounded-lg p-5 sm:p-6 self-start lg:sticky lg:top-24"
    >
      <div className="pb-4 border-b border-slate-200">
        <h1 className="font-editorial text-xl font-semibold text-slate-900">
          Paper Configuration
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          CISCE Class X 2026–2027 · 8 Core Subjects
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onGenerate();
        }}
        className="mt-5 space-y-5"
      >
        {/* 1. Subject Selector */}
        <div>
          <label
            htmlFor="icse-subject-select"
            className="block text-sm font-semibold text-slate-800 mb-1.5"
          >
            Subject
          </label>
          <select
            id="icse-subject-select"
            value={config.subjectId}
            onChange={(e) => handleSubjectChange(e.target.value as SubjectId)}
            className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
          >
            {ICSE_SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.paperSubtitle})
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-slate-500">
            {subject.paperCode} · {subject.groupLabel} · {subject.chapters.length} Syllabus Units
          </p>
        </div>

        {/* 2. Syllabus Scope */}
        <div>
          <span className="block text-sm font-semibold text-slate-800 mb-1.5">
            Syllabus Coverage
          </span>
          <div
            role="group"
            aria-label="Syllabus coverage scope"
            className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-md"
          >
            <button
              type="button"
              onClick={() => handleScopeChange('full')}
              aria-pressed={config.scope === 'full'}
              className={`py-2 px-3 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                config.scope === 'full'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Syllabus
            </button>
            <button
              type="button"
              onClick={() => handleScopeChange('chapters')}
              aria-pressed={config.scope === 'chapters'}
              className={`py-2 px-3 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                config.scope === 'chapters'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Specific Chapters
            </button>
          </div>

          {config.scope === 'chapters' && (
            <div className="mt-3 border border-slate-200 rounded-md bg-slate-50/70">
              <div className="p-2.5 border-b border-slate-200 flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search
                    className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={chapterQuery}
                    onChange={(e) => setChapterQuery(e.target.value)}
                    placeholder="Filter chapters..."
                    aria-label="Filter syllabus chapters"
                    className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={selectAllChapters}
                    className="text-[#1E3A5F] hover:underline font-medium cursor-pointer"
                  >
                    All
                  </button>
                  <span className="text-slate-300" aria-hidden="true">
                    /
                  </span>
                  <button
                    type="button"
                    onClick={clearAllChapters}
                    className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="max-h-52 overflow-y-auto p-2.5 space-y-3">
                {groupedChapters.map((group) => (
                  <div key={group.unit}>
                    <div className="text-[11px] font-semibold text-slate-500 px-1 mb-1">
                      {group.unit}
                    </div>
                    <div className="space-y-1">
                      {group.chapters.map((chapter) => {
                        const checked = config.chapterIds.includes(chapter.id);
                        return (
                          <label
                            key={chapter.id}
                            className={`flex items-start gap-2.5 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                              checked
                                ? 'bg-white text-slate-900 border border-slate-200'
                                : 'text-slate-700 hover:bg-white/60 border border-transparent'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleChapter(chapter.id)}
                              className="mt-0.5 rounded border-slate-300 text-[#1E3A5F] focus:ring-[#1E3A5F]"
                            />
                            <span className="leading-snug">{chapter.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {groupedChapters.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-3">
                    No chapters match "{chapterQuery}".
                  </p>
                )}
              </div>

              <div className="px-3 py-2 border-t border-slate-200 text-xs text-slate-600 tabular-nums flex items-center justify-between">
                <span>Selected chapters</span>
                <span className="font-mono font-medium text-slate-900">
                  {config.chapterIds.length} / {subject.chapters.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Marks & Format Preset */}
        <div>
          <span className="block text-sm font-semibold text-slate-800 mb-1.5">
            Exam Format &amp; Marks
          </span>
          <div
            role="group"
            aria-label="Exam marks format"
            className="grid grid-cols-3 gap-1.5"
          >
            {MARK_OPTIONS.map((opt) => {
              const active = config.totalMarks === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ ...config, totalMarks: opt.value })}
                  aria-pressed={active}
                  className={`py-2 px-2 rounded-md border text-center transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-semibold whitespace-nowrap tabular-nums">
                    {opt.label}
                  </div>
                  <div
                    className={`text-[11px] whitespace-nowrap mt-0.5 ${
                      active ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {opt.hint}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Difficulty Level */}
        <div>
          <span className="block text-sm font-semibold text-slate-800 mb-1.5">
            Difficulty Setting
          </span>
          <div
            role="group"
            aria-label="Difficulty setting"
            className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-md"
          >
            {DIFFICULTY_OPTIONS.map((level) => {
              const active = config.difficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onChange({ ...config, difficulty: level })}
                  aria-pressed={active}
                  className={`py-2 px-2 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Competency-Based Focus */}
        <label className="flex items-start gap-3 p-3 rounded-md border border-slate-200 bg-slate-50/70 cursor-pointer">
          <input
            type="checkbox"
            checked={config.competencyFocus}
            onChange={(e) =>
              onChange({ ...config, competencyFocus: e.target.checked })
            }
            className="mt-0.5 rounded border-slate-300 text-[#1E3A5F] focus:ring-[#1E3A5F]"
          />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold text-slate-900 block">
              CISCE Competency-Focused Questions
            </span>
            <span className="text-slate-600">
              Includes assertion-reason, application, and analytical items per 2026–2027 board guidelines.
            </span>
          </div>
        </label>

        {/* Blueprint Summary Strip */}
        <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Writing Time + Reading</span>
            <span className="font-mono font-medium text-slate-900 tabular-nums">
              {formatDuration(blueprint.durationMinutes)} + {blueprint.readingTimeMinutes}m
            </span>
          </div>
          <div className="space-y-1 text-slate-600">
            {blueprint.sections.map((sec) => (
              <div
                key={sec.code}
                className="flex items-center justify-between gap-2"
              >
                <span className="truncate">{sec.title}</span>
                <span className="font-mono text-slate-800 shrink-0 tabular-nums">
                  {sec.marks}m · {sec.isCompulsory ? 'Compulsory' : `Any ${sec.attemptCount}/${sec.questionCount}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inline Validation Error */}
        {validationError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3 rounded-md border border-rose-200 bg-rose-50 text-xs text-[#9F1239]"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Primary Generate CTA */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full h-11 px-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-65 rounded-md transition-colors cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Assembling ICSE Paper...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>Generate Paper &amp; Answer Sheet</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
          <span>Automatically saves to Paper Library for A4 PDF download</span>
        </p>
      </form>
    </aside>
  );
};
