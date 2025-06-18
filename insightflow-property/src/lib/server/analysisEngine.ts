// Server-side Analysis Engine with Confidence Scoring and Citations
// Processes documents and generates structured findings for property review

import { ParsedDocument } from './documentProcessor';
import { AnalysisResult, AnalysisFinding, CitationReference, AnalysisSummary, GeneratedQuestion } from './documentStorage';

export interface AnalysisOptions {
  analysisType: 'basic' | 'comprehensive' | 'focused';
  includeConfidenceScores: boolean;
  generateQuestions: boolean;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
}

export class AnalysisEngine {
  private static readonly DOCUMENT_TYPES = {
    TA6: /TA6|property information form/i,
    SURVEY: /survey|structural|building/i,
    SEARCH: /local authority|water|drainage|environmental/i,
    LEASE: /lease|leasehold|ground rent/i,
    TITLE: /title deed|land registry|ownership/i,
    MORTGAGE: /mortgage|loan|finance/i,
    INSURANCE: /insurance|indemnity/i,
    PLANNING: /planning|building regulations|consent/i
  };

  private static readonly RISK_PATTERNS = {
    HIGH: [
      /structural damage/i,
      /subsidence/i,
      /flooding/i,
      /asbestos/i,
      /japanese knotweed/i,
      /planning enforcement/i,
      /disputed boundary/i,
      /restrictive covenant/i
    ],
    MEDIUM: [
      /damp/i,
      /roof repair/i,
      /electrical/i,
      /heating system/i,
      /service charge/i,
      /ground rent/i,
      /lease extension/i
    ],
    LOW: [
      /cosmetic/i,
      /decoration/i,
      /garden/i,
      /parking/i
    ]
  };

  /**
   * Main analysis entry point
   */
  public static async analyzeDocuments(
    documents: ParsedDocument[],
    options: AnalysisOptions
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    // Classify documents
    const classifiedDocs = this.classifyDocuments(documents);
    
    // Extract findings from each document type
    const findings = await this.extractFindings(classifiedDocs, options);
    
    // Generate summary
    const summary = this.generateSummary(findings, documents);
    
    // Generate questions if requested
    const questions = options.generateQuestions 
      ? this.generateQuestions(findings, classifiedDocs)
      : [];

    const processingTime = Date.now() - startTime;
    
    return {
      id: this.generateAnalysisId(),
      documentIds: documents.map(d => d.id),
      findings,
      summary,
      questions,
      confidence: this.calculateOverallConfidence(findings, documents),
      createdAt: new Date(),
      metadata: {
        analysisType: options.analysisType,
        processingTime,
        documentCount: documents.length
      }
    };
  }

  /**
   * Classify documents by type for targeted analysis
   */
  private static classifyDocuments(documents: ParsedDocument[]): Map<string, ParsedDocument[]> {
    const classified = new Map<string, ParsedDocument[]>();
    
    for (const doc of documents) {
      const docType = this.identifyDocumentType(doc);
      
      if (!classified.has(docType)) {
        classified.set(docType, []);
      }
      classified.get(docType)!.push(doc);
    }
    
    return classified;
  }

  /**
   * Identify document type based on content and filename
   */
  private static identifyDocumentType(document: ParsedDocument): string {
    const text = document.text.toLowerCase();
    const filename = document.filename.toLowerCase();
    
    for (const [type, pattern] of Object.entries(this.DOCUMENT_TYPES)) {
      if (pattern.test(text) || pattern.test(filename)) {
        return type;
      }
    }
    
    return 'GENERAL';
  }

  /**
   * Extract findings from classified documents
   */
  private static async extractFindings(
    classifiedDocs: Map<string, ParsedDocument[]>,
    options: AnalysisOptions
  ): Promise<AnalysisFinding[]> {
    const findings: AnalysisFinding[] = [];
    
    for (const [docType, docs] of classifiedDocs) {
      for (const doc of docs) {
        const docFindings = await this.analyzeDocument(doc, docType, options);
        findings.push(...docFindings);
      }
    }
    
    return this.deduplicateFindings(findings);
  }

