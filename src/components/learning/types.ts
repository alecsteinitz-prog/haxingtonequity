// Learning Tab Types

export interface LearningPath {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  modules: LearningModule[];
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  content: LessonContent[];
  relatedTerms: string[];
}

export interface LessonContent {
  type: 'text' | 'tip' | 'example' | 'quiz';
  content: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  example: string;
  category: string;
  relatedLessons?: string[];
}

export interface UserProgress {
  pathId: string;
  completedModules: string[];
  currentModuleId?: string;
}
