// Document Storage and Retrieval System
// Handles document persistence, citation tracking, and RAG preparation

import { ParsedDocument, DocumentSection } from './server/documentProcessor';

export interface DocumentCitation {
  documentId: string;
  documentName: string;
  pageNumber?: number;
  lineNumber?: number;
  sectionTitle?: string;
  exactText: string;
  confidence: number;
  context: string; // Surrounding text for context
}

export interface StoredDocument extends ParsedDocument {
  chunks: DocumentChunk[];
  embeddings?: number[][];
  lastAccessed: Date;
  analysisResults?: AnalysisResult[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  startIndex: number;
  endIndex: number;
  pageNumber?: number;
  lineNumber?: number;
  sectionTitle?: string;
  embedding?: number[];
  confidence: number;
}

export interface AnalysisResult {
  id: string;
  type: 'positive' | 'concern' | 'risk' | 'red_flag';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  citations: DocumentCitation[];
  confidence: number;
  professionalAdviceRequired: boolean;
  createdAt: Date;
}

export class DocumentStorage {
  private documents: Map<string, StoredDocument> = new Map();
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.loadFromStorage();
  }

  /**
   * Store a processed document with chunking for RAG
   */
  async storeDocument(document: ParsedDocument): Promise<void> {
    const chunks = await this.createDocumentChunks(document);
    
    const storedDocument: StoredDocument = {
      ...document,
      chunks,
      lastAccessed: new Date(),
      analysisResults: []
    };

    this.documents.set(document.id, storedDocument);
    await this.saveToStorage();
  }

  /**
   * Retrieve a document by ID
   */
  getDocument(documentId: string): StoredDocument | null {
    const doc = this.documents.get(documentId);
    if (doc) {
      doc.lastAccessed = new Date();
      this.saveToStorage(); // Update access time
    }
    return doc || null;
  }

  /**
   * Get all documents for the session
   */
  getAllDocuments(): StoredDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * Search for relevant content across all documents
   */
  searchDocuments(query: string, maxResults: number = 10): DocumentChunk[] {
    const allChunks: DocumentChunk[] = [];
    
    for (const doc of this.documents.values()) {
      allChunks.push(...doc.chunks);
    }

    // Simple text search (in production, use semantic similarity with embeddings)
    const results = allChunks
      .filter(chunk => 
        chunk.content.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxResults);

    return results;
  }

  /**
   * Store analysis results with citations
   */
  async storeAnalysisResult(result: AnalysisResult): Promise<void> {
    // Find the document that contains the citations
    for (const citation of result.citations) {
      const doc = this.documents.get(citation.documentId);
      if (doc) {
        if (!doc.analysisResults) {
          doc.analysisResults = [];
        }
        // Check if this result already exists
        const existingIndex = doc.analysisResults.findIndex(r => r.id === result.id);
        if (existingIndex >= 0) {
          doc.analysisResults[existingIndex] = result;
        } else {
          doc.analysisResults.push(result);
        }
      }
    }
    
    await this.saveToStorage();
  }

  /**
   * Get analysis results organized by type
   */
  getAnalysisResults(): {
    positive: AnalysisResult[];
    concerns: AnalysisResult[];
    risks: AnalysisResult[];
    redFlags: AnalysisResult[];
  } {
    const allResults: AnalysisResult[] = [];
    
    for (const doc of this.documents.values()) {
      if (doc.analysisResults) {
        allResults.push(...doc.analysisResults);
      }
    }

    return {
      positive: allResults.filter(r => r.type === 'positive').sort((a, b) => b.confidence - a.confidence),
      concerns: allResults.filter(r => r.type === 'concern').sort((a, b) => b.severity.localeCompare(a.severity)),
      risks: allResults.filter(r => r.type === 'risk').sort((a, b) => b.severity.localeCompare(a.severity)),
      redFlags: allResults.filter(r => r.type === 'red_flag').sort((a, b) => b.confidence - a.confidence)
    };
  }

  /**
   * Create searchable chunks from document content
   */
  private async createDocumentChunks(document: ParsedDocument): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = [];
    const lines = document.text.split('\n');
    const chunkSize = 500; // characters per chunk
    const overlapSize = 50; // overlap between chunks
    
    let currentChunk = '';
    let chunkStartIndex = 0;
    let currentLineNumber = 1;
    let currentPageNumber = 1;
    let currentSectionTitle = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;

      // Detect section headers (lines that are short and might be titles)
      if (line.length < 100 && (line.endsWith(':') || line.toUpperCase() === line)) {
        currentSectionTitle = line;
      }

