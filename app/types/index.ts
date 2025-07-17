export interface CVProfile {
  summary: string;
  fileName: string;
  fileSize: number;
  extractedText: string;
  updatedAt: any; // Firestore timestamp
}

export interface AnalysisResults {
  Behavioral: QuestionAnswer[];
  Technical: QuestionAnswer[];
  General: QuestionAnswer[];
}

export interface QuestionAnswer {
  question: string;
  answer: string;
  category?: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  language?: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: unknown;
} 