import { NextRequest, NextResponse } from "next/server";

// Define interfaces for better type safety
interface AIServiceError extends Error {
  code?: string;
  status?: number;
  response?: {
    status: number;
    statusText: string;
    data?: unknown;
  };
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { cvText } = await req.json();

    // Validate input
    if (!cvText || typeof cvText !== "string" || cvText.trim().length === 0) {
      return NextResponse.json({ success: false, error: "CV text is required." }, { status: 400 });
    }

    console.log("[DEBUG] Summarizing CV text, length:", cvText.length);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API configuration error." }, { status: 500 });
    }

    const prompt = `You are an expert HR professional. Analyze the following CV and create a concise, structured summary with the following sections:

1. **Professional Summary** (2-3 bullet points)
2. **Key Skills** (bullet points of technical and soft skills)
3. **Work Experience** (bullet points highlighting key achievements and responsibilities)
4. **Education** (bullet points)
5. **Key Achievements** (bullet points of notable accomplishments)

Focus on:
- Quantifiable achievements (numbers, percentages, metrics)
- Technical skills and technologies
- Leadership and project management experience
- Industry-specific experience

Format as clean bullet points. Be concise but comprehensive. Use the exact information from the CV.

CV Text:
${cvText}

Respond with ONLY the structured summary in bullet point format. Do not include any other text or formatting.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let aiResponse: string | undefined = undefined;
    
    try {
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
          temperature: 0.2,
          max_tokens: 1500
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("[DEBUG] AI service error:", errorData);
        return NextResponse.json({ success: false, error: "AI service temporarily unavailable." }, { status: 500 });
      }
      
      const data = await response.json();
      aiResponse = data.choices?.[0]?.message?.content;
      
      if (!aiResponse) {
        return NextResponse.json({ success: false, error: "No response from AI service." }, { status: 500 });
      }
      
      console.log("[DEBUG] Summary generated, length:", aiResponse.length);
      console.log("[DEBUG] Summary preview:", aiResponse.slice(0, 500));
      
      return NextResponse.json({ 
        success: true, 
        summary: aiResponse.trim(),
        summaryLength: aiResponse.length
      });
      
    } catch (err: unknown) {
      clearTimeout(timeout);
      const error = err as AIServiceError;
      console.error("[DEBUG] AI service error:", error.message || error);
      return NextResponse.json({ success: false, error: "AI service error. Please try again later." }, { status: 500 });
    }
    
  } catch (err: unknown) {
    const error = err as Error;
    console.error("CV summarization API error:", error.message || error);
    return NextResponse.json({ 
      success: false, 
      error: "Something went wrong - please refresh and try again." 
    }, { status: 500 });
  }
} 