// Server-side Document Storage with RAG-ready features
// Handles document persistence, retrieval, and analysis storage

import { promises as fs } from 'fs';
import path from 'path';
import { ParsedDocument } from './documentProcessor';

export interface AnalysisResult {
  id: string;
  documentIds: string[];
  findings: AnalysisFinding[];
  summary: AnalysisSummary;
  questions: GeneratedQuestion[];
  confidence: number;
  createdAt: Date;
  metadata: {
    analysisType: string;
    processingTime: number;
    documentCount: number;
  };
}

export interface AnalysisFinding {
  id: string;
  type: 'positive' | 'concern' | 'risk' | 'red_flag';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  citations: CitationReference[];
  recommendations: string[];
}

export interface CitationReference {
  documentId: string;
  documentName: string;
  section: string;
  pageNumber?: number;
  lineNumber?: number;
  excerpt: string;
  confidence: number;
}

export interface AnalysisSummary {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  keyFindings: string[];
  documentsAnalyzed: number;
  completeness: number; // 0-1 score
  recommendedActions: string[];
  // Enhanced summary properties
  executiveSummary?: string;
  riskBreakdown?: Record<string, number>;
  positiveAspects?: string[];
}

export interface GeneratedQuestion {
  id: string;
  category: 'legal' | 'financial' | 'structural' | 'environmental' | 'other';
  question: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  context: string;
  relatedFindings: string[]; // Finding IDs
}

export class DocumentStorage {
  private static readonly STORAGE_DIR = path.join(process.cwd(), 'storage');
  private static readonly DOCUMENTS_DIR = path.join(this.STORAGE_DIR, 'documents');
  private static readonly ANALYSIS_DIR = path.join(this.STORAGE_DIR, 'analysis');

  /**
   * Initialize storage directories
   */
  public static async initialize(): Promise<void> {
    await fs.mkdir(this.STORAGE_DIR, { recursive: true });
    await fs.mkdir(this.DOCUMENTS_DIR, { recursive: true });
    await fs.mkdir(this.ANALYSIS_DIR, { recursive: true });
  }

