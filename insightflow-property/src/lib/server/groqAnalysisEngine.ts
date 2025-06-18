// LLM-Powered Analysis Engine using Groq Function Calling
// Uses structured function calls instead of JSON parsing for reliable output

import Groq from 'groq-sdk';
import { ParsedDocument } from './documentProcessor';
import { AnalysisResult, AnalysisFinding, CitationReference, AnalysisSummary, GeneratedQuestion } from './documentStorage';
import { RateLimitManager } from './rateLimitManager';

export interface AnalysisOptions {
  analysisType: 'basic' | 'comprehensive' | 'focused';
  includeConfidenceScores: boolean;
  generateQuestions: boolean;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  userId?: string; // For rate limiting and user tracking
  userContext?: {
    propertyType?: string;
    purchaseStage?: string;
    timelineMonths?: string;
    budgetRange?: string;
    priorities?: string[];
    concerns?: string[];
    [key: string]: any; // Allow additional survey fields
  };
}

// Function schemas for Groq function calling
const DOCUMENT_ANALYSIS_FUNCTION = {
  name: "analyze_property_document",
  description: "Analyze a UK property document and return structured findings",
  parameters: {
    type: "object",
    properties: {
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["positive", "concern", "risk", "red_flag"],
              description: "Type of finding"
            },
            title: {
              type: "string",
              description: "Brief descriptive title"
            },
            description: {
              type: "string",
              description: "Detailed description under 100 words"
            },
            severity: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Severity level (only low, medium, high - no critical)"
            },
            confidence: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description: "Confidence score between 0 and 1"
            },
            citations: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Direct quotes from the document"
            },
            recommendations: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Specific actionable recommendations"
            }
          },
          required: ["type", "title", "description", "severity", "confidence", "citations", "recommendations"]
        }
      },
      overallRisk: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "Overall risk assessment (only low, medium, high - no critical)"
      },
      keyFindings: {
        type: "array",
        items: {
          type: "string"
        },
        description: "List of key findings"
      },
      recommendedActions: {
        type: "array",
        items: {
          type: "string"
        },
        description: "List of recommended actions"
      }
    },
    required: ["findings", "overallRisk", "keyFindings", "recommendedActions"]
  }
};

const QUESTION_GENERATION_FUNCTION = {
  name: "generate_property_questions",
  description: "Generate specific questions for property professionals based on analysis findings",
  parameters: {
    type: "object",
    properties: {
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: {
              type: "string",
              description: "Specific actionable question"
            },
            category: {
              type: "string",
              enum: ["legal", "structural", "financial", "environmental", "other"],
              description: "Question category"
            },
            priority: {
              type: "string",
              enum: ["high", "medium", "low"],
              description: "Question priority (only high, medium, or low)"
            },
            context: {
              type: "string",
              description: "Why this question is important"
            }
          },
          required: ["question", "category", "priority", "context"]
        }
      }
    },
    required: ["questions"]
  }
};

export class GroqAnalysisEngine {
  private static groq: Groq;