      // Detect page breaks (simple heuristic)
      if (line.includes('Page ') || line.match(/^\d+$/)) {
        const pageMatch = line.match(/Page (\d+)/i) || line.match(/^(\d+)$/);
        if (pageMatch) {
          currentPageNumber = parseInt(pageMatch[1]);
        }
      }

      currentChunk += line + '\n';
      
      // Create chunk when it reaches target size
      if (currentChunk.length >= chunkSize) {
        chunks.push({
          id: this.generateChunkId(document.id, chunks.length),
          documentId: document.id,
          content: currentChunk.trim(),
          startIndex: chunkStartIndex,
          endIndex: chunkStartIndex + currentChunk.length,
          pageNumber: currentPageNumber,
          lineNumber: currentLineNumber,
          sectionTitle: currentSectionTitle,
          confidence: document.quality.confidence
        });

        // Start new chunk with overlap
        const overlapText = currentChunk.slice(-overlapSize);
        currentChunk = overlapText;
        chunkStartIndex += currentChunk.length - overlapSize;
      }

      currentLineNumber++;
    }

    // Add final chunk if there's remaining content
    if (currentChunk.trim()) {
      chunks.push({
        id: this.generateChunkId(document.id, chunks.length),
        documentId: document.id,
        content: currentChunk.trim(),
        startIndex: chunkStartIndex,
        endIndex: chunkStartIndex + currentChunk.length,
        pageNumber: currentPageNumber,
        lineNumber: currentLineNumber,
        sectionTitle: currentSectionTitle,
        confidence: document.quality.confidence
      });
    }

    return chunks;
  }

  /**
   * Generate unique chunk ID
   */
  private generateChunkId(documentId: string, chunkIndex: number): string {
    return `${documentId}_chunk_${chunkIndex}`;
  }

  /**
   * Save documents to localStorage
   */
  private async saveToStorage(): Promise<void> {
    if (typeof window !== 'undefined') {
      const documentsArray = Array.from(this.documents.entries());
      localStorage.setItem(`documents_${this.sessionId}`, JSON.stringify(documentsArray));
    }
  }

  /**
   * Load documents from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`documents_${this.sessionId}`);
      if (stored) {
        try {
          const documentsArray = JSON.parse(stored);
          this.documents = new Map(documentsArray);
        } catch (error) {
          console.error('Failed to load documents from storage:', error);
        }
      }
    }
  }

  /**
   * Clear all documents for the session
   */
  async clearDocuments(): Promise<void> {
    this.documents.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`documents_${this.sessionId}`);
    }
  }

  /**
   * Get document statistics
   */
  getDocumentStats(): {
    totalDocuments: number;
    totalChunks: number;
    documentsByType: Record<string, number>;
    averageConfidence: number;
  } {
    const docs = Array.from(this.documents.values());
    const totalChunks = docs.reduce((sum, doc) => sum + doc.chunks.length, 0);
    const documentsByType: Record<string, number> = {};
    
    docs.forEach(doc => {
      const type = doc.type;
      documentsByType[type] = (documentsByType[type] || 0) + 1;
    });

    const averageConfidence = docs.length > 0 
      ? docs.reduce((sum, doc) => sum + doc.quality.confidence, 0) / docs.length 
      : 0;

    return {
      totalDocuments: docs.length,
      totalChunks,
      documentsByType,
      averageConfidence
    };
  }

  /**
   * Export documents for analysis (useful for AI processing)
   */
  exportForAnalysis(): {
    documents: StoredDocument[];
    searchableContent: string;
    citationMap: Map<string, DocumentCitation>;
  } {
    const documents = Array.from(this.documents.values());
    const citationMap = new Map<string, DocumentCitation>();
    
    let searchableContent = '';
    
    documents.forEach(doc => {
      searchableContent += `\n\n=== DOCUMENT: ${doc.filename} ===\n`;
      searchableContent += `Quality: ${doc.quality.confidence * 100}% confidence\n`;
      searchableContent += `Type: ${doc.type}\n`;
      searchableContent += `Content:\n${doc.text}\n`;
      
      // Create citation entries for each chunk
      doc.chunks.forEach(chunk => {
        const citation: DocumentCitation = {
          documentId: doc.id,
          documentName: doc.filename,
          pageNumber: chunk.pageNumber,
          lineNumber: chunk.lineNumber,
          sectionTitle: chunk.sectionTitle,
          exactText: chunk.content.substring(0, 200), // First 200 chars
          confidence: chunk.confidence,
          context: chunk.content
        };
        citationMap.set(chunk.id, citation);
      });
    });

    return {
      documents,
      searchableContent,
      citationMap
    };
  }
} 