// Analysis Engine with Citation Tracking
// Generates structured findings with specific document citations

import { DocumentStorage, AnalysisResult, DocumentCitation, StoredDocument } from './documentStorage';
import { QuestionnaireResponse } from '@/types/questionnaire';

export interface AnalysisReport {
  sessionId: string;
  generatedAt: Date;
  documentsSummary: {
    total: number;
    byType: Record<string, number>;
    averageQuality: number;
    missingDocuments: string[];
  };
  positiveFindings: AnalysisResult[];
  concerns: AnalysisResult[];
  risks: AnalysisResult[];
  redFlags: AnalysisResult[];
  overallAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    professionalAdviceUrgency: 'routine' | 'soon' | 'urgent' | 'immediate';
  };
  nextSteps: string[];
  professionalQuestions: {
    solicitor: string[];
    surveyor: string[];
    specialist: string[];
  };
}

export class AnalysisEngine {
  private documentStorage: DocumentStorage;
  private questionnaireResponse: QuestionnaireResponse | null = null;

  constructor(sessionId: string) {
    this.documentStorage = new DocumentStorage(sessionId);
  }

  /**
   * Set questionnaire responses to inform analysis
   */
  setQuestionnaireResponse(response: QuestionnaireResponse): void {
    this.questionnaireResponse = response;
  }

  /**
   * Run comprehensive analysis on all documents
   */
  async analyzeDocuments(): Promise<AnalysisReport> {
    const documents = this.documentStorage.getAllDocuments();
    
    if (documents.length === 0) {
      return this.generateReportWithoutDocuments();
    }

    // Run analysis on each document
    for (const document of documents) {
      await this.analyzeDocument(document);
    }

    // Generate comprehensive report
    return this.generateComprehensiveReport();
  }

  /**
   * Analyze a single document and extract findings
   */
  private async analyzeDocument(document: StoredDocument): Promise<void> {
    const documentType = this.identifyDocumentType(document);
    
    switch (documentType) {
      case 'ta6':
        await this.analyzeTA6Document(document);
        break;
      case 'survey':
        await this.analyzeSurveyDocument(document);
        break;
      case 'search':
        await this.analyzeSearchDocument(document);
        break;
      case 'lease':
        await this.analyzeLeaseDocument(document);
        break;
      default:
        await this.analyzeGenericDocument(document);
    }
  }

  /**
   * Analyze TA6 Property Information Form
   */
  private async analyzeTA6Document(document: StoredDocument): Promise<void> {
    const findings: AnalysisResult[] = [];

    // Look for structural issues
    const structuralCitations = this.findTextWithCitations(
      document,
      ['subsidence', 'structural', 'foundation', 'damp', 'roof', 'extension', 'alteration']
    );

    for (const citation of structuralCitations) {
      if (citation.exactText.toLowerCase().includes('subsidence')) {
        findings.push({
          id: this.generateResultId(),
          type: 'red_flag',
          title: 'Subsidence History Mentioned',
          description: 'The property information form mentions subsidence, which requires immediate professional assessment.',
          severity: 'critical',
          citations: [citation],
          confidence: citation.confidence,
          professionalAdviceRequired: true,
          createdAt: new Date()
        });
      }

      if (citation.exactText.toLowerCase().includes('damp')) {
        findings.push({
          id: this.generateResultId(),
          type: 'concern',
          title: 'Damp Issues Reported',
          description: 'Damp problems are mentioned in the property information. This should be investigated by a surveyor.',
          severity: 'medium',
          citations: [citation],
          confidence: citation.confidence,
          professionalAdviceRequired: true,
          createdAt: new Date()
        });
      }
    }

    // Look for planning permissions
    const planningCitations = this.findTextWithCitations(
      document,
      ['planning', 'permission', 'building regulations', 'conservation', 'listed']
    );

    for (const citation of planningCitations) {
      if (citation.exactText.toLowerCase().includes('no planning') || 
          citation.exactText.toLowerCase().includes('without permission')) {
        findings.push({
          id: this.generateResultId(),
          type: 'risk',
          title: 'Planning Permission Issues',
          description: 'There may be planning permission concerns that require legal review.',
          severity: 'high',
          citations: [citation],
          confidence: citation.confidence,
          professionalAdviceRequired: true,
          createdAt: new Date()
        });
      }
    }

    // Look for positive indicators
    const positiveCitations = this.findTextWithCitations(
      document,
      ['no known issues', 'no problems', 'satisfactory', 'good condition', 'well maintained']
    );

    for (const citation of positiveCitations) {
      findings.push({
        id: this.generateResultId(),
        type: 'positive',
        title: 'No Known Issues Reported',
        description: 'The seller reports no known issues in this area.',
        severity: 'low',
        citations: [citation],
        confidence: citation.confidence,
        professionalAdviceRequired: false,
        createdAt: new Date()
      });
    }

    // Store all findings
    for (const finding of findings) {
      await this.documentStorage.storeAnalysisResult(finding);
    }
  }