  /**
   * Analyze individual document based on its type
   */
  private static async analyzeDocument(
    document: ParsedDocument,
    docType: string,
    options: AnalysisOptions
  ): Promise<AnalysisFinding[]> {
    const findings: AnalysisFinding[] = [];
    const text = document.text;
    
    // Risk pattern analysis
    findings.push(...this.analyzeRiskPatterns(document, text));
    
    // Document-specific analysis
    switch (docType) {
      case 'TA6':
        findings.push(...this.analyzeTA6(document, text));
        break;
      case 'SURVEY':
        findings.push(...this.analyzeSurvey(document, text));
        break;
      case 'SEARCH':
        findings.push(...this.analyzeSearches(document, text));
        break;
      case 'LEASE':
        findings.push(...this.analyzeLease(document, text));
        break;
      default:
        findings.push(...this.analyzeGeneral(document, text));
    }
    
    return findings;
  }

  /**
   * Analyze general risk patterns across all documents
   */
  private static analyzeRiskPatterns(document: ParsedDocument, text: string): AnalysisFinding[] {
    const findings: AnalysisFinding[] = [];
    
    // High risk patterns
    for (const pattern of this.RISK_PATTERNS.HIGH) {
      const matches = text.match(new RegExp(pattern.source, 'gi'));
      if (matches) {
        const uniqueMatches = [...new Set(matches.map(m => m.toLowerCase()))];
        findings.push(this.createFinding(
          'red_flag',
          `High Risk Issue Identified`,
          `Document contains references to potential high-risk issues: ${uniqueMatches.join(', ')}`,
          document,
          0.8,
          'high',
          this.extractCitations(text, pattern, document)
        ));
      }
    }
    
    // Medium risk patterns
    for (const pattern of this.RISK_PATTERNS.MEDIUM) {
      const matches = text.match(new RegExp(pattern.source, 'gi'));
      if (matches) {
        const uniqueMatches = [...new Set(matches.map(m => m.toLowerCase()))];
        findings.push(this.createFinding(
          'concern',
          `Potential Issue Identified`,
          `Document mentions items that may require attention: ${uniqueMatches.join(', ')}`,
          document,
          0.7,
          'medium',
          this.extractCitations(text, pattern, document)
        ));
      }
    }
    
    return findings;
  }

  /**
   * Analyze TA6 Property Information Form
   */
  private static analyzeTA6(document: ParsedDocument, text: string): AnalysisFinding[] {
    const findings: AnalysisFinding[] = [];
    
    // Check for disputes
    if (/dispute|disagreement|complaint/i.test(text)) {
      findings.push(this.createFinding(
        'concern',
        'Potential Disputes Mentioned',
        'TA6 form indicates potential disputes or complaints',
        document,
        0.8,
        'medium',
        this.extractCitations(text, /dispute|disagreement|complaint/i, document)
      ));
    }
    
    // Check for building work
    if (/building work|extension|alteration/i.test(text)) {
      findings.push(this.createFinding(
        'concern',
        'Building Work Disclosed',
        'Property has had building work that may require verification',
        document,
        0.7,
        'medium',
        this.extractCitations(text, /building work|extension|alteration/i, document)
      ));
    }
    
    return findings;
  }

  /**
   * Analyze survey reports
   */
  private static analyzeSurvey(document: ParsedDocument, text: string): AnalysisFinding[] {
    const findings: AnalysisFinding[] = [];
    
    // Check for structural issues
    if (/structural|foundation|load.bearing/i.test(text)) {
      findings.push(this.createFinding(
        'red_flag',
        'Structural Issues Identified',
        'Survey identifies potential structural concerns',
        document,
        0.9,
        'high',
        this.extractCitations(text, /structural|foundation|load.bearing/i, document)
      ));
    }
    
    // Check for damp
    if (/damp|moisture|water damage/i.test(text)) {
      findings.push(this.createFinding(
        'concern',
        'Moisture Issues Noted',
        'Survey identifies damp or moisture issues',
        document,
        0.8,
        'medium',
        this.extractCitations(text, /damp|moisture|water damage/i, document)
      ));
    }
    
    return findings;
  }

