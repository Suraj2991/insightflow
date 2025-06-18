// Server-side Document Parser with Quality Assessment and Confidence Scoring
// Uses Node.js libraries for proper PDF processing

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import { createCanvas } from 'canvas';

export interface DocumentQuality {
  confidence: number; // 0-1 score
  quality: 'high' | 'medium' | 'low';
  issues: string[];
  recommendations: string[];
}

export interface ParsedDocument {
  id: string;
  filename: string;
  type: string;
  size: number;
  text: string;
  pageCount?: number;
  quality: DocumentQuality;
  metadata: {
    isDigital: boolean;
    hasOCR: boolean;
    extractionMethod: string;
    processingTime: number;
    sections: DocumentSection[];
  };
  createdAt: Date;
  filePath?: string;
}

export interface DocumentSection {
  title: string;
  content: string;
  confidence: number;
  pageNumber?: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DocumentInput {
  filename: string;
  buffer: Buffer;
  mimeType: string;
  size: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class DocumentProcessor {
  private static readonly CONFIDENCE_THRESHOLDS = {
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.4
  };

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly SUPPORTED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'image/jpeg',
    'image/png',
    'image/tiff'
  ];

  /**
   * Main processing entry point for server-side processing
   */
  public static async processDocument(input: DocumentInput): Promise<ParsedDocument> {
    const startTime = Date.now();
    
    // Determine processing strategy based on file type
    const { text, metadata, quality } = await this.extractContent(input);
    
    const processingTime = Date.now() - startTime;
    
    return {
      id: this.generateDocumentId(),
      filename: input.filename,
      type: input.mimeType,
      size: input.size,
      text,
      quality,
      metadata: {
        isDigital: metadata.isDigital ?? false,
        hasOCR: metadata.hasOCR ?? false,
        extractionMethod: metadata.extractionMethod ?? 'unknown',
        processingTime,
        sections: metadata.sections ?? []
      },
      createdAt: new Date()
    };
  }

  /**
   * File validation with detailed feedback
   */
  public static validateFile(file: File): ValidationResult {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum of 10MB`
      };
    }

    if (!this.SUPPORTED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not supported. Please upload PDF, DOCX, or image files.`
      };
    }

