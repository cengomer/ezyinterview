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
    // Validate required fields
    if (!params.jobDescription || !params.cvContent || !params.results) {
      throw new Error('Missing required fields for history');
    }

    // Validate results structure
    if (!params.results.Behavioral || !params.results.Technical || !params.results.General) {
      throw new Error('Invalid results structure');
    }

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
      body: JSON.stringify({
        jobDescription: params.jobDescription,
        cvContent: params.cvContent,
        results: params.results,
        title: params.title || '',
        timestamp: params.timestamp
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to save history');
    }

    console.log('History saved successfully with ID:', data.id);
  } catch (error) {
    console.error('Error saving history:', error);
    throw error;
  }
}
