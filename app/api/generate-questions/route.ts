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
    const prompt = `You are an expert interviewer. Your task is to analyze a CV and job description to generate interview questions and answers. Respond ONLY with a JSON object in the exact format shown below - no additional text or explanation.

CV Content:
${body.cv}

Job Description:
${body.jobDescription}

Required JSON format:
{
  "Behavioral": [
    {
      "question": "behavioral question 1",
      "answer": "answer based on CV 1"
    },
    {
      "question": "behavioral question 2",
      "answer": "answer based on CV 2"
    },
    {
      "question": "behavioral question 3",
      "answer": "answer based on CV 3"
    },
    {
      "question": "behavioral question 4",
      "answer": "answer based on CV 4"
    }
  ],
  "Technical": [
    {
      "question": "technical question 1",
      "answer": "answer based on CV 1"
    },
    {
      "question": "technical question 2",
      "answer": "answer based on CV 2"
    },
    {
      "question": "technical question 3",
      "answer": "answer based on CV 3"
    },
    {
      "question": "technical question 4",
      "answer": "answer based on CV 4"
    }
  ],
  "General": [
    {
      "question": "general question 1",
      "answer": "answer based on CV 1"
    },
    {
      "question": "general question 2",
      "answer": "answer based on CV 2"
    },
    {
      "question": "general question 3",
      "answer": "answer based on CV 3"
    },
    {
      "question": "general question 4",
      "answer": "answer based on CV 4"
    }
  ]
}

Rules:
1. Generate exactly 4 questions for each category
2. Base answers on specific information from the CV
3. Technical questions should match job requirements
4. Return ONLY the JSON - no other text
5. The Answers Should should be detailed and specific to the CV and job description
6. Always Follow the STAR method for answers
7. Ensure valid JSON format with proper quotes and commas`;

    // Set up timeout controller
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 90 seconds timeout

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-0528:free',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: false,
          frequency_penalty: 0,
          presence_penalty: 0,
          top_p: 0.9,
          timeout: 90
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenRouter API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const aiResponse = await response.json();
      
      if (!aiResponse.choices?.[0]?.message?.content) {
        console.error('Invalid AI response structure:', aiResponse);
        throw new Error('Invalid response from AI service');
      }

      const content = aiResponse.choices[0].message.content;
      console.log('Raw AI response:', content);

      // Parse the JSON response from the AI
      let results: AnalysisResults;
      try {
        // Try to extract JSON if it's wrapped in other text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonContent = jsonMatch ? jsonMatch[0] : content;
        
        results = JSON.parse(jsonContent);
        
        // Validate the response structure
        if (!results.Behavioral || !results.Technical || !results.General) {
          console.error('Invalid results structure:', results);
          throw new Error('Invalid response structure from AI');
        }

        // Validate each category has questions
        if (!Array.isArray(results.Behavioral) || !Array.isArray(results.Technical) || !Array.isArray(results.General)) {
          throw new Error('Invalid question array structure');
        }

        // Ensure each question has required fields
        const validateQuestions = (questions: any[]) => {
          return questions.every(q => typeof q.question === 'string' && typeof q.answer === 'string');
        };

        if (!validateQuestions(results.Behavioral) || !validateQuestions(results.Technical) || !validateQuestions(results.General)) {
          throw new Error('Invalid question format');
        }

      } catch (error) {
        console.error('Error parsing AI response:', error);
        console.error('Raw content:', content);
        throw new Error('Failed to parse AI response');
      }

      return NextResponse.json<SuccessResponse<GenerateResponse>>({
        success: true,
        data: { results }
      });

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Request timed out:', error);
        return NextResponse.json<ErrorResponse>({
          error: 'Request timed out. Please try again.'
        }, { status: 504 });
      }
      throw error;
    }

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json<ErrorResponse>({
      error: error instanceof Error ? error.message : 'Failed to generate questions'
    }, { status: 500 });
  }
}
