import { NextRequest, NextResponse } from 'next/server';
import { DocumentProcessor } from '@/lib/server/documentProcessor';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = DocumentProcessor.validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Convert File to Buffer for server-side processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process the document
    const processedDocument = await DocumentProcessor.processDocument({
      filename: file.name,
      buffer,
      mimeType: file.type,
      size: file.size
    });

    // Save to temporary storage (in production, use cloud storage)
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const fileId = uuidv4();
    const filePath = path.join(uploadDir, `${fileId}_${file.name}`);
    await fs.writeFile(filePath, buffer);

    // Add file path to processed document
    processedDocument.filePath = filePath;

    // Store document in the storage system
    const { DocumentStorage } = await import('@/lib/server/documentStorage');
    await DocumentStorage.storeDocument(processedDocument);

    return NextResponse.json({
      success: true,
      document: processedDocument
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    maxFileSize: DocumentProcessor.getMaxFileSizeMB(),
    supportedTypes: DocumentProcessor.getSupportedTypes(),
    qualityThresholds: DocumentProcessor.getQualityThresholds()
  });
} 