  /**
   * Analyze search documents
   */
  private static analyzeSearches(document: ParsedDocument, text: string): AnalysisFinding[] {
    const findings: AnalysisFinding[] = [];
    
    // Environmental risks
    if (/contamination|landfill|industrial/i.test(text)) {
      findings.push(this.createFinding(
        'risk',
        'Environmental Concerns',
        'Search results indicate potential environmental issues',
        document,
        0.8,
        'high',
        this.extractCitations(text, /contamination|landfill|industrial/i, document)
      ));
    }
    
    // Planning issues
    if (/planning enforcement|breach|unauthorized/i.test(text)) {
      findings.push(this.createFinding(
        'red_flag',
        'Planning Enforcement Issues',
        'Planning enforcement actions or breaches identified',
        document,
        0.9,
        'high',
        this.extractCitations(text, /planning enforcement|breach|unauthorized/i, document)
      ));
    }
    
    return findings;
  }

  /**
   * Analyze lease documents
   */
  private static analyzeLease(document: ParsedDocument, text: string): AnalysisFinding[] {
    const findings: AnalysisFinding[] = [];
    
    // Short lease
    const leaseYears = text.match(/(\d+)\s*years?/i);
    if (leaseYears && parseInt(leaseYears[1]) < 80) {
      findings.push(this.createFinding(
        'concern',
        'Short Lease Term',
        `Lease has ${leaseYears[1]} years remaining, which may affect mortgageability`,
        document,
        0.9,
        'medium',
        this.extractCitations(text, /\d+\s*years?/i, document)
      ));
    }
    
    // Ground rent escalation
    if (/ground rent.*increase|escalating|doubling/i.test(text)) {
      findings.push(this.createFinding(
        'risk',
        'Ground Rent Escalation',
        'Ground rent contains escalation clauses that may increase costs significantly',
        document,
        0.8,
        'high',
        this.extractCitations(text, /ground rent.*increase|escalating|doubling/i, document)
      ));
    }
    
    return findings;
  }

  /**
   * Analyze general documents
   */
  private static analyzeGeneral(document: ParsedDocument, text: string): AnalysisFinding[] {
    const findings: AnalysisFinding[] = [];
    
    // Look for positive indicators
    if (/excellent condition|recently renovated|new/i.test(text)) {
      findings.push(this.createFinding(
        'positive',
        'Positive Property Features',
        'Document indicates positive aspects of the property',
        document,
        0.7,
        'low',
        this.extractCitations(text, /excellent condition|recently renovated|new/i, document)
      ));
    }
    
    return findings;
  }

  /**
   * Create a finding with proper structure
   */
  private static createFinding(
    type: AnalysisFinding['type'],
    title: string,
    description: string,
    document: ParsedDocument,
    confidence: number,
    severity: AnalysisFinding['severity'],
    citations: CitationReference[]
  ): AnalysisFinding {
    return {
      id: this.generateFindingId(),
      type,
      title,
      description,
      confidence,
      severity,
      citations,
      recommendations: this.generateRecommendations(type, severity)
    };
  }

  /**
   * Extract citations from text matches
   */
  private static extractCitations(text: string, pattern: RegExp, document: ParsedDocument): CitationReference[] {
    const citations: CitationReference[] = [];
    const matches = Array.from(text.matchAll(new RegExp(pattern.source, 'gi')));
    
    for (const match of matches.slice(0, 3)) { // Limit to 3 citations
      if (match.index !== undefined) {
        const start = Math.max(0, match.index - 50);
        const end = Math.min(text.length, match.index + match[0].length + 50);
        const excerpt = text.slice(start, end).trim();
        
        citations.push({
          documentId: document.id,
          documentName: document.filename,
          section: this.findSectionForPosition(document, match.index),
          excerpt: `...${excerpt}...`,
          confidence: document.quality.confidence
        });
      }
    }
    
    return citations;
  }

  /**
   * Find section for a text position
   */
  private static findSectionForPosition(document: ParsedDocument, position: number): string {
    let currentPosition = 0;
    
    for (const section of document.metadata.sections) {
      if (position >= currentPosition && position < currentPosition + section.content.length) {
        return section.title;
      }
      currentPosition += section.content.length;
    }
    
    return 'Document Content';
  }

  /**
   * Generate recommendations based on finding type and severity
   */
  private static generateRecommendations(type: string, severity: string): string[] {
    const recommendations: string[] = [];
    
    if (severity === 'high' || severity === 'critical') {
      recommendations.push('Seek immediate professional advice');
      recommendations.push('Consider obtaining specialist inspection');
    }
    
    if (type === 'red_flag') {
      recommendations.push('This issue requires expert verification before proceeding');
      recommendations.push('Discuss with your solicitor and surveyor');
    }
    
    return recommendations;
  }