  /**
   * Store a processed document
   */
  public static async storeDocument(document: ParsedDocument): Promise<string> {
    await this.initialize();
    
    const filePath = path.join(this.DOCUMENTS_DIR, `${document.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(document, null, 2));
    
    return document.id;
  }

  /**
   * Retrieve a document by ID
   */
  public static async getDocument(id: string): Promise<ParsedDocument | null> {
    try {
      const filePath = path.join(this.DOCUMENTS_DIR, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as ParsedDocument;
    } catch (error) {
      console.error(`Failed to retrieve document ${id}:`, error);
      return null;
    }
  }

  /**
   * List all stored documents
   */
  public static async listDocuments(): Promise<ParsedDocument[]> {
    try {
      await this.initialize();
      const files = await fs.readdir(this.DOCUMENTS_DIR);
      const documents: ParsedDocument[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const id = file.replace('.json', '');
          const doc = await this.getDocument(id);
          if (doc) {
            documents.push(doc);
          }
        }
      }

      return documents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Failed to list documents:', error);
      return [];
    }
  }

  /**
   * Store analysis results
   */
  public static async storeAnalysis(analysis: AnalysisResult): Promise<string> {
    await this.initialize();
    
    const filePath = path.join(this.ANALYSIS_DIR, `${analysis.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(analysis, null, 2));
    
    return analysis.id;
  }

  /**
   * Retrieve analysis by ID
   */
  public static async getAnalysis(id: string): Promise<AnalysisResult | null> {
    try {
      const filePath = path.join(this.ANALYSIS_DIR, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as AnalysisResult;
    } catch (error) {
      console.error(`Failed to retrieve analysis ${id}:`, error);
      return null;
    }
  }

  /**
   * Search documents by content (simple text search)
   */
  public static async searchDocuments(query: string): Promise<{
    documents: ParsedDocument[];
    matches: { documentId: string; excerpts: string[] }[];
  }> {
    const documents = await this.listDocuments();
    const matches: { documentId: string; excerpts: string[] }[] = [];
    const queryLower = query.toLowerCase();

    const matchingDocuments = documents.filter(doc => {
      const textLower = doc.text.toLowerCase();
      if (textLower.includes(queryLower)) {
        // Extract excerpts around matches
        const excerpts: string[] = [];
        const sentences = doc.text.split(/[.!?]+/);
        
        sentences.forEach(sentence => {
          if (sentence.toLowerCase().includes(queryLower)) {
            excerpts.push(sentence.trim());
          }
        });

        matches.push({
          documentId: doc.id,
          excerpts: excerpts.slice(0, 3) // Limit to 3 excerpts
        });

        return true;
      }
      return false;
    });

    return { documents: matchingDocuments, matches };
  }

  /**
   * Get document chunks for RAG processing
   */
  public static async getDocumentChunks(
    documentId: string, 
    chunkSize: number = 1000,
    overlap: number = 200
  ): Promise<{
    chunks: DocumentChunk[];
    metadata: { totalChunks: number; documentId: string; }
  }> {
    const document = await this.getDocument(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    const chunks: DocumentChunk[] = [];
    const text = document.text;
    
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const chunk = text.slice(i, i + chunkSize);
      const chunkId = `${documentId}_chunk_${chunks.length}`;
      
      chunks.push({
        id: chunkId,
        documentId,
        text: chunk,
        startIndex: i,
        endIndex: Math.min(i + chunkSize, text.length),
        metadata: {
          chunkIndex: chunks.length,
          confidence: document.quality.confidence,
          section: this.findRelevantSection(document, i)
        }
      });
    }

    return {
      chunks,
      metadata: {
        totalChunks: chunks.length,
        documentId
      }
    };
  }

  /**
   * Clean up old documents and analysis
   */
  public static async cleanup(olderThanDays: number = 30): Promise<{
    deletedDocuments: number;
    deletedAnalyses: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let deletedDocuments = 0;
    let deletedAnalyses = 0;

    // Clean up documents
    const documents = await this.listDocuments();
    for (const doc of documents) {
      if (new Date(doc.createdAt) < cutoffDate) {
        try {
          const filePath = path.join(this.DOCUMENTS_DIR, `${doc.id}.json`);
          await fs.unlink(filePath);
          
          // Also delete the original file if it exists
          if (doc.filePath) {
            try {
              await fs.unlink(doc.filePath);
            } catch (e) {
              // Original file might already be deleted
            }
          }
          
          deletedDocuments++;
        } catch (error) {
          console.error(`Failed to delete document ${doc.id}:`, error);
        }
      }
    }

    // Clean up analyses
    try {
      const analysisFiles = await fs.readdir(this.ANALYSIS_DIR);
      for (const file of analysisFiles) {
        if (file.endsWith('.json')) {
          const id = file.replace('.json', '');
          const analysis = await this.getAnalysis(id);
          
          if (analysis && new Date(analysis.createdAt) < cutoffDate) {
            const filePath = path.join(this.ANALYSIS_DIR, file);
            await fs.unlink(filePath);
            deletedAnalyses++;
          }
        }
      }
    } catch (error) {
      console.error('Failed to clean up analyses:', error);
    }

    return { deletedDocuments, deletedAnalyses };
  }

  /**
   * Helper method to find relevant section for a text position
   */
  private static findRelevantSection(document: ParsedDocument, position: number): string {
    let currentPosition = 0;
    
    for (const section of document.metadata.sections) {
      const sectionLength = section.content.length;
      if (position >= currentPosition && position < currentPosition + sectionLength) {
        return section.title;
      }
      currentPosition += sectionLength;
    }
    
    return 'Unknown Section';
  }

  /**
   * Get storage statistics
   */
  public static async getStorageStats(): Promise<{
    totalDocuments: number;
    totalAnalyses: number;
    totalStorageSize: number;
    oldestDocument?: Date;
    newestDocument?: Date;
  }> {
    const documents = await this.listDocuments();
    
    let totalStorageSize = 0;
    try {
      const docFiles = await fs.readdir(this.DOCUMENTS_DIR);
      const analysisFiles = await fs.readdir(this.ANALYSIS_DIR);
      
      // Calculate storage size (approximate)
      for (const file of [...docFiles, ...analysisFiles]) {
        try {
          const filePath = file.includes('analysis') 
            ? path.join(this.ANALYSIS_DIR, file)
            : path.join(this.DOCUMENTS_DIR, file);
          const stats = await fs.stat(filePath);
          totalStorageSize += stats.size;
        } catch (e) {
          // Skip if file doesn't exist
        }
      }
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
    }

    const dates = documents.map(d => new Date(d.createdAt));
    
    return {
      totalDocuments: documents.length,
      totalAnalyses: await this.getAnalysisCount(),
      totalStorageSize,
      oldestDocument: dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : undefined,
      newestDocument: dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : undefined
    };
  }

  /**
   * Get count of stored analyses
   */
  private static async getAnalysisCount(): Promise<number> {
    try {
      const files = await fs.readdir(this.ANALYSIS_DIR);
      return files.filter(f => f.endsWith('.json')).length;
    } catch (error) {
      return 0;
    }
  }
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  text: string;
  startIndex: number;
  endIndex: number;
  metadata: {
    chunkIndex: number;
    confidence: number;
    section: string;
  };
} 