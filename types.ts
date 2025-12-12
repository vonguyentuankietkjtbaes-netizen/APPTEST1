export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

export interface Question {
  id: string;
  topic: string;
  text: string;
  context?: string; // Additional context if needed
  difficulty: number; // 1-5
}

export interface Assessment {
  score: number; // 0-100 or 0-10
  correction: string; // The corrected sentence
  feedback: string; // Encouraging feedback in Vietnamese
  praise: string; // A short praise (Good job, Excellent, etc.)
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  userAnswer: string;
  assessment: Assessment;
  timestamp: number;
}

export enum AppState {
  IDLE,
  LOADING,
  ANSWERING,
  GRADING,
  REVIEW,
  COMPLETE
}

// Mock data structure for Teacher View
export interface StudentProgress {
  studentName: string;
  topic: string;
  questionsAnswered: number;
  averageScore: number;
  lastActive: string;
}