import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { cvSummary, jobDescription } = await req.json();

    // Validate inputs
    if (!cvSummary || typeof cvSummary !== "string" || cvSummary.trim().length === 0) {
      return NextResponse.json({ success: false, error: "CV summary is required." }, { status: 400 });
    }
    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.length < 100) {
      return NextResponse.json({ success: false, error: "Job description too short (min 100 characters)." }, { status: 400 });
    }

    console.log("[DEBUG] CV summary length:", cvSummary.length);
    console.log("[DEBUG] CV summary preview:", cvSummary.slice(0, 500));
    console.log("[DEBUG] Job description length:", jobDescription.length);

    // Prompt: use CV summary for better question generation
    const prompt = `Generate 5 interview questions for each category: Behavioral, Technical, General. For each question, provide a model answer based on the candidate's CV summary. Use specific details from the CV. If insufficient information, say: 'Not enough information in CV to answer specifically.' Respond ONLY with valid JSON: {"Behavioral": [{"question": "...", "answer": "..."}], "Technical": [...], "General": [...]}. Use double quotes. No extra text.

CV Summary:
${cvSummary}

Job Description:
${jobDescription}`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API configuration error." }, { status: 500 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // Increased to 2 minutes
    let aiResponse: string | undefined = undefined;
    try {
      console.log("[DEBUG] Starting AI request...");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 6000
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      console.log("[DEBUG] AI response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("[DEBUG] AI service error response:", errorData);
        return NextResponse.json({ success: false, error: "AI service temporarily unavailable." }, { status: 500 });
      }
      const data = await response.json();
      aiResponse = data.choices?.[0]?.message?.content;
      if (!aiResponse) {
        console.error("[DEBUG] No AI response content");
        return NextResponse.json({ success: false, error: "No response from AI service." }, { status: 500 });
      }
      console.log("[DEBUG] AI Response received, length:", aiResponse.length);
      console.log("[DEBUG] AI Response preview:", aiResponse.slice(0, 500));
    } catch (err: any) {
      clearTimeout(timeout);
      console.error("[DEBUG] AI service error:", err);
      if (err.name === 'AbortError') {
        return NextResponse.json({ success: false, error: "Request timed out. Please try again." }, { status: 500 });
      }
      return NextResponse.json({ success: false, error: "AI service error. Please try again later." }, { status: 500 });
    }

    // Parse AI response robustly
    function tryFixAndParseJSON(str: string): any {
      let fixed = str.trim();
      if (fixed.startsWith('```json')) {
        fixed = fixed.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (fixed.startsWith('```')) {
        fixed = fixed.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to find complete JSON structure
      const firstBrace = fixed.indexOf('{');
      const lastBrace = fixed.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        fixed = fixed.slice(firstBrace, lastBrace + 1);
      }
      
      try {
        return JSON.parse(fixed);
      } catch (e) {
        console.error("[DEBUG] JSON parsing failed:", e);
        console.error("[DEBUG] Attempted to parse:", fixed.slice(0, 500));
        
        // Try to extract partial questions if JSON is incomplete
        try {
          const partialQuestions = extractPartialQuestions(fixed);
          if (partialQuestions && Object.keys(partialQuestions).length > 0) {
            console.log("[DEBUG] Extracted partial questions:", Object.keys(partialQuestions));
            return partialQuestions;
          }
        } catch (partialErr) {
          console.error("[DEBUG] Partial extraction failed:", partialErr);
        }
        
        return null;
      }
    }

    function extractPartialQuestions(str: string): any {
      const result: any = { Behavioral: [], Technical: [], General: [] };
      
      // Try to extract complete question-answer pairs
      const questionPattern = /"question":\s*"([^"]+)"/g;
      const answerPattern = /"answer":\s*"([^"]+)"/g;
      
      let questionMatches = [...str.matchAll(questionPattern)];
      let answerMatches = [...str.matchAll(answerPattern)];
      
      // Match questions with answers
      const minMatches = Math.min(questionMatches.length, answerMatches.length);
      for (let i = 0; i < minMatches; i++) {
        const question = questionMatches[i][1];
        const answer = answerMatches[i][1];
        
        // Determine category based on position or content
        let category = 'General';
        if (i < 5) category = 'Behavioral';
        else if (i < 10) category = 'Technical';
        else category = 'General';
        
        result[category].push({ question, answer });
      }
      
      return result;
    }

    function isValidQAArray(arr: any): boolean {
      return Array.isArray(arr) && arr.every(
        (item) => typeof item === 'object' && typeof item.question === 'string' && typeof item.answer === 'string'
      );
    }

    try {
      const questions = tryFixAndParseJSON(aiResponse);
      if (!questions || !isValidQAArray(questions.Behavioral) || !isValidQAArray(questions.Technical) || !isValidQAArray(questions.General)) {
        console.error("[DEBUG] Questions validation failed. Questions object:", JSON.stringify(questions, null, 2));
        return NextResponse.json({ success: false, error: "Failed to generate questions. Please try again with a different CV." }, { status: 500 });
      }
      return NextResponse.json({ success: true, questions });
    } catch (parseErr) {
      console.error("[DEBUG] Questions parsing error:", parseErr);
      return NextResponse.json({ success: false, error: "Failed to generate questions. Please try again with a different CV." }, { status: 500 });
    }
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ success: false, error: "Something went wrong - please refresh and try again." }, { status: 500 });
  }
}