  /**
   * Analyze survey document
   */
  private async analyzeSurveyDocument(document: StoredDocument): Promise<void> {
    const findings: AnalysisResult[] = [];

    // Look for condition ratings
    const conditionCitations = this.findTextWithCitations(
      document,
      ['condition rating', 'category 3', 'category 2', 'urgent', 'serious', 'minor']
    );

    for (const citation of conditionCitations) {
      if (citation.exactText.toLowerCase().includes('category 3') || 
          citation.exactText.toLowerCase().includes('urgent')) {
        findings.push({
          id: this.generateResultId(),
          type: 'red_flag',
          title: 'Urgent Repairs Required',
          description: 'The survey identifies urgent repairs needed. Immediate professional attention required.',
          severity: 'critical',
          citations: [citation],
          confidence: citation.confidence,
          professionalAdviceRequired: true,
          createdAt: new Date()
        });
      }
    }

    // Store findings
    for (const finding of findings) {
      await this.documentStorage.storeAnalysisResult(finding);
    }
  }

  /**
   * Analyze search documents (environmental, local authority, etc.)
   */
  private async analyzeSearchDocument(document: StoredDocument): Promise<void> {
    const findings: AnalysisResult[] = [];

    // Environmental risks
    const environmentalCitations = this.findTextWithCitations(
      document,
      ['flood', 'contamination', 'mining', 'landfill', 'radon', 'environmental']
    );

    for (const citation of environmentalCitations) {
      if (citation.exactText.toLowerCase().includes('flood risk')) {
        findings.push({
          id: this.generateResultId(),
          type: 'risk',
          title: 'Flood Risk Identified',
          description: 'Environmental search shows flood risk factors that may affect insurance and property value.',
          severity: 'medium',
          citations: [citation],
          confidence: citation.confidence,
          professionalAdviceRequired: true,
          createdAt: new Date()
        });
      }
    }

    // Store findings
    for (const finding of findings) {
      await this.documentStorage.storeAnalysisResult(finding);
    }
  }

  /**
   * Analyze lease document (for leasehold properties)
   */
  private async analyzeLeaseDocument(document: StoredDocument): Promise<void> {
    const findings: AnalysisResult[] = [];

    // Lease term analysis
    const leaseCitations = this.findTextWithCitations(
      document,
      ['lease term', 'years remaining', 'ground rent', 'service charge', 'management']
    );

    for (const citation of leaseCitations) {
      // Extract lease term if possible
      const yearsMatch = citation.exactText.match(/(\d+)\s*years/i);
      if (yearsMatch) {
        const years = parseInt(yearsMatch[1]);
        if (years < 80) {
          findings.push({
            id: this.generateResultId(),
            type: 'risk',
            title: 'Short Lease Term',
            description: `Lease has ${years} years remaining. This may affect mortgageability and value.`,
            severity: years < 60 ? 'high' : 'medium',
            citations: [citation],
            confidence: citation.confidence,
            professionalAdviceRequired: true,
            createdAt: new Date()
          });
        }
      }
    }

    // Store findings
    for (const finding of findings) {
      await this.documentStorage.storeAnalysisResult(finding);
    }
  }

