// my-app/utils/saveHistory.ts
import type { AnalysisResults } from '../app/types';

interface SaveHistoryParams {
  jobDescription: string;
  cvContent: string;
  results: AnalysisResults;
  title?: string;
  timestamp: string;
}

export async function saveHistory(params: SaveHistoryParams): Promise<void> {
  try {
    const response = await fetch('/api/history/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
