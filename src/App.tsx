import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { ConceptStudio } from './components/ConceptStudio';
import { DocumentTab, ExamDocumentStage } from './components/ExamDocumentStage';
import { PaperConfigRail } from './components/PaperConfigRail';
import { PaperLibrary } from './components/PaperLibrary';
import { AppView, TopBar } from './components/TopBar';
import { getSubjectById } from './data/icseCurriculum';
import { SAMPLE_PHYSICS_PAPER } from './data/samplePaper';
import type {
  ConceptLaunchContext,
  GeneratedPaper,
  PaperConfig,
  QuizMasteryRecord,
} from './types/icse';
import { validatePaperConfig } from './utils/paperLogic';
import { exportAnswerSheetPdf, exportQuestionPaperPdf } from './utils/pdfExporter';
import {
  deletePaperFromLibrary,
  loadMasteryRecords,
  loadSavedPapers,
  saveMasteryRecord,
  savePaperToLibrary,
} from './utils/storage';

const GENERATION_STAGES = [
  'Mapping 2026–2027 CISCE syllabus chapters...',
  'Drafting Section A compulsory MCQs and short answers...',
  'Composing Section B structured choice questions...',
  'Writing CISCE step-by-step marking scheme & examiner notes...',
];

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('studio');
  const [savedPapers, setSavedPapers] = useState<GeneratedPaper[]>(() =>
    loadSavedPapers(),
  );
  const [activePaper, setActivePaper] = useState<GeneratedPaper | null>(
    () => loadSavedPapers()[0] ?? SAMPLE_PHYSICS_PAPER,
  );
  const [documentTab, setDocumentTab] = useState<DocumentTab>('question');

  const [config, setConfig] = useState<PaperConfig>({
    subjectId: 'physics',
    scope: 'chapters',
    chapterIds: ['phy-force', 'phy-lens', 'phy-current'],
    totalMarks: 40,
    difficulty: 'Mixed',
    competencyFocus: true,
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [conceptContext, setConceptContext] = useState<ConceptLaunchContext | null>(
    null,
  );
  const [masteryHistory, setMasteryHistory] = useState<QuizMasteryRecord[]>(() =>
    loadMasteryRecords(),
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isGenerating) {
      setStageIdx(0);
      return;
    }
    const timer = window.setInterval(() => {
      setStageIdx((prev) => (prev + 1) % GENERATION_STAGES.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleConfigChange = (next: PaperConfig) => {
    setConfig(next);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleGeneratePaper = async () => {
    const check = validatePaperConfig(config);
    if (!check.valid) {
      setValidationError(check.error ?? 'Please check your paper settings.');
      return;
    }

    setValidationError(null);
    setGenerationError(null);
    setIsGenerating(true);
    setActiveView('studio');

    try {
      const response = await fetch('/api/papers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate ICSE question paper.');
      }
      const generated: GeneratedPaper = data.paper;
      const updatedLibrary = savePaperToLibrary(generated);
      setSavedPapers(updatedLibrary);
      setActivePaper(generated);
      setDocumentTab('question');
      showToast(
        `${generated.subjectName} (${generated.totalMarks} Marks) generated and saved to Paper Library.`,
      );
    } catch (err) {
      setGenerationError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while generating the paper.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadQuestionPdf = (paper: GeneratedPaper | null) => {
    if (!paper) return;
    const filename = exportQuestionPaperPdf(paper);
    showToast(`Downloaded ${filename}`);
  };

  const handleDownloadAnswerPdf = (paper: GeneratedPaper | null) => {
    if (!paper) return;
    const filename = exportAnswerSheetPdf(paper);
    showToast(`Downloaded ${filename}`);
  };

  const handleOpenLibraryPaper = (paper: GeneratedPaper) => {
    setActivePaper(paper);
    setDocumentTab('question');
    setGenerationError(null);
    setActiveView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePaper = (paperId: string) => {
    const updated = deletePaperFromLibrary(paperId);
    setSavedPapers(updated);
    if (activePaper?.id === paperId) {
      setActivePaper(updated[0] ?? null);
    }
    showToast('Removed paper from Paper Library.');
  };

  const handleLaunchConcept = (ctx: ConceptLaunchContext) => {
    setConceptContext(ctx);
    setActiveView('concept');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewPaperFocus = () => {
    setActiveView('studio');
    setGenerationError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const subjectEl = document.getElementById('icse-subject-select');
    if (subjectEl) {
      subjectEl.focus();
    }
  };

  const handleSaveMastery = (record: QuizMasteryRecord) => {
    const updated = saveMasteryRecord(record);
    setMasteryHistory(updated);
  };

  const currentSubjectName = getSubjectById(config.subjectId).name;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <TopBar
        activeView={activeView}
        onNavigate={setActiveView}
        onNewPaper={handleNewPaperFocus}
        savedCount={savedPapers.length}
      />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeView === 'studio' && (
          <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
            <PaperConfigRail
              config={config}
              onChange={handleConfigChange}
              onGenerate={() => void handleGeneratePaper()}
              isGenerating={isGenerating}
              validationError={validationError}
            />

            <ExamDocumentStage
              paper={activePaper}
              activeTab={documentTab}
              onTabChange={setDocumentTab}
              isGenerating={isGenerating}
              generationStageText={`${currentSubjectName} · ${GENERATION_STAGES[stageIdx]}`}
              errorMessage={generationError}
              onRetryGenerate={() => void handleGeneratePaper()}
              onDownloadQuestionPdf={() => handleDownloadQuestionPdf(activePaper)}
              onDownloadAnswerPdf={() => handleDownloadAnswerPdf(activePaper)}
              onLaunchConcept={handleLaunchConcept}
            />
          </div>
        )}

        {activeView === 'concept' && (
          <ConceptStudio
            launchContext={conceptContext}
            onClearContext={() => setConceptContext(null)}
            onSaveMastery={handleSaveMastery}
            masteryHistory={masteryHistory}
          />
        )}

        {activeView === 'library' && (
          <PaperLibrary
            papers={savedPapers}
            onOpenPaper={handleOpenLibraryPaper}
            onDownloadQuestionPdf={handleDownloadQuestionPdf}
            onDownloadAnswerPdf={handleDownloadAnswerPdf}
            onDeletePaper={handleDeletePaper}
            onCreateNew={handleNewPaperFocus}
          />
        )}
      </main>

      <footer className="no-print border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Scholaris ICSE · Class X Examination Studio (2026–2027 CISCE Syllabus)</span>
          <span>8 Core Subjects · Separate Question &amp; Answer A4 PDFs</span>
        </div>
      </footer>

      {/* Non-intrusive Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-xs sm:text-sm"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span className="leading-snug">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