  private static initializeGroq(): Groq {
    if (!this.groq) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('GROQ_API_KEY environment variable is required');
      }
      this.groq = new Groq({ apiKey });
    }
    return this.groq;
  }

  /**
   * Main analysis entry point using LLM with function calling
   */
  public static async analyzeDocuments(
    documents: ParsedDocument[],
    options: AnalysisOptions
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    // Initialize Groq client
    const groq = this.initializeGroq();
    
    // Classify documents
    const classifiedDocs = this.classifyDocuments(documents);
    
    // Run LLM analysis using function calling
    const findings = await this.analyzeLLM(groq, classifiedDocs, options);
    
    // Generate questions using function calling if requested
    const questions = options.generateQuestions 
      ? await this.generateQuestionsLLM(groq, findings, classifiedDocs, options.userId)
      : [];

    // If question generation failed, use fallback
    if (options.generateQuestions && questions.length === 0) {
      console.log('Question generation failed, using fallback questions');
      const fallbackQuestions = this.generateFallbackQuestions(findings);
      questions.push(...fallbackQuestions);
    }

    // Generate summary
    const summary = this.generateSummary(findings, documents);
    
    const processingTime = Date.now() - startTime;
    
    return {
      id: this.generateAnalysisId(),
      documentIds: documents.map(d => d.id),
      findings,
      summary,
      questions,
      confidence: this.calculateOverallConfidence(findings),
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
   * Enhanced document type identification
   */
  private static identifyDocumentType(document: ParsedDocument): string {
    const text = document.text.toLowerCase();
    const filename = document.filename.toLowerCase();
    
    // TA6 Property Information Form
    if (text.includes('property information form') || text.includes('ta6') || filename.includes('ta6')) {
      return 'TA6';
    }
    
    // Survey Reports
    if (text.includes('survey') || text.includes('structural') || filename.includes('survey')) {
      return 'SURVEY';
    }
    
    // Local Authority Search
    if (text.includes('local authority') || text.includes('search') || filename.includes('search')) {
      return 'SEARCH';
    }
    
    // Title Register
    if (text.includes('title') || text.includes('land registry') || filename.includes('title')) {
      return 'TITLE';
    }
    
    // Lease Documents
    if (text.includes('lease') || text.includes('leasehold') || filename.includes('lease')) {
      return 'LEASE';
    }
    
    return 'GENERAL';
  }

  /**
   * Run LLM analysis using function calling instead of JSON parsing
   */
  private static async analyzeLLM(
    groq: Groq,
    classifiedDocs: Map<string, ParsedDocument[]>,
    options: AnalysisOptions
  ): Promise<AnalysisFinding[]> {
    const allFindings: AnalysisFinding[] = [];
    
    for (const [docType, docs] of classifiedDocs) {
      for (const doc of docs) {
        try {
          const findings = await this.analyzeDocumentWithFunctionCalling(groq, doc, docType, options);
          allFindings.push(...findings);
        } catch (error) {
          console.error(`Error analyzing document ${doc.id}:`, error);
          
          // Add fallback finding for failed analysis
          allFindings.push(this.createFinding(
            'concern',
            'Document Analysis Issue',
            `Analysis incomplete for ${doc.filename}. The document may contain important information that requires manual review.`,
            doc,
            0.3,
            'medium',
            []
          ));
        }
      }
    }
    
    return this.deduplicateFindings(allFindings);
  }

  /**
   * Analyze individual document using function calling (no JSON parsing!)
   */
  private static async analyzeDocumentWithFunctionCalling(
    groq: Groq,
    document: ParsedDocument,
    docType: string,
    options: AnalysisOptions
  ): Promise<AnalysisFinding[]> {
    
    const prompt = this.buildAnalysisPrompt(document, docType, options);
    const rateLimitManager = RateLimitManager.getInstance();
    const userId = options.userId || 'anonymous';
    
    // Use function calling for structured output
    const completion = await rateLimitManager.executeWithRateLimit(
      userId,
      () => this.makeGroqRequestWithRetry(groq, {
        messages: [
          {
            role: "system",
            content: `You are a UK property analysis expert. Analyze the document and call the analyze_property_document function with your findings.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.1-8b-instant", // Supports function calling
        temperature: 0.0,
        max_tokens: 2000,
        tools: [{
          type: "function",
          function: DOCUMENT_ANALYSIS_FUNCTION
        }],
        tool_choice: {
          type: "function",
          function: { name: "analyze_property_document" }
        }
      }),
      {
        priority: 'high',
        estimatedTokens: 2000,
        maxWaitTime: 300000
      }
    );

    // Extract function call results (no JSON parsing!)
    const message = completion.choices[0]?.message;
    if (!message?.tool_calls?.[0]) {
      throw new Error('No function call response from LLM');
    }

    const functionCall = message.tool_calls[0];
    if (functionCall.function.name !== 'analyze_property_document') {
      throw new Error('Unexpected function call response');
    }

    // Parse function arguments (Groq guarantees valid JSON for function calls)
    const analysisData = JSON.parse(functionCall.function.arguments);

    return this.convertFunctionCallToFindings(analysisData, document);
  }

  /**
   * Convert function call results to AnalysisFinding objects
   */
  private static convertFunctionCallToFindings(
    analysisData: any,
    document: ParsedDocument
  ): AnalysisFinding[] {
    if (!analysisData.findings || !Array.isArray(analysisData.findings)) {
      throw new Error('Invalid function call response: missing findings array');
    }

    return analysisData.findings.map((finding: any) => {
      const citations = (finding.citations || []).map((cite: string) => ({
        documentId: document.id,
        documentName: document.filename,
        section: 'Content Analysis',
        excerpt: cite,
        confidence: finding.confidence || 0.5,
        pageNumber: undefined
      }));

      return this.createFinding(
        finding.type,
        finding.title,
        finding.description,
        document,
        finding.confidence || 0.5,
        finding.severity || 'medium',
        citations,
        finding.recommendations || []
      );
    });
  }

  /**
   * Build specialized prompt based on document type
   */
  private static buildAnalysisPrompt(
    document: ParsedDocument,
    docType: string,
    options: AnalysisOptions
  ): string {
    
    // Add user context if available
    let contextSection = '';
    if (options.userContext) {
      const timeline = options.userContext.timeline?.urgency || 'standard';
      const riskTolerance = options.userContext.riskTolerance || 'moderate';
      const propertyType = options.userContext.propertyType?.replace(/_/g, ' ') || 'property';
      const isFirstTimeBuyer = options.userContext.specialConsiderations?.firstTimeBuyer;
      const hasSolicitor = options.userContext.professionalTeam?.hasSolicitor;
      const hasSurveyor = options.userContext.professionalTeam?.hasSurveyor;
      
      contextSection = `
BUYER PROFILE & CONTEXT:
Property Type: ${propertyType}
Risk Tolerance: ${riskTolerance} (${riskTolerance === 'conservative' ? 'flag all issues, even minor ones' : riskTolerance === 'moderate' ? 'focus on significant issues' : 'only major concerns'})
Timeline: ${timeline} ${timeline === 'urgent' ? '- prioritize deal-breaking issues' : ''}
${isFirstTimeBuyer ? 'First-Time Buyer: YES - provide extra explanations for complex issues' : ''}
Professional Support: ${hasSolicitor ? '✓ Solicitor instructed' : '⚠ No solicitor yet'} | ${hasSurveyor ? '✓ Surveyor arranged' : '⚠ No survey arranged'}

CRITICAL: Tailor your analysis to this buyer's specific context and risk tolerance level.
Reference their situation in your findings (e.g., "Given your conservative risk approach..." or "As a first-time buyer, you should be aware...")
`;
    }
    
    const basePrompt = `
${contextSection}

Document Type: ${docType}
Filename: ${document.filename}
Risk Tolerance: ${options.riskTolerance || 'moderate'}

Document Content:
${document.text.slice(0, 4000)}

Analyze this UK property document for issues, risks, and positive aspects.

REQUIREMENTS:
- Maximum 3 findings only
- Keep descriptions under 100 words
- Provide specific citations (quoted text from document)
- Give actionable recommendations
- Consider the buyer's profile when assessing severity`;

    // Add document-specific guidance
    switch (docType) {
      case 'TA6':
        return basePrompt + `

Focus specifically on:
- Disputes with neighbors
- Building work and planning permissions  
- Environmental issues
- Utilities and services
- Any disclosed problems`;

      case 'SURVEY':
        return basePrompt + `

Focus specifically on:
- Structural integrity issues
- Damp, moisture, or water damage
- Roof and foundation problems
- Electrical and heating systems
- Safety concerns (asbestos, etc.)`;

      case 'SEARCH':
        return basePrompt + `

Focus specifically on:
- Planning restrictions or enforcement
- Environmental risks
- Contaminated land issues
- Future development plans
- Road and infrastructure changes`;

      case 'TITLE':
        return basePrompt + `

Focus specifically on:
- Ownership complications
- Restrictive covenants
- Rights of way or easements
- Boundary disputes
- Mortgage or charge issues`;

      default:
        return basePrompt;
    }
  }

  /**
   * Generate questions using function calling
   */
  private static async generateQuestionsLLM(
    groq: Groq,
    findings: AnalysisFinding[],
    classifiedDocs: Map<string, ParsedDocument[]>,
    userId: string = 'anonymous'
  ): Promise<GeneratedQuestion[]> {
    
    const findingsSummary = findings.map(f => ({
      type: f.type,
      title: f.title,
      severity: f.severity
    }));

    const prompt = `
Based on these property analysis findings, generate 5-7 specific questions that a property buyer should ask their solicitor, surveyor, or other professionals.

Findings Summary:
${JSON.stringify(findingsSummary, null, 2)}

Generate questions that are:
1. Specific and actionable
2. Appropriate for the professional (solicitor vs surveyor)
3. Help clarify or resolve the identified issues
4. Prioritized by importance

STRICT SCHEMA REQUIREMENTS - FAILURE TO FOLLOW WILL CAUSE ERROR:
- priority: MUST be exactly "high", "medium", or "low" (never "critical")
- category: MUST be exactly "legal", "structural", "financial", "environmental", or "other" (never "general", "planning", or anything else)

Example valid question:
{"question": "What are the structural risks?", "category": "structural", "priority": "high", "context": "Issue description"}`;

    try {
      const rateLimitManager = RateLimitManager.getInstance();
      
      const completion = await rateLimitManager.executeWithRateLimit(
        userId,
        () => this.makeGroqRequestWithRetry(groq, {
          messages: [
            {
              role: "system", 
              content: `You are an expert UK property advisor. Generate specific, actionable questions buyers should ask professionals.`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.2,
          max_tokens: 1000,
          tools: [{
            type: "function",
            function: QUESTION_GENERATION_FUNCTION
          }],
          tool_choice: {
            type: "function",
            function: { name: "generate_property_questions" }
          }
        }),
        {
          priority: 'medium',
          estimatedTokens: 1000,
          maxWaitTime: 180000
        }
      );

      const message = completion.choices[0]?.message;
      if (!message?.tool_calls?.[0]) {
        return [];
      }

      const functionCall = message.tool_calls[0];
      const questionsData = JSON.parse(functionCall.function.arguments);
      
      return questionsData.questions.map((q: any) => ({
        id: this.generateQuestionId(),
        question: q.question,
        category: q.category,
        priority: q.priority,
        context: q.context
      }));

    } catch (error) {
      console.error('Error generating questions:', error);
      
      // Fallback: generate basic questions based on findings
      const fallbackQuestions = this.generateFallbackQuestions(findings);
      return fallbackQuestions;
    }
  }

  /**
   * Create a structured finding
   */
  private static createFinding(
    type: AnalysisFinding['type'],
    title: string,
    description: string,
    document: ParsedDocument,
    confidence: number,
    severity: AnalysisFinding['severity'],
    citations: CitationReference[],
    recommendations: string[] = []
  ): AnalysisFinding {
    return {
      id: this.generateFindingId(),
      type,
      title,
      description,
      confidence: Math.max(0, Math.min(1, confidence)),
      severity,
      citations,
      recommendations: recommendations.length > 0 ? recommendations : this.generateDefaultRecommendations(type, severity)
    };
  }

  /**
   * Generate default recommendations based on finding type and severity
   */
  private static generateDefaultRecommendations(type: string, severity: string): string[] {
    const recommendations = [];
    
    if (severity === 'critical' || type === 'red_flag') {
      recommendations.push('Seek immediate professional legal advice');
      recommendations.push('Consider whether to proceed with purchase');
    } else if (severity === 'high') {
      recommendations.push('Discuss with solicitor before exchange');
      recommendations.push('Obtain specialist assessment if needed');
    } else if (severity === 'medium') {
      recommendations.push('Raise question with professional advisor');
      recommendations.push('Request additional information if necessary');
    } else {
      recommendations.push('Note for discussion during conveyancing process');
    }
    
    return recommendations;
  }

  /**
   * Remove duplicate findings
   */
  private static deduplicateFindings(findings: AnalysisFinding[]): AnalysisFinding[] {
    const seen = new Set<string>();
    return findings.filter(finding => {
      const key = `${finding.title}-${finding.type}`.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Generate enhanced analysis summary with executive overview
   */
  private static generateSummary(findings: AnalysisFinding[], documents: ParsedDocument[]): AnalysisSummary {
    const riskCounts = findings.reduce((acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const overallRisk = this.calculateOverallRisk(riskCounts);
    
    // Enhanced key findings with context
    const highFindings = findings.filter(f => f.severity === 'high');
    const mediumFindings = findings.filter(f => f.severity === 'medium');
    const positiveFindings = findings.filter(f => f.type === 'positive');
    
    const keyFindings = [
      ...highFindings.slice(0, 2).map(f => f.title),
      ...mediumFindings.slice(0, 2).map(f => f.title)
    ].slice(0, 3);

    // Smart recommended actions based on findings
    const recommendedActions = this.generateSmartRecommendations(findings, overallRisk);

    return {
      overallRisk,
      keyFindings,
      documentsAnalyzed: documents.length,
      completeness: documents.length >= 4 ? 0.9 : documents.length / 4,
      recommendedActions,
      // Enhanced summary data
      executiveSummary: this.generateExecutiveSummary(findings, documents, overallRisk),
      riskBreakdown: riskCounts,
      positiveAspects: positiveFindings.slice(0, 3).map(f => f.title)
    };
  }

  /**
   * Generate executive summary for top of report
   */
  private static generateExecutiveSummary(
    findings: AnalysisFinding[],
    documents: ParsedDocument[],
    overallRisk: string
  ): string {
    const docTypes = [...new Set(documents.map(d => this.identifyDocumentType(d)))];
    const highCount = findings.filter(f => f.severity === 'high').length;
    const mediumCount = findings.filter(f => f.severity === 'medium').length;
    const positiveCount = findings.filter(f => f.type === 'positive').length;

    let summary = `Analysis of ${documents.length} property documents (${docTypes.join(', ')}) `;
    
    if (overallRisk === 'high') {
      summary += `identifies HIGH RISK areas requiring immediate professional attention. `;
    } else if (overallRisk === 'medium') {
      summary += `shows moderate concerns requiring professional guidance. `;
    } else {
      summary += `indicates a relatively low-risk purchase opportunity. `;
    }

    if (highCount > 0) {
      summary += `${highCount} high-priority issue${highCount > 1 ? 's' : ''} identified. `;
    }
    if (mediumCount > 0) {
      summary += `${mediumCount} moderate concern${mediumCount > 1 ? 's' : ''} flagged. `;
    }
    if (positiveCount > 0) {
      summary += `${positiveCount} positive aspect${positiveCount > 1 ? 's' : ''} noted. `;
    }

    summary += 'Professional legal and surveying advice strongly recommended before proceeding.';
    
    return summary;
  }

  /**
   * Generate smart recommendations based on findings
   */
  private static generateSmartRecommendations(
    findings: AnalysisFinding[],
    overallRisk: string
  ): string[] {
    const recommendations = [];
    
    const hasStructural = findings.some(f => 
      f.title.toLowerCase().includes('structural') || 
      f.title.toLowerCase().includes('damp') ||
      f.title.toLowerCase().includes('subsidence')
    );
    
    const hasLegal = findings.some(f => 
      f.title.toLowerCase().includes('covenant') || 
      f.title.toLowerCase().includes('boundary') ||
      f.title.toLowerCase().includes('dispute')
    );
    
    const hasPlanning = findings.some(f => 
      f.title.toLowerCase().includes('planning') || 
      f.title.toLowerCase().includes('enforcement')
    );

    if (overallRisk === 'high') {
      recommendations.push('URGENT: Seek immediate professional legal advice before proceeding');
      recommendations.push('Consider whether to continue with this purchase');
    }
    
    if (hasStructural) {
      recommendations.push('Obtain detailed structural survey from qualified surveyor');
    }
    
    if (hasLegal) {
      recommendations.push('Discuss legal issues with conveyancing solicitor immediately');
    }
    
    if (hasPlanning) {
      recommendations.push('Verify planning permissions with local authority');
    }
    
    recommendations.push('Review all findings with qualified professionals');
    recommendations.push('Request additional documentation for unclear areas');
    
    return recommendations.slice(0, 5); // Limit to 5 key recommendations
  }

  /**
   * Calculate overall risk level
   */
  private static calculateOverallRisk(riskCounts: Record<string, number>): 'low' | 'medium' | 'high' {
    if (riskCounts.high > 1) return 'high';
    if (riskCounts.high > 0 || riskCounts.medium > 2) return 'medium';
    return 'low';
  }

  /**
   * Calculate overall confidence score
   */
  private static calculateOverallConfidence(findings: AnalysisFinding[]): number {
    if (findings.length === 0) return 0.5;
    
    const avgConfidence = findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length;
    return Math.round(avgConfidence * 100) / 100;
  }

  // Utility functions
  private static generateAnalysisId(): string {
    return 'analysis_' + Math.random().toString(36).substr(2, 9);
  }

  private static generateFindingId(): string {
    return 'finding_' + Math.random().toString(36).substr(2, 9);
  }

  private static generateQuestionId(): string {
    return 'question_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Make Groq request with exponential backoff for rate limits
   */
  private static async makeGroqRequestWithRetry(groq: Groq, requestOptions: any, maxRetries: number = 1): Promise<any> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await groq.chat.completions.create(requestOptions);
      } catch (error: any) {
        // Check if it's a rate limit error
        if (error.status === 429) {
          const retryAfter = error.headers?.['retry-after'];
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
          
          console.log(`Rate limit hit, waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
          
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        
        // Re-throw error if not rate limit or max retries reached
        throw error;
      }
    }
  }

  /**
   * Generate fallback questions when function calling fails
   */
  private static generateFallbackQuestions(findings: AnalysisFinding[]): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    
    // Create basic questions based on findings
    const criticalFindings = findings.filter(f => f.severity === 'critical');
    const highFindings = findings.filter(f => f.severity === 'high');
    
    if (criticalFindings.length > 0) {
      questions.push({
        id: this.generateQuestionId(),
        question: "What are the immediate risks identified in the property documents, and how should they be addressed?",
        category: "other",
        priority: "high",
        context: "Critical issues were identified that need urgent professional attention.",
        relatedFindings: criticalFindings.map(f => f.id)
      });
    }
    
    if (highFindings.length > 0) {
      questions.push({
        id: this.generateQuestionId(),
        question: "What are the high-priority concerns that could affect my purchase decision?",
        category: "other", 
        priority: "high",
        context: "Several significant issues require professional review before proceeding.",
        relatedFindings: highFindings.map(f => f.id)
      });
    }
    
    // Add standard questions
    questions.push({
      id: this.generateQuestionId(),
      question: "Are there any legal restrictions or covenants that could limit my use of the property?",
      category: "legal",
      priority: "medium",
      context: "Understanding legal limitations is crucial for property ownership.",
      relatedFindings: []
    });
    
    questions.push({
      id: this.generateQuestionId(),
      question: "What are the estimated costs for addressing any structural or maintenance issues identified?",
      category: "structural",
      priority: "medium", 
      context: "Budget planning requires understanding potential additional costs.",
      relatedFindings: []
    });
    
    questions.push({
      id: this.generateQuestionId(),
      question: "Are there any environmental concerns or planning restrictions I should be aware of?",
      category: "environmental",
      priority: "medium",
      context: "Environmental factors could impact property value and enjoyment.",
      relatedFindings: []
    });
    
    return questions.slice(0, 5); // Limit to 5 questions
  }
}