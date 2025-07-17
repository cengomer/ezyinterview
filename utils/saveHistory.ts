// my-app/utils/saveHistory.ts
import type { AnalysisResults } from '../app/types';
import { auth } from '../app/firebase/firebaseClient';

interface SaveHistoryParams {
  jobDescription: string;
  cvContent: string;
  results: AnalysisResults;
  title?: string;
  timestamp: string;
}

export async function saveHistory(params: SaveHistoryParams): Promise<void> {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/history/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to save history');
    }
  } catch (error) {
    console.error('Error saving history:', error);
    throw error;
  }
}
