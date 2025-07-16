import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function extractTextFromPDF(file: Blob): Promise<string> {
  // Try pdf-parse first
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    if (data.text && data.text.trim().length > 0) return data.text;
  } catch (err) {
    console.error("[pdf-parse extraction failed]", err);
  }
  // Fallback to pdf2json
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const PDFParser = (await import("pdf2json")).default;
    const pdfParser = new PDFParser();
    const text = await new Promise<string>((resolve, reject) => {
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        try {
          let text = "";
          if (pdfData.Pages && pdfData.Pages.length > 0) {
            pdfData.Pages.forEach((page: any) => {
              if (page.Texts && page.Texts.length > 0) {
                let currentLine = "";
                let lastY: number | null = null;
                
                page.Texts.forEach((textItem: any) => {
                  if (textItem.R && textItem.R.length > 0) {
                    let word = "";
                    textItem.R.forEach((r: any) => {
                      if (r.T) {
                        word += decodeURIComponent(r.T);
                      }
                    });
                    
                    // Check if this text is on the same line as the previous text
                    const currentY = textItem.y;
                    if (lastY !== null && Math.abs(currentY - lastY) > 5) {
                      // New line detected, add current line to text and start new line
                      if (currentLine.trim()) {
                        text += currentLine.trim() + "\n";
                      }
                      currentLine = word + " ";
                    } else {
                      // Same line, continue building current line
                      currentLine += word + " ";
                    }
                    lastY = currentY;
                  }
                });
                
                // Add the last line
                if (currentLine.trim()) {
                  text += currentLine.trim() + "\n";
                }
              }
              text += "\n"; // Add extra newline between pages
            });
          }
          resolve(text.trim());
        } catch (e) {
          reject(e);
        }
      });
      pdfParser.on("pdfParser_dataError", reject);
      pdfParser.parseBuffer(buffer);
    });
    if (text && text.trim().length > 0) return fixSpacedText(text);
  } catch (err) {
    console.error("[pdf2json extraction failed]", err);
  }
  throw new Error("Failed to extract text from PDF. Make sure your PDF is not scanned or image-based and was exported from a text editor.");
}

function fixSpacedText(text: string): string {
  // Split by spaces and join single characters into words
  const words = text.split(' ');
  const fixedWords = [];
  let currentWord = '';
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word.length === 1) {
      // Single character, add to current word
      currentWord += word;
    } else if (word.length > 1) {
      // Multi-character word, finish current word and start new one
      if (currentWord) {
        fixedWords.push(currentWord);
        currentWord = '';
      }
      fixedWords.push(word);
    } else {
      // Empty string (multiple spaces), add space
      if (currentWord) {
        fixedWords.push(currentWord);
        currentWord = '';
      }
    }
  }
  
  // Add any remaining current word
  if (currentWord) {
    fixedWords.push(currentWord);
  }
  
  return fixedWords.join(' ');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("cvFile");

    // Log file info for debugging
    if (file && typeof file !== "string" && file instanceof Blob) {
      console.log("[DEBUG] File type:", file.type, "File size:", file.size);
    } else {
      console.log("[DEBUG] File missing or not a Blob:", file);
    }

    if (!file || typeof file === "string" || !(file instanceof Blob)) {
      return NextResponse.json({ success: false, error: "CV file is required or invalid." }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ success: false, error: "Only PDF files are accepted." }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File too large (max 5MB)." }, { status: 400 });
    }

    let extractedText: string;
    try {
      extractedText = await extractTextFromPDF(file);
      console.log("[DEBUG] Extracted text length:", extractedText.length);
      console.log("[DEBUG] Extracted text preview:", extractedText.slice(0, 500));
    } catch (extractErr: any) {
      console.error("[DEBUG] PDF extraction failed:", extractErr);
      return NextResponse.json({ 
        success: false, 
        error: extractErr.message || "We could not extract any text from your CV. Please upload a different PDF or check your file." 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      text: extractedText,
      textLength: extractedText.length,
      preview: extractedText.slice(0, 200) + (extractedText.length > 200 ? "..." : "")
    });

  } catch (err: any) {
    console.error("CV extraction API error:", err);
    return NextResponse.json({ 
      success: false, 
      error: "Something went wrong - please refresh and try again." 
    }, { status: 500 });
  }
}
