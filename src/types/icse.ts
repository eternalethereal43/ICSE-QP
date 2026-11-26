export type SubjectId =
  | 'english-language'
  | 'english-literature'
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'history-civics'
  | 'geography';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Mixed';

export type PaperMarks = 20 | 40 | 80;

export type PaperScope = 'full' | 'chapters';

export interface ChapterItem {
  id: string;
  title: string;
  unit: string;
}

export interface SectionBlueprint {
  code: string;
  title: string;
  subtitle: string;
  marks: number;
  isCompulsory: boolean;
  attemptInstruction: string;
  questionCount: number;
  attemptCount: number;
  structureNotes: string;
}

export interface PaperBlueprint {
  totalMarks: PaperMarks;
  durationMinutes: number;
  readingTimeMinutes: number;
  generalInstructions: string[];
  sections: SectionBlueprint[];
}

export interface SubjectDefinition {
  id: SubjectId;
  name: string;
  shortName: string;
  paperSubtitle: string;
  paperCode: string;
  groupLabel: string;
  chapters: ChapterItem[];
  blueprints: Record<PaperMarks, PaperBlueprint>;
}

export interface PaperConfig {
  subjectId: SubjectId;
  scope: PaperScope;
  chapterIds: string[];
  totalMarks: PaperMarks;
  difficulty: DifficultyLevel;
  competencyFocus: boolean;
}

export interface QuestionSubPart {
  label: string;
  prompt: string;
  marks: number;
  options?: string[];
  correctOption?: string;
  modelAnswer: string;
  markingSteps: string[];
  examinerTip?: string;
}

export interface ExamQuestion {
  questionNumber: string;
  chapterTag: string;
  questionType: 'mcq-group' | 'short-structured' | 'long-structured' | 'composition' | 'comprehension' | 'grammar' | 'extract';
  marks: number;
  stem: string;
  extractText?: string;
  subParts: QuestionSubPart[];
}

export interface ExamSection {
  code: string;
  title: string;
  subtitle: string;
  marks: number;
  isCompulsory: boolean;
  attemptInstruction: string;
  questions: ExamQuestion[];
}

export interface GeneratedPaper {
  id: string;
  createdAt: string;
  title: string;
  subjectId: SubjectId;
  subjectName: string;
  paperSubtitle: string;
  paperCode: string;
  totalMarks: PaperMarks;
  durationMinutes: number;
  readingTimeMinutes: number;
  difficulty: DifficultyLevel;
  competencyFocus: boolean;
  scope: PaperScope;
  chapterTitles: string[];
  generalInstructions: string[];
  sections: ExamSection[];
  isSample?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTag: string;
  commonMistake: string;
  icseMarksHint: string;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'tutor';
  content: string;
  timestamp: string;
}

export interface ConceptLaunchContext {
  subjectId: SubjectId;
  chapterTitle: string;
  questionContext?: string;
  initialMode?: 'quiz' | 'tutor';
}

export interface LibraryFilter {
  subjectId: SubjectId | 'all';
  difficulty: DifficultyLevel | 'all';
  query: string;
}

export interface QuizMasteryRecord {
  id: string;
  subjectId: SubjectId;
  chapterTitle: string;
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
}