  /**
   * Analyze generic documents
   */
  private async analyzeGenericDocument(document: StoredDocument): Promise<void> {
    // Basic analysis for unrecognized document types
    const generalCitations = this.findTextWithCitations(
      document,
      ['issue', 'problem', 'concern', 'defect', 'damage', 'repair']
    );

    for (const citation of generalCitations) {
      await this.documentStorage.storeAnalysisResult({
        id: this.generateResultId(),
        type: 'concern',
        title: 'General Concern Identified',
        description: 'Potential issue identified in document - requires professional review.',
        severity: 'medium',
        citations: [citation],
        confidence: citation.confidence * 0.7, // Lower confidence for generic analysis
        professionalAdviceRequired: true,
        createdAt: new Date()
      });
    }
  }

  /**
   * Find text patterns and create citations
   */
  private findTextWithCitations(document: StoredDocument, searchTerms: string[]): DocumentCitation[] {
    const citations: DocumentCitation[] = [];
    
    for (const chunk of document.chunks) {
      for (const term of searchTerms) {
        const regex = new RegExp(`[^.]*${term}[^.]*`, 'gi');
        const matches = chunk.content.match(regex);
        
        if (matches) {
          for (const match of matches) {
            citations.push({
              documentId: document.id,
              documentName: document.filename,
              pageNumber: chunk.pageNumber,
              lineNumber: chunk.lineNumber,
              sectionTitle: chunk.sectionTitle || 'Unknown Section',
              exactText: match.trim(),
              confidence: chunk.confidence,
              context: this.extractContext(chunk.content, match)
            });
          }
        }
      }
    }

    return citations;
  }

  /**
   * Extract surrounding context for a matched text
   */
  private extractContext(fullText: string, matchedText: string): string {
    const index = fullText.indexOf(matchedText);
    if (index === -1) return matchedText;

    const contextLength = 200;
    const start = Math.max(0, index - contextLength);
    const end = Math.min(fullText.length, index + matchedText.length + contextLength);
    
    return fullText.substring(start, end);
  }

  /**
   * Identify document type based on content and filename
   */
  private identifyDocumentType(document: StoredDocument): string {
    const filename = document.filename.toLowerCase();
    const content = document.text.toLowerCase();

    if (filename.includes('ta6') || content.includes('property information form')) {
      return 'ta6';
    }
    if (filename.includes('survey') || filename.includes('homebuyer') || content.includes('condition rating')) {
      return 'survey';
    }
    if (filename.includes('search') || content.includes('local authority') || content.includes('environmental')) {
      return 'search';
    }
    if (filename.includes('lease') || content.includes('lease term') || content.includes('ground rent')) {
      return 'lease';
    }
    
    return 'generic';
  }

  /**
   * Generate comprehensive analysis report
   */
  private async generateComprehensiveReport(): Promise<AnalysisReport> {
    const results = this.documentStorage.getAnalysisResults();
    const stats = this.documentStorage.getDocumentStats();
    
    return {
      sessionId: this.documentStorage['sessionId'],
      generatedAt: new Date(),
      documentsSummary: {
        total: stats.totalDocuments,
        byType: stats.documentsByType,
        averageQuality: stats.averageConfidence,
        missingDocuments: this.identifyMissingDocuments()
      },
      positiveFindings: results.positive,
      concerns: results.concerns,
      risks: results.risks,
      redFlags: results.redFlags,
      overallAssessment: this.calculateOverallAssessment(results),
      nextSteps: this.generateNextSteps(results),
      professionalQuestions: this.generateProfessionalQuestions(results)
    };
  }

