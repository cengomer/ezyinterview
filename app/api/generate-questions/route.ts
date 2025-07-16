import { NextRequest, NextResponse } from 'next/server';
import { AnalysisResults, ErrorResponse, SuccessResponse } from '../../types';

interface GenerateQuestionsRequest {
  cv: string;
  jobDescription: string;
  title?: string;
}

interface QuestionMatch {
  question: string;
  score: number;
}

interface AnswerMatch {
  answer: string;
  score: number;
}

interface GenerateResponse {
  results: AnalysisResults;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GenerateQuestionsRequest;
    
    if (!body.cv || !body.jobDescription) {
      return NextResponse.json<ErrorResponse>({
        error: 'Both CV and job description are required'
      }, { status: 400 });
    }

    // Mock AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Process the CV and job description to generate questions
    const results = await generateQuestions(body.cv, body.jobDescription);

    return NextResponse.json<SuccessResponse<GenerateResponse>>({
      success: true,
      data: { results }
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json<ErrorResponse>({
      error: error instanceof Error ? error.message : 'Failed to generate questions'
    }, { status: 500 });
  }
}

async function generateQuestions(cv: string, jobDescription: string): Promise<AnalysisResults> {
  // Mock question generation logic
  const behavioralQuestions = [
    {
      question: "Tell me about a challenging project you worked on.",
      answer: "Focus on describing the challenge, your actions, and the positive outcome."
    },
    {
      question: "How do you handle tight deadlines?",
      answer: "Explain your time management and prioritization strategies."
    }
  ];

  const technicalQuestions = [
    {
      question: "Explain your experience with the technologies mentioned in your CV.",
      answer: "Highlight specific projects and technical challenges you've overcome."
    },
    {
      question: "How do you stay updated with industry trends?",
      answer: "Discuss your learning methods and professional development."
    }
  ];

  const generalQuestions = [
    {
      question: "Why are you interested in this position?",
      answer: "Connect your skills and experience to the job requirements."
    },
    {
      question: "Where do you see yourself in 5 years?",
      answer: "Align your career goals with the company's growth opportunities."
    }
  ];

  // Process CV and job description to find relevant matches
  const questionKeywords = extractKeywords(cv);
  const answerKeywords = extractKeywords(jobDescription);

  // Find matches (currently unused in mock implementation)
  findMatches(questionKeywords);
  findMatches(answerKeywords);

  return {
    Behavioral: behavioralQuestions,
    Technical: technicalQuestions,
    General: generalQuestions
  };
}

function extractKeywords(text: string): string[] {
  // Mock keyword extraction
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

function findMatches(keywords: string[]): Array<QuestionMatch | AnswerMatch> {
  // Mock matching logic
  return keywords.map(keyword => ({
    question: `Question about ${keyword}`,
    answer: `Sample answer about ${keyword}`,
    score: Math.random()
  }));
}
