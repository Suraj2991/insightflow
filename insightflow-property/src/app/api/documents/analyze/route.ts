import { NextRequest, NextResponse } from 'next/server';
import { GroqAnalysisEngine } from '@/lib/server/groqAnalysisEngine'; // Changed from AnalysisEngine
import { DocumentStorage } from '@/lib/server/documentStorage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentIds, analysisType = 'comprehensive', riskTolerance = 'moderate', userContext } = body;
    
    // Get user ID for rate limiting (simplified - in production use proper auth)
    const userId = request.headers.get('x-user-id') || 
                   request.ip || 
                   'anonymous_' + Math.random().toString(36).substr(2, 9);

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

    // Perform LLM-powered analysis using Groq
    const analysis = await GroqAnalysisEngine.analyzeDocuments(documents, {
      analysisType,
      includeConfidenceScores: true,
      generateQuestions: true,
      riskTolerance, // Pass through risk tolerance
      userId, // Pass user ID for rate limiting
      userContext // Pass survey responses for enhanced analysis
    });

    // Store analysis results
    const analysisId = await DocumentStorage.storeAnalysis(analysis);

    return NextResponse.json({
      success: true,
      analysisId,
      analysis,
      metadata: {
        documentsAnalyzed: documents.length,
        analysisMethod: 'groq_llm',
        model: 'llama-3.1-8b-instant'
      }
    });

  } catch (error) {
    console.error('Groq analysis error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('GROQ_API_KEY')) {
        return NextResponse.json(
          { error: 'Groq API key not configured. Please check your environment variables.' },
          { status: 500 }
        );
      }
      if (error.message.includes('rate limit') || error.message.includes('Daily rate limit exceeded')) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded. Your request has been queued.',
            code: 'RATE_LIMITED',
            retryAfter: 60,
            suggestion: 'Consider upgrading to Developer Tier for higher limits.'
          },
          { status: 429 }
        );
      }
      if (error.message.includes('Service temporarily overloaded')) {
        return NextResponse.json(
          { 
            error: 'Service temporarily overloaded. Please try again in a few minutes.',
            code: 'SERVICE_OVERLOADED',
            retryAfter: 300
          },
          { status: 503 }
        );
      }
      if (error.message.includes('Request timeout')) {
        return NextResponse.json(
          { 
            error: 'Analysis request timed out. Please try again.',
            code: 'REQUEST_TIMEOUT',
            suggestion: 'Try analyzing fewer documents at once.'
          },
          { status: 408 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'LLM analysis failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const analysisId = url.searchParams.get('id');

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID required' },
        { status: 400 }
      );
    }

    const analysis = await DocumentStorage.getAnalysis(analysisId);
    
    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Get analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve analysis' },
      { status: 500 }
    );
  }
} 