  /**
   * Generate report when no documents are uploaded
   */
  private generateReportWithoutDocuments(): AnalysisReport {
    return {
      sessionId: this.documentStorage['sessionId'],
      generatedAt: new Date(),
      documentsSummary: {
        total: 0,
        byType: {},
        averageQuality: 0,
        missingDocuments: this.identifyMissingDocuments()
      },
      positiveFindings: [],
      concerns: [],
      risks: [],
      redFlags: [],
      overallAssessment: {
        riskLevel: 'medium',
        confidence: 0.3,
        professionalAdviceUrgency: 'soon'
      },
      nextSteps: [
        'Upload property documents for comprehensive analysis',
        'Consult with a qualified solicitor',
        'Arrange property survey',
        'Review all legal documents with professional guidance'
      ],
      professionalQuestions: {
        solicitor: [
          'What key documents should I obtain before exchange?',
          'Are there any legal risks I should be aware of?',
          'What searches are essential for this property type?'
        ],
        surveyor: [
          'What type of survey is recommended for this property?',
          'What structural issues should I be concerned about?',
          'Are there any visible defects I should investigate?'
        ],
        specialist: [
          'Do I need any specialist reports for this property?',
          'Are there environmental factors to consider?',
          'What insurance considerations should I review?'
        ]
      }
    };
  }

  /**
   * Calculate overall risk assessment
   */
  private calculateOverallAssessment(results: ReturnType<DocumentStorage['getAnalysisResults']>): AnalysisReport['overallAssessment'] {
    const redFlagCount = results.redFlags.length;
    const riskCount = results.risks.length;
    const concernCount = results.concerns.length;

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let urgency: 'routine' | 'soon' | 'urgent' | 'immediate' = 'routine';

    if (redFlagCount > 0) {
      riskLevel = 'critical';
      urgency = 'immediate';
    } else if (riskCount > 0) {
      riskLevel = 'high';
      urgency = 'urgent';
    } else if (concernCount > 2) {
      riskLevel = 'medium';
      urgency = 'soon';
    }

    const allFindings = [...results.redFlags, ...results.risks, ...results.concerns, ...results.positive];
    const averageConfidence = allFindings.length > 0 
      ? allFindings.reduce((sum, f) => sum + f.confidence, 0) / allFindings.length
      : 0.5;

    return {
      riskLevel,
      confidence: averageConfidence,
      professionalAdviceUrgency: urgency
    };
  }

  /**
   * Generate next steps based on findings
   */
  private generateNextSteps(results: ReturnType<DocumentStorage['getAnalysisResults']>): string[] {
    const steps: string[] = [];

    if (results.redFlags.length > 0) {
      steps.push('Immediately consult with relevant professionals about red flag issues');
    }

    if (results.risks.length > 0) {
      steps.push('Urgently review risk items with your solicitor and surveyor');
    }

    steps.push('Review all findings with your professional team');
    steps.push('Obtain any missing critical documents');
    steps.push('Consider additional specialist reports if recommended');

    return steps;
  }

  /**
   * Generate targeted questions for professionals
   */
  private generateProfessionalQuestions(results: ReturnType<DocumentStorage['getAnalysisResults']>): AnalysisReport['professionalQuestions'] {
    const questions = {
      solicitor: ['What are the legal implications of the findings in this report?'],
      surveyor: ['What structural issues require immediate attention?'],
      specialist: ['Are any specialist reports recommended?']
    };

    // Add specific questions based on findings
    for (const finding of [...results.redFlags, ...results.risks]) {
      if (finding.title.includes('Subsidence')) {
        questions.surveyor.push('What is the extent of the subsidence risk and required remediation?');
      }
      if (finding.title.includes('Planning')) {
        questions.solicitor.push('How do planning permission issues affect the purchase?');
      }
      if (finding.title.includes('Lease')) {
        questions.solicitor.push('What are the implications of the short lease term?');
      }
    }

    return questions;
  }

  /**
   * Identify missing documents based on property type
   */
  private identifyMissingDocuments(): string[] {
    const missing: string[] = [];
    const documents = this.documentStorage.getAllDocuments();
    const documentTypes = documents.map(d => this.identifyDocumentType(d));

    if (!documentTypes.includes('ta6')) {
      missing.push('TA6 Property Information Form');
    }
    if (!documentTypes.includes('survey')) {
      missing.push('Property Survey (Homebuyer Report or Building Survey)');
    }
    if (!documentTypes.includes('search')) {
      missing.push('Local Authority and Environmental Searches');
    }

    return missing;
  }

  /**
   * Generate unique result ID
   */
  private generateResultId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 