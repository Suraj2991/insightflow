import { NextRequest, NextResponse } from 'next/server';
import { GroqAnalysisEngine } from '@/lib/server/groqAnalysisEngine';
import { DocumentStorage } from '@/lib/server/documentStorage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentIds, analysisType = 'progressive', userContext } = body;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: 'No document IDs provided' },
        { status: 400 }
      );
    }

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API not configured. Please add GROQ_API_KEY to environment variables.' },
        { status: 500 }
      );
    }

    // Retrieve documents from storage
    const documents = [];
    for (const id of documentIds) {
      const doc = await DocumentStorage.getDocument(id);
      if (doc) {
        documents.push(doc);
      }
    }

    if (documents.length === 0) {
      return NextResponse.json(
        { error: 'No valid documents found' },
        { status: 404 }
      );
    }

    // PROGRESSIVE APPROACH: Analyze most important documents first
    const prioritizedDocs = prioritizeDocuments(documents);
    
    // Start with quick scan of all documents
    const quickFindings = await Promise.all(
      prioritizedDocs.slice(0, 2).map(doc => 
        quickAnalyzeDocument(doc, userContext)
      )
    );

    // Create initial analysis result
    const partialAnalysis = {
      id: generateAnalysisId(),
      documentIds: documents.map(d => d.id),
      findings: quickFindings.flat(),
      summary: generateQuickSummary(quickFindings.flat(), documents),
      questions: [],
      confidence: 0.7, // Lower confidence for quick analysis
      status: 'partial',
      progress: Math.round((2 / documents.length) * 100),
      createdAt: new Date(),
      metadata: {
        analysisType: 'progressive',
        processingTime: Date.now(),
        documentCount: documents.length,
        phase: 'quick_scan'
      }
    };

    // Store partial results
    const analysisId = await DocumentStorage.storeAnalysis(partialAnalysis);

    // Return quick results immediately
    return NextResponse.json({
      success: true,
      analysisId,
      analysis: partialAnalysis,
      metadata: {
        documentsAnalyzed: 2,
        totalDocuments: documents.length,
        analysisMethod: 'progressive_groq',
        model: 'llama-3.1-8b-instant',
        status: 'partial',
        nextPhase: 'detailed_analysis'
      }
    });

  } catch (error) {
    console.error('Progressive analysis error:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Progressive analysis failed' },
      { status: 500 }
    );
  }
}

/**
 * Prioritize documents by importance for analysis
 */
function prioritizeDocuments(documents: any[]): any[] {
  const priority: Record<string, number> = {
    'TA6': 1,
    'SURVEY': 2, 
    'SEARCH': 3,
    'TITLE': 4,
    'EPC': 5,
    'GENERAL': 6
  };

  return documents.sort((a, b) => {
    const aPriority = priority[identifyDocumentType(a)] || 10;
    const bPriority = priority[identifyDocumentType(b)] || 10;
    return aPriority - bPriority;
  });
}

/**
 * Quick document type identification
 */
function identifyDocumentType(document: any): string {
  const text = document.text.toLowerCase();
  const filename = document.filename.toLowerCase();
  
  if (text.includes('property information form') || text.includes('ta6') || filename.includes('ta6')) {
    return 'TA6';
  }
  if (text.includes('survey') || text.includes('structural') || filename.includes('survey')) {
    return 'SURVEY';
  }
  if (text.includes('local authority') || text.includes('search') || filename.includes('search')) {
    return 'SEARCH';
  }
  if (text.includes('title') || text.includes('land registry') || filename.includes('title')) {
    return 'TITLE';
  }
  if (text.includes('epc') || text.includes('energy performance') || filename.includes('epc')) {
    return 'EPC';
  }
  
  return 'GENERAL';
}

/**
 * Quick analysis using simplified prompts for speed
 */
async function quickAnalyzeDocument(document: any, userContext: any): Promise<any[]> {
  try {
    // Use faster, simpler analysis for quick results
    const quickFindings = await GroqAnalysisEngine.analyzeDocuments([document], {
      analysisType: 'basic', // Faster mode
      includeConfidenceScores: false,
      generateQuestions: false,
      riskTolerance: 'moderate',
      userId: 'progressive_' + Math.random().toString(36).substr(2, 9), // Add user ID for rate limiting
      userContext
    });

    return quickFindings.findings.slice(0, 2); // Limit to top 2 findings per doc
  } catch (error) {
    console.error('Quick analysis failed:', error);
    return [{
      id: generateFindingId(),
      type: 'concern',
      title: 'Document Review Needed',
      description: `${document.filename} requires manual review`,
      confidence: 0.5,
      severity: 'medium',
      citations: [],
      recommendations: ['Review document with professional advisor']
    }];
  }
}

/**
 * Generate quick summary for partial results
 */
function generateQuickSummary(findings: any[], documents: any[]): any {
  const riskCounts = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const overallRisk = riskCounts.critical > 0 ? 'critical' : 
                     riskCounts.high > 0 ? 'high' : 
                     riskCounts.medium > 1 ? 'medium' : 'low';

  return {
    overallRisk,
    keyFindings: findings.slice(0, 3).map(f => f.title),
    documentsAnalyzed: Math.min(2, documents.length),
    completeness: Math.min(2, documents.length) / documents.length,
    recommendedActions: [
      'Initial scan complete - detailed analysis in progress',
      'Review preliminary findings below',
      'Full analysis will provide more comprehensive insights'
    ],
    executiveSummary: `Quick scan of ${Math.min(2, documents.length)} priority documents completed. ${findings.length} initial findings identified. Detailed analysis continuing in background.`,
    status: 'partial'
  };
}

// Utility functions
function generateAnalysisId(): string {
  return 'analysis_' + Math.random().toString(36).substr(2, 9);
}

function generateFindingId(): string {
  return 'finding_' + Math.random().toString(36).substr(2, 9);
} 