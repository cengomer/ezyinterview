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
    const prompt = `You are an expert interviewer. Your task is to analyze a CV and job description to generate interview questions and answers. You must respond with ONLY a valid JSON object - no other text, no markdown, no explanations.

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
4. Return ONLY the JSON object above - no other text, no markdown formatting
5. The Answers Should should be detailed and specific to the CV and job description
6. Always Follow the STAR method for answers
7. Ensure valid JSON format with proper quotes and commas
8. Do not include any text before or after the JSON object
9. Do not wrap the response in code blocks or markdown`;

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
        // Clean up the content to ensure it's valid JSON
        let jsonContent = content.trim();
        
        // Remove any markdown code block markers if present
        jsonContent = jsonContent.replace(/```json\n?|\n?```/g, '');
        jsonContent = jsonContent.replace(/```\n?|\n?```/g, '');
        
        // Try to extract JSON if it's wrapped in other text
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('No JSON object found in response. Raw content:', jsonContent);
          throw new Error('Invalid response format from AI');
        }
        
        // Parse the extracted JSON
        const jsonStr = jsonMatch[0].trim();
        console.log('Attempting to parse JSON:', jsonStr);
        
        results = JSON.parse(jsonStr);
        
        // Validate the response structure
        if (!results || typeof results !== 'object') {
          throw new Error('Invalid response structure - not an object');
        }

        if (!results.Behavioral || !results.Technical || !results.General) {
          console.error('Missing required categories in results:', Object.keys(results));
          throw new Error('Invalid response structure - missing categories');
        }

        // Validate each category has questions
        if (!Array.isArray(results.Behavioral) || !Array.isArray(results.Technical) || !Array.isArray(results.General)) {
          console.error('Categories are not arrays:', {
            Behavioral: Array.isArray(results.Behavioral),
            Technical: Array.isArray(results.Technical),
            General: Array.isArray(results.General)
          });
          throw new Error('Invalid question array structure');
        }

        // Ensure each category has the correct number of questions
        if (results.Behavioral.length !== 4 || results.Technical.length !== 4 || results.General.length !== 4) {
          console.error('Wrong number of questions:', {
            Behavioral: results.Behavioral.length,
            Technical: results.Technical.length,
            General: results.General.length
          });
          throw new Error('Invalid number of questions');
        }

        // Ensure each question has required fields
        const validateQuestions = (questions: any[]) => {
          return questions.every(q => {
            const isValid = typeof q.question === 'string' && 
                          typeof q.answer === 'string' &&
                          q.question.trim() !== '' &&
                          q.answer.trim() !== '';
            if (!isValid) {
              console.error('Invalid question format:', q);
            }
            return isValid;
          });
        };

        const validBehavioral = validateQuestions(results.Behavioral);
        const validTechnical = validateQuestions(results.Technical);
        const validGeneral = validateQuestions(results.General);

        if (!validBehavioral || !validTechnical || !validGeneral) {
          throw new Error('Invalid question format - missing or empty fields');
        }

      } catch (error) {
        console.error('Error parsing AI response:', error);
        console.error('Raw content:', content);
        throw new Error(error instanceof Error ? error.message : 'Failed to parse AI response');
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
