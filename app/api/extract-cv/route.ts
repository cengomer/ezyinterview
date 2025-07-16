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

async function extractTextFromFile(file: File): Promise<ExtractCVResponse> {
  // Mock implementation - replace with actual CV parsing logic
  const text = await file.text();
  
  return {
    text,
    confidence: 0.95,
    pages: 1,
  };
}
