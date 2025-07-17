import { NextRequest, NextResponse } from 'next/server';
import { AnalysisResults, ErrorResponse, SuccessResponse } from '../../types';

interface GenerateQuestionsRequest {
  cv: string;
  jobDescription: string;
  title?: string;
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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    // Generate questions using OpenRouter API
    const prompt = `As an expert interviewer, analyze this CV and job description to generate relevant interview questions and suggest answers based on the CV content.

CV Content:
${body.cv}

Job Description:
${body.jobDescription}

Generate three types of questions:
1. Behavioral questions that assess soft skills and past experiences
2. Technical questions specific to the required skills and technologies
3. General questions about career goals and job fit

For each question, provide an answer based on the information in the CV. Format the response as a JSON object with this exact structure:
{
  "Behavioral": [{"question": "...", "answer": "..."}],
  "Technical": [{"question": "...", "answer": "..."}],
  "General": [{"question": "...", "answer": "..."}]
}

Each category should have 2-3 questions. Make answers specific to the candidate's CV.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ezyinterview.vercel.app',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-2',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    // Parse the JSON response from the AI
    let results: AnalysisResults;
    try {
      results = JSON.parse(content);
      
      // Validate the response structure
      if (!results.Behavioral || !results.Technical || !results.General) {
        throw new Error('Invalid response structure from AI');
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }

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
