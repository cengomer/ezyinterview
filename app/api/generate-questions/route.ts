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
    const prompt = `Generate interview questions based on this CV and job description. Return ONLY a JSON object with no additional text.

CV: ${body.cv}

Job: ${body.jobDescription}

Required format:
{
  "Behavioral": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ],
  "Technical": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ],
  "General": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}

Rules: 4 questions per category. Base answers on CV. Technical questions match job requirements. Use STAR method for answers.`;

    // Set up timeout controller
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 90 seconds timeout

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ezyinterview.vercel.app'
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct:free',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500,
          top_p: 0.8,
          frequency_penalty: 0.2,
          presence_penalty: 0.1
        })
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
