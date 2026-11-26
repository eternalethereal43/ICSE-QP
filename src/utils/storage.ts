import { SAMPLE_PHYSICS_PAPER } from '../data/samplePaper';
import type { GeneratedPaper, QuizMasteryRecord } from '../types/icse';

const PAPERS_STORAGE_KEY = 'scholaris_icse_saved_papers_v1';
const MASTERY_STORAGE_KEY = 'scholaris_icse_quiz_mastery_v1';

export function loadSavedPapers(): GeneratedPaper[] {
  try {
    const raw = window.localStorage.getItem(PAPERS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(PAPERS_STORAGE_KEY, JSON.stringify([SAMPLE_PHYSICS_PAPER]));
      return [SAMPLE_PHYSICS_PAPER];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(PAPERS_STORAGE_KEY, JSON.stringify([SAMPLE_PHYSICS_PAPER]));
      return [SAMPLE_PHYSICS_PAPER];
    }
    return parsed as GeneratedPaper[];
  } catch {
    return [SAMPLE_PHYSICS_PAPER];
  }
}

export function savePaperToLibrary(paper: GeneratedPaper): GeneratedPaper[] {
  const existing = loadSavedPapers();
  const deduped = [paper, ...existing.filter((p) => p.id !== paper.id)].slice(0, 40);
  try {
    window.localStorage.setItem(PAPERS_STORAGE_KEY, JSON.stringify(deduped));
  } catch {
    // Ignore storage quota errors gracefully
  }
  return deduped;
}

export function deletePaperFromLibrary(paperId: string): GeneratedPaper[] {
  const existing = loadSavedPapers();
  const updated = existing.filter((p) => p.id !== paperId);
  try {
    window.localStorage.setItem(PAPERS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
  return updated;
}

export function loadMasteryRecords(): QuizMasteryRecord[] {
  try {
    const raw = window.localStorage.getItem(MASTERY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QuizMasteryRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveMasteryRecord(record: QuizMasteryRecord): QuizMasteryRecord[] {
  const existing = loadMasteryRecords();
  const updated = [record, ...existing].slice(0, 50);
  try {
    window.localStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
  return updated;
}
