import { NextRequest, NextResponse } from 'next/server';
import { APIError, ErrorResponse, SuccessResponse } from '../../types';

interface ExtractedCV {
  content: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
  };
}

interface ExtractCVResponse {
  text: string;
  confidence: number;
  pages: number;
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    if (data.text && data.text.trim().length > 0) {
      return data.text;
    }
  } catch (err) {
    console.error("[pdf-parse extraction failed]", err);
  }

  // Fallback to pdf2json if pdf-parse fails
  try {
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
    
    if (text && text.trim().length > 0) {
      return text;
    }
  } catch (err) {
    console.error("[pdf2json extraction failed]", err);
  }

  throw new Error("Failed to extract text from PDF");
}

async function extractTextFromFile(file: File): Promise<ExtractCVResponse> {
  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";
  
  if (file.type === "application/pdf") {
    text = await extractTextFromPDF(buffer);
  } else {
    // For non-PDF files, use simple text extraction
    text = await file.text();
  }

  return {
    text,
    confidence: 0.95,
    pages: text.split("\n\n").length, // Rough estimate of pages
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json<ErrorResponse>({
        error: 'No file provided',
      }, { status: 400 });
    }

    // File validation
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json<ErrorResponse>({
        error: 'Invalid file type. Please upload a PDF or Word document.',
      }, { status: 400 });
    }

    // Process the file and extract text
    const extractedData: ExtractCVResponse = await extractTextFromFile(file);

    const result: ExtractedCV = {
      content: extractedData.text,
      metadata: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      },
    };

    return NextResponse.json<SuccessResponse<ExtractedCV>>({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Error extracting CV:', error);
    const apiError: APIError = {
      code: 'EXTRACTION_ERROR',
      message: 'Failed to extract CV content',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
    
    return NextResponse.json<ErrorResponse>({
      error: apiError.message,
    }, { status: 500 });
  }
}
