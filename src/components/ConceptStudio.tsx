import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  X,
  XCircle,
} from 'lucide-react';
import { ICSE_SUBJECTS, getSubjectById } from '../data/icseCurriculum';
import { SAMPLE_CONCEPT_QUIZ } from '../data/samplePaper';
import { scoreQuiz } from '../utils/paperLogic';
import type {
  ConceptLaunchContext,
  DifficultyLevel,
  QuizMasteryRecord,
  QuizQuestion,
  SubjectId,
  TutorMessage,
} from '../types/icse';

interface ConceptStudioProps {
  launchContext: ConceptLaunchContext | null;
  onClearContext: () => void;
  onSaveMastery: (record: QuizMasteryRecord) => void;
  masteryHistory: QuizMasteryRecord[];
}

type StudioMode = 'quiz' | 'tutor';

const DIFFICULTIES: DifficultyLevel[] = ['Easy', 'Medium', 'Hard', 'Mixed'];

const TUTOR_QUICK_PROMPTS = [
  'Explain the core concept step by step for an ICSE board answer',
  'What are the most common mistakes ICSE students lose marks on here?',
  'Walk me through a typical 4-mark ICSE board question from this chapter',
  'Ask me 2 quick conceptual questions to test my understanding',
];

export const ConceptStudio: React.FC<ConceptStudioProps> = ({
  launchContext,
  onClearContext,
  onSaveMastery,
  masteryHistory,
}) => {
  const [subjectId, setSubjectId] = useState<SubjectId>(
    launchContext?.subjectId ?? 'physics',
  );
  const subject = useMemo(() => getSubjectById(subjectId), [subjectId]);

  const [chapterTitle, setChapterTitle] = useState<string>(
    launchContext?.chapterTitle ?? subject.chapters[0].title,
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Mixed');
  const [mode, setMode] = useState<StudioMode>(launchContext?.initialMode ?? 'quiz');
  const [activeQuestionContext, setActiveQuestionContext] = useState<string | undefined>(
    launchContext?.questionContext,
  );

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(SAMPLE_CONCEPT_QUIZ);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Tutor state
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'welcome-tutor',
      role: 'tutor',
      content:
        'Welcome to the ICSE Concept Tutor. Pick any chapter above and ask a doubt, paste a tricky numerical, or choose one of the guided prompts below. We will break it down step by step using exact CISCE board terminology.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Sync when launched from a specific paper question
  useEffect(() => {
    if (!launchContext) return;
    setSubjectId(launchContext.subjectId);
    const targetSub = getSubjectById(launchContext.subjectId);
    const matchedChapter = targetSub.chapters.find((c) =>
      c.title.toLowerCase().includes(launchContext.chapterTitle.toLowerCase().slice(0, 12)),
    );
    setChapterTitle(matchedChapter ? matchedChapter.title : launchContext.chapterTitle);
    setActiveQuestionContext(launchContext.questionContext);
    if (launchContext.initialMode) {
      setMode(launchContext.initialMode);
    }
  }, [launchContext]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, tutorLoading]);

  const handleSubjectSwitch = (nextId: SubjectId) => {
    const nextSubject = getSubjectById(nextId);
    setSubjectId(nextId);
    setChapterTitle(nextSubject.chapters[0].title);
    setActiveQuestionContext(undefined);
    onClearContext();
  };

  const generateFreshQuiz = async (focusPrompt?: string) => {
    setQuizLoading(true);
    setQuizError(null);
    setQuizFinished(false);
    setSelectedAnswers({});
    setCheckedQuestions({});
    setQuizIndex(0);

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          chapterTitle,
          difficulty,
          questionCount: 5,
          focusPrompt: focusPrompt || activeQuestionContext,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not generate chapter quiz.');
      }
      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('No quiz questions returned. Please try again.');
      }
      setQuizQuestions(data.questions);
    } catch (err) {
      setQuizError(
        err instanceof Error ? err.message : 'Unable to generate quiz right now.',
      );
    } finally {
      setQuizLoading(false);
    }
  };

  const currentQuestion = quizQuestions[quizIndex];
  const selectedOption = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;
  const isCurrentChecked = currentQuestion ? Boolean(checkedQuestions[currentQuestion.id]) : false;
  const scoreSummary = useMemo(
    () => scoreQuiz(quizQuestions, selectedAnswers),
    [quizQuestions, selectedAnswers],
  );

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion || isCurrentChecked) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion || typeof selectedOption !== 'number') return;
    setCheckedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: true,
    }));
  };

  const handleNextQuestion = () => {
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      const summary = scoreQuiz(quizQuestions, selectedAnswers);
      onSaveMastery({
        id: `mastery-${Date.now()}`,
        subjectId,
        chapterTitle,
        score: summary.correctCount,
        total: summary.totalQuestions,
        percentage: summary.percentage,
        completedAt: new Date().toISOString(),
      });
    }
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setCheckedQuestions({});
    setQuizIndex(0);
    setQuizFinished(false);
  };

  const sendTutorMessage = async (textOverride?: string) => {
    const content = (textOverride ?? tutorInput).trim();
    if (!content || tutorLoading) return;

    const userMsg: TutorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setTutorInput('');
    setTutorError(null);
    setTutorLoading(true);

    try {
      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          chapterTitle,
          questionContext: activeQuestionContext,
          messages: nextHistory
            .filter((m) => m.id !== 'welcome-tutor')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not reach Concept Tutor.');
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `tutor-${Date.now()}`,
          role: 'tutor',
          content: data.reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setTutorError(
        err instanceof Error ? err.message : 'Unable to send message right now.',
      );
    } finally {
      setTutorLoading(false);
    }
  };

  const handleAskTutorFromQuiz = (q: QuizQuestion) => {
    setMode('tutor');
    const prompt = `Can you explain this question step by step? "${q.question}" — I want to understand why "${q.options[q.correctIndex]}" is the right ICSE answer and how to avoid mistakes on "${q.conceptTag}".`;
    void sendTutorMessage(prompt);
  };

  const recentMastery = masteryHistory.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Studio Context Bar */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-editorial text-2xl font-semibold text-slate-900">
              Online Concept Clearance Studio
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Test chapter understanding with ICSE competency questions or clear doubts step by step with your tutor.
            </p>
          </div>

          {/* Mode Switch */}
          <div
            role="tablist"
            aria-label="Concept clearance mode"
            className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-md"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'quiz'}
              onClick={() => setMode('quiz')}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'quiz'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interactive Chapter Quiz
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'tutor'}
              onClick={() => setMode('tutor')}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'tutor'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Step-by-Step Concept Tutor
            </button>
          </div>
        </div>

        {/* Subject, Chapter, Difficulty Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="md:col-span-3">
            <label
              htmlFor="concept-subject"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Subject
            </label>
            <select
              id="concept-subject"
              value={subjectId}
              onChange={(e) => handleSubjectSwitch(e.target.value as SubjectId)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900"
            >
              {ICSE_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label
              htmlFor="concept-chapter"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Chapter / Topic
            </label>
            <select
              id="concept-chapter"
              value={
                subject.chapters.some((c) => c.title === chapterTitle)
                  ? chapterTitle
                  : subject.chapters[0].title
              }
              onChange={(e) => setChapterTitle(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900"
            >
              {subject.chapters.map((ch) => (
                <option key={ch.id} value={ch.title}>
                  {ch.title}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="concept-difficulty"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Difficulty
            </label>
            <select
              id="concept-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="button"
              onClick={() => void generateFreshQuiz()}
              disabled={quizLoading}
              className="w-full h-10 px-3 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-60 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              {quizLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
              )}
              <span>New Quiz</span>
            </button>
          </div>
        </div>

        {/* Active Exam Question Handoff Context */}
        {activeQuestionContext && (
          <div className="flex items-start justify-between gap-3 p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <div className="space-y-0.5">
              <span className="font-semibold text-[#1E3A5F] block">
                Focused on Paper Question
              </span>
              <p className="leading-relaxed line-clamp-2">{activeQuestionContext}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveQuestionContext(undefined);
                onClearContext();
              }}
              aria-label="Clear focused paper question context"
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Main Mode Workspace */}
      {mode === 'quiz' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Quiz Card */}
          <section className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-6 sm:p-8">
            {quizLoading ? (
              <div className="py-12 text-center space-y-3" aria-live="polite">
                <Loader2 className="w-7 h-7 text-[#1E3A5F] animate-spin mx-auto" />
                <h2 className="font-editorial text-xl font-semibold text-slate-900">
                  Building your ICSE chapter checkup...
                </h2>
                <p className="text-sm text-slate-600">
                  Creating competency questions and examiner explanations for {chapterTitle}.
                </p>
              </div>
            ) : quizError ? (
              <div role="alert" className="py-8 text-center space-y-3">
                <AlertCircle className="w-7 h-7 text-[#9F1239] mx-auto" />
                <p className="text-sm text-slate-700">{quizError}</p>
                <button
                  type="button"
                  onClick={() => void generateFreshQuiz()}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#1E3A5F] rounded-md cursor-pointer"
                >
                  Retry Quiz Generation
                </button>
              </div>
            ) : quizFinished ? (
              <div className="py-4 space-y-6">
                <div className="border-b border-slate-200 pb-5">
                  <p className="text-xs font-mono text-slate-500">
                    Chapter Checkup Complete · {subject.name}
                  </p>
                  <h2 className="mt-1 font-editorial text-2xl font-semibold text-slate-900">
                    {scoreSummary.correctCount} of {scoreSummary.totalQuestions} Correct ({scoreSummary.percentage}%)
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-600">
                    Readiness status:{' '}
                    <span className="font-semibold text-slate-900">
                      {scoreSummary.band}
                    </span>
                  </p>
                </div>

                <div className="space-y-3">
                  {quizQuestions.map((q, idx) => {
                    const userChoice = selectedAnswers[q.id];
                    const right = userChoice === q.correctIndex;
                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-md border border-slate-200 bg-slate-50/70 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">
                            {idx + 1}. {q.question}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                              right ? 'text-emerald-700' : 'text-[#9F1239]'
                            }`}
                          >
                            {right ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                                <span>Correct</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" aria-hidden="true" />
                                <span>Review</span>
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700">
                          Correct Answer:{' '}
                          <span className="font-semibold">{q.options[q.correctIndex]}</span>
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRetakeQuiz}
                    className="px-4 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-md cursor-pointer"
                  >
                    Retake Same Quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => void generateFreshQuiz()}
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded-md cursor-pointer"
                  >
                    Generate Fresh Questions
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('tutor')}
                    className="px-4 py-2 text-sm font-medium text-[#1E3A5F] hover:underline cursor-pointer"
                  >
                    Discuss Doubts with Tutor
                  </button>
                </div>
              </div>
            ) : currentQuestion ? (
              <div className="space-y-6">
                {/* Quiz Progress Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 text-xs text-slate-600 tabular-nums">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-900">
                      Question {quizIndex + 1} of {quizQuestions.length}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{currentQuestion.conceptTag}</span>
                  </div>
                  <span>{currentQuestion.icseMarksHint}</span>
                </div>

                {/* Question Prompt */}
                <h2 className="text-lg font-semibold text-slate-950 leading-relaxed font-sans">
                  {currentQuestion.question}
                </h2>

                {/* Options */}
                <div className="space-y-2.5" role="radiogroup" aria-label="Answer options">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectOption = idx === currentQuestion.correctIndex;

                    let stateClass =
                      'border-slate-200 bg-white hover:border-slate-400 text-slate-800';
                    if (isCurrentChecked) {
                      if (isCorrectOption) {
                        stateClass =
                          'border-emerald-600 bg-emerald-50 text-emerald-950 font-medium';
                      } else if (isSelected && !isCorrectOption) {
                        stateClass =
                          'border-rose-500 bg-rose-50 text-rose-950';
                      } else {
                        stateClass = 'border-slate-200 bg-slate-50/50 text-slate-500';
                      }
                    } else if (isSelected) {
                      stateClass =
                        'border-[#1E3A5F] bg-[#1E3A5F]/5 text-slate-950 font-medium';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={isCurrentChecked}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left px-4 py-3.5 rounded-md border text-sm transition-colors flex items-start justify-between gap-3 cursor-pointer disabled:cursor-default ${stateClass}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-xs font-semibold mt-0.5 shrink-0">
                            ({String.fromCharCode(97 + idx)})
                          </span>
                          <span className="leading-snug">{option}</span>
                        </div>
                        {isCurrentChecked && isCorrectOption && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0">
                            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                            <span>Correct</span>
                          </span>
                        )}
                        {isCurrentChecked && isSelected && !isCorrectOption && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#9F1239] shrink-0">
                            <XCircle className="w-4 h-4" aria-hidden="true" />
                            <span>Incorrect</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Drawer after checking */}
                {isCurrentChecked && (
                  <div className="p-4 sm:p-5 rounded-md bg-slate-50 border border-slate-200 space-y-2.5 text-sm">
                    <div className="flex items-center gap-2 font-semibold">
                      {selectedOption === currentQuestion.correctIndex ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          <span>Spot on — ICSE Concept Mastered</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[#9F1239]">
                          <XCircle className="w-4 h-4" aria-hidden="true" />
                          <span>Let&apos;s clear this concept</span>
                        </span>
                      )}
                    </div>
                    <p className="text-slate-800 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                    <p className="text-xs text-[#9F1239] pt-2 border-t border-slate-200 leading-relaxed">
                      <span className="font-semibold">Common ICSE Trap: </span>
                      {currentQuestion.commonMistake}
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleAskTutorFromQuiz(currentQuestion)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Ask Tutor to Explain Further</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Footer */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 tabular-nums">
                    Score so far: {scoreSummary.correctCount} / {scoreSummary.answeredCount}
                  </span>
                  {!isCurrentChecked ? (
                    <button
                      type="button"
                      disabled={typeof selectedOption !== 'number'}
                      onClick={handleCheckAnswer}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-45 rounded-md transition-colors cursor-pointer"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded-md transition-colors cursor-pointer"
                    >
                      <span>
                        {quizIndex + 1 < quizQuestions.length
                          ? 'Next Question'
                          : 'View Results'}
                      </span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </section>

          {/* Right Mastery & Study Aid Column */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
              <h3 className="font-editorial text-lg font-semibold text-slate-900">
                Quick Concept Check
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select any subject and chapter above, then click <strong>New Quiz</strong> to generate fresh ICSE competency questions tailored to that chapter.
              </p>
              <button
                type="button"
                onClick={() => setMode('tutor')}
                className="w-full py-2.5 px-3 text-xs font-semibold text-[#1E3A5F] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
              >
                Switch to Step-by-Step Tutor
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
              <h3 className="font-editorial text-lg font-semibold text-slate-900">
                Recent Quiz Progress
              </h3>
              {recentMastery.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Complete a chapter quiz to track readiness across ICSE units.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentMastery.map((rec) => (
                    <li key={rec.id} className="py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium text-slate-900 truncate">
                          {rec.chapterTitle}
                        </span>
                        <span className="font-mono font-semibold text-[#1E3A5F] shrink-0 tabular-nums">
                          {rec.percentage}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                        {getSubjectById(rec.subjectId).shortName} · {rec.score}/{rec.total} correct
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      ) : (
        /* Step-by-Step Concept Tutor Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-8 bg-white border border-slate-200 rounded-lg flex flex-col min-h-[540px] max-h-[680px]">
            {/* Tutor Thread */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-[#1E3A5F] text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  >
                    <span
                      className={`block text-[11px] font-semibold mb-1 ${
                        msg.role === 'user' ? 'text-slate-200' : 'text-[#1E3A5F]'
                      }`}
                    >
                      {msg.role === 'user' ? 'Student' : 'ICSE Concept Tutor'}
                    </span>
                    {msg.content}
                  </div>
                </div>
              ))}

              {tutorLoading && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1E3A5F]" />
                    <span>Preparing step-by-step explanation...</span>
                  </div>
                </div>
              )}

              {tutorError && (
                <div
                  role="alert"
                  className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-[#9F1239]"
                >
                  {tutorError}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendTutorMessage();
              }}
              className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-end gap-2.5"
            >
              <label htmlFor="tutor-question-input" className="sr-only">
                Ask your ICSE concept doubt
              </label>
              <textarea
                id="tutor-question-input"
                rows={2}
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendTutorMessage();
                  }
                }}
                placeholder={`Ask any doubt from ${chapterTitle}...`}
                className="flex-1 resize-none px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
              />
              <button
                type="submit"
                disabled={tutorLoading || !tutorInput.trim()}
                aria-label="Send message to Concept Tutor"
                className="h-11 px-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-50 rounded-md transition-colors shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Ask</span>
              </button>
            </form>
          </section>

          {/* Guided Socratic Prompts */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 space-y-3">
            <h3 className="font-editorial text-lg font-semibold text-slate-900">
              Guided Doubt Prompts
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Click any prompt to start a structured ICSE Class X walkthrough for{' '}
              <span className="font-semibold text-slate-800">{chapterTitle}</span>.
            </p>
            <div className="space-y-2 pt-1">
              {TUTOR_QUICK_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={tutorLoading}
                  onClick={() => void sendTutorMessage(promptText)}
                  className="w-full text-left p-3 rounded-md border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#1E3A5F] text-xs text-slate-800 transition-colors cursor-pointer"
                >
                  {promptText}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