    return { isValid: true };
  }

  /**
   * Content extraction with confidence scoring using Node.js libraries
   */
  private static async extractContent(input: DocumentInput): Promise<{
    text: string;
    metadata: Partial<ParsedDocument['metadata']>;
    quality: DocumentQuality;
  }> {
    const mimeType = input.mimeType;
    
    if (mimeType === 'application/pdf') {
      return await this.processPDF(input.buffer);
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return await this.processDOCX(input.buffer);
    } else if (mimeType.startsWith('image/')) {
      return await this.processImage(input.buffer);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }

  /**
   * PDF processing using pdf-parse (Node.js native)
   */
  private static async processPDF(buffer: Buffer): Promise<{
    text: string;
    metadata: Partial<ParsedDocument['metadata']>;
    quality: DocumentQuality;
  }> {
    try {
      // Use pdf-parse for reliable server-side PDF extraction
      const pdfData = await pdfParse(buffer);
      const text = pdfData.text;
      const pageCount = pdfData.numpages;
      
      // Assess if this is a digital PDF with extractable text
      const isDigital = text && text.trim().length > 50;
      let confidence = 0.95;
      const issues: string[] = [];
      const recommendations: string[] = [];

      if (!isDigital) {
        // This is likely a scanned PDF - we'll need OCR
        confidence = 0.7;
        issues.push('Document appears to be scanned - may require OCR processing');
        recommendations.push('Consider providing a digital version if available');
        
        // For now, return placeholder text for scanned PDFs
        // In production, you'd implement OCR processing here
        const ocrText = `[Scanned PDF detected - ${pageCount} pages]\n\nThis document appears to be scanned and requires OCR processing for text extraction.\n\nDocument contains ${pageCount} page${pageCount !== 1 ? 's' : ''}.`;
        
        const quality = this.calculateQuality(confidence, issues);
        quality.recommendations.push(...recommendations);

        return {
          text: ocrText,
          metadata: {
            isDigital: false,
            hasOCR: true,
            extractionMethod: 'pdf_parse_with_ocr_needed',
            sections: this.extractSections(ocrText, confidence)
          },
          quality
        };
      }

      // Digital PDF processing
      if (text.length < 200) {
        issues.push('Document appears short - may not contain complete information');
        confidence = Math.max(confidence - 0.1, 0.7);
      }

      if (pageCount > 50) {
        issues.push('Large document - processing may take longer');
      }

      const quality = this.calculateQuality(confidence, issues);
      quality.recommendations.push(...recommendations);

      return {
        text,
        metadata: {
          isDigital: true,
          hasOCR: false,
          extractionMethod: 'pdf_parse_digital',
          sections: this.extractSections(text, confidence)
        },
        quality
      };

    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * DOCX processing using mammoth
   */
  private static async processDOCX(buffer: Buffer): Promise<{
    text: string;
    metadata: Partial<ParsedDocument['metadata']>;
    quality: DocumentQuality;
  }> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      
      let confidence = 0.9;
      const issues: string[] = [];
      const recommendations: string[] = [];

      if (result.messages.length > 0) {
        confidence = Math.max(confidence - 0.1, 0.7);
        issues.push('Some formatting may not have been preserved during conversion');
      }

      if (text.length < 100) {
        confidence = Math.max(confidence - 0.2, 0.5);
        issues.push('Document appears very short or may be mostly images');
        recommendations.push('Verify that all content was extracted properly');
      }

      const quality = this.calculateQuality(confidence, issues);
      quality.recommendations.push(...recommendations);

      return {
        text,
        metadata: {
          isDigital: true,
          hasOCR: false,
          extractionMethod: 'mammoth_docx',
          sections: this.extractSections(text, confidence)
        },
        quality
      };

    } catch (error) {
      console.error('DOCX processing error:', error);
      throw new Error(`Failed to process DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Image processing using Tesseract.js OCR
   */
  private static async processImage(buffer: Buffer): Promise<{
    text: string;
    metadata: Partial<ParsedDocument['metadata']>;
    quality: DocumentQuality;
  }> {
    try {
      // Use Tesseract.js for OCR processing
      const worker = await Tesseract.createWorker('eng');
      
      const { data: { text, confidence } } = await worker.recognize(buffer);
      await worker.terminate();

      const normalizedConfidence = confidence / 100; // Tesseract returns 0-100
      const issues: string[] = [];
      const recommendations: string[] = [];

      if (normalizedConfidence < 0.8) {
        issues.push('OCR confidence is moderate - text accuracy may vary');
        recommendations.push('Consider scanning with higher resolution or better lighting');
      }

      if (text.length < 50) {
        issues.push('Very little text detected - image may be unclear or contain mostly graphics');
        recommendations.push('Verify image quality and text visibility');
      }

      const quality = this.calculateQuality(normalizedConfidence, issues);
      quality.recommendations.push(...recommendations);

      return {
        text,
        metadata: {
          isDigital: false,
          hasOCR: true,
          extractionMethod: 'tesseract_ocr',
          sections: this.extractSections(text, normalizedConfidence)
        },
        quality
      };

    } catch (error) {
      console.error('Image OCR processing error:', error);
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract logical sections from text
   */
  private static extractSections(text: string, baseConfidence: number): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    let currentSection: DocumentSection | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect section headers (simple heuristic)
      const isHeader = this.isPotentialHeader(line);
      
      if (isHeader && line.length < 100) {
        // Save previous section
        if (currentSection && currentSection.content.trim()) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          title: line,
          content: '',
          confidence: baseConfidence,
          pageNumber: undefined
        };
      } else if (currentSection) {
        // Add to current section
        currentSection.content += line + '\n';
      } else {
        // Create default section if no header found yet
        if (!currentSection) {
          currentSection = {
            title: 'Document Content',
            content: '',
            confidence: baseConfidence
          };
        }
        currentSection.content += line + '\n';
      }
    }
    
    // Add final section
    if (currentSection && currentSection.content.trim()) {
      sections.push(currentSection);
    }
    
    return sections.length > 0 ? sections : [{
      title: 'Full Document',
      content: text,
      confidence: baseConfidence
    }];
  }

  /**
   * Simple heuristic to detect section headers
   */
  private static isPotentialHeader(line: string): boolean {
    const upperCaseRatio = (line.match(/[A-Z]/g) || []).length / line.length;
    const hasColon = line.includes(':');
    const isShort = line.length < 100;
    const hasNumbers = /^\d+\./.test(line.trim());
    
    return (upperCaseRatio > 0.5 && isShort) || hasColon || hasNumbers;
  }

  /**
   * Calculate overall quality score
   */
  private static calculateQuality(confidence: number, issues: string[]): DocumentQuality {
    let quality: 'high' | 'medium' | 'low';
    
    if (confidence >= this.CONFIDENCE_THRESHOLDS.HIGH && issues.length === 0) {
      quality = 'high';
    } else if (confidence >= this.CONFIDENCE_THRESHOLDS.MEDIUM) {
      quality = 'medium';
    } else {
      quality = 'low';
    }
    
    return {
      confidence,
      quality,
      issues: [...issues],
      recommendations: []
    };
  }

  /**
   * Generate unique document ID
   */
  private static generateDocumentId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get quality description for UI
   */
  public static getQualityDescription(quality: DocumentQuality): string {
    switch (quality.quality) {
      case 'high':
        return `Excellent quality (${Math.round(quality.confidence * 100)}% confidence)`;
      case 'medium':
        return `Good quality (${Math.round(quality.confidence * 100)}% confidence)`;
      case 'low':
        return `Needs review (${Math.round(quality.confidence * 100)}% confidence)`;
    }
  }

  /**
   * Check if file type is supported
   */
  public static isSupportedType(fileType: string): boolean {
    return this.SUPPORTED_TYPES.includes(fileType);
  }

  /**
   * Get maximum file size in MB
   */
  public static getMaxFileSizeMB(): number {
    return this.MAX_FILE_SIZE / (1024 * 1024);
  }

  /**
   * Get supported file types
   */
  public static getSupportedTypes(): string[] {
    return [...this.SUPPORTED_TYPES];
  }

  /**
   * Get quality thresholds
   */
  public static getQualityThresholds() {
    return { ...this.CONFIDENCE_THRESHOLDS };
  }
} 