  /**
   * Remove duplicate findings
   */
  private static deduplicateFindings(findings: AnalysisFinding[]): AnalysisFinding[] {
    const seen = new Set<string>();
    return findings.filter(finding => {
      const key = `${finding.type}_${finding.title}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Generate analysis summary
   */
  private static generateSummary(findings: AnalysisFinding[], documents: ParsedDocument[]): AnalysisSummary {
    const redFlags = findings.filter(f => f.type === 'red_flag').length;
    const risks = findings.filter(f => f.type === 'risk').length;
    const concerns = findings.filter(f => f.type === 'concern').length;
    
    let overallRisk: AnalysisSummary['overallRisk'] = 'low';
    if (redFlags > 0) {
      overallRisk = 'critical';
    } else if (risks > 2) {
      overallRisk = 'high';
    } else if (risks > 0 || concerns > 3) {
      overallRisk = 'medium';
    }
    
    const keyFindings = findings
      .filter(f => f.severity === 'high' || f.severity === 'critical')
      .slice(0, 5)
      .map(f => f.title);
    
    const avgConfidence = documents.reduce((sum, doc) => sum + doc.quality.confidence, 0) / documents.length;
    
    return {
      overallRisk,
      keyFindings,
      documentsAnalyzed: documents.length,
      completeness: avgConfidence,
      recommendedActions: this.generateRecommendedActions(overallRisk, findings)
    };
  }

  /**
   * Generate recommended actions based on risk level
   */
  private static generateRecommendedActions(risk: string, findings: AnalysisFinding[]): string[] {
    const actions: string[] = [];
    
    if (risk === 'critical') {
      actions.push('Do not proceed without expert consultation');
      actions.push('Obtain specialist surveys for identified issues');
    }
    
    if (findings.some(f => f.type === 'red_flag')) {
      actions.push('Discuss all red flags with your solicitor');
    }
    
    actions.push('Review all findings with your professional advisors');
    actions.push('Consider negotiating on price based on identified issues');
    
    return actions;
  }

  /**
   * Generate questions for professional consultation
   */
  private static generateQuestions(findings: AnalysisFinding[], classifiedDocs: Map<string, ParsedDocument[]>): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    
    // Generate questions based on findings
    for (const finding of findings.slice(0, 10)) { // Limit to 10 questions
      if (finding.severity === 'high' || finding.severity === 'critical') {
        questions.push({
          id: this.generateQuestionId(),
          category: this.categorizeQuestion(finding),
          question: `What are the implications of: ${finding.title}?`,
          priority: finding.severity === 'critical' ? 'urgent' : 'high',
          context: finding.description,
          relatedFindings: [finding.id]
        });
      }
    }
    
    return questions;
  }

  /**
   * Categorize question based on finding
   */
  private static categorizeQuestion(finding: AnalysisFinding): GeneratedQuestion['category'] {
    const title = finding.title.toLowerCase();
    
    if (title.includes('legal') || title.includes('planning') || title.includes('enforcement')) {
      return 'legal';
    }
    if (title.includes('structural') || title.includes('survey') || title.includes('building')) {
      return 'structural';
    }
    if (title.includes('cost') || title.includes('rent') || title.includes('service charge')) {
      return 'financial';
    }
    if (title.includes('contamination') || title.includes('environmental')) {
      return 'environmental';
    }
    
    return 'other';
  }

  /**
   * Calculate overall confidence score
   */
  private static calculateOverallConfidence(findings: AnalysisFinding[], documents: ParsedDocument[]): number {
    const docConfidence = documents.reduce((sum, doc) => sum + doc.quality.confidence, 0) / documents.length;
    const findingConfidence = findings.length > 0 
      ? findings.reduce((sum, finding) => sum + finding.confidence, 0) / findings.length
      : 0.8;
    
    return (docConfidence + findingConfidence) / 2;
  }

  /**
   * Generate unique IDs
   */
  private static generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateFindingId(): string {
    return `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateQuestionId(): string {
    return `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 