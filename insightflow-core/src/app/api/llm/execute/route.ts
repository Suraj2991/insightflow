import { NextResponse } from 'next/server';
import { processSystemPrompt } from '@/modules/llm/types';

export async function POST(request: Request) {
  try {
    const { 
      systemPrompt, 
      userPrompt, 
      documents, 
      questionnaireData, 
      includeQuestionnaire = true,
      provider = 'openai',
      model = 'gpt-4',
      temperature = 0.1,
      maxTokens = 4000 
    } = await request.json();

    // Process system prompt with questionnaire data if available
    const finalSystemPrompt = processSystemPrompt(
      systemPrompt, 
      includeQuestionnaire ? questionnaireData : null, 
      !includeQuestionnaire
    );

    // Build the full prompt with document context
    const documentContext = documents?.length > 0 
      ? `\n\nDOCUMENTS TO ANALYZE:\n${documents.map((doc: any, index: number) => 
          `Document ${index + 1} (${doc.filename}):\n${doc.content}`
        ).join('\n\n')}`
      : '';

    const fullUserPrompt = `${userPrompt}${documentContext}`;

    // Mock LLM response for now (replace with actual LLM integration)
    const mockResponse = {
      analysis: `Based on the ${includeQuestionnaire ? 'questionnaire responses and ' : ''}document analysis, here are the key findings:

${includeQuestionnaire && questionnaireData?.questions?.length > 0 
  ? `**Client Context from Questionnaire:**
${questionnaireData.questions.map((q: any, i: number) => `${i + 1}. ${q.title}: ${q.answer || 'Not answered'}`).join('\n')}

` : ''}**Document Analysis:**
- Risk Assessment: Medium
- Key Issues Identified: 3 areas requiring attention
- Recommendations: 5 action items
- Compliance Status: Generally compliant with minor issues

${includeQuestionnaire 
  ? '**Cross-Reference Analysis:** Document content aligns with questionnaire responses. No significant contradictions identified.'
  : '**Note:** Analysis performed without questionnaire context. Consider completing client questionnaire for more personalized insights.'}`,
      
      findings: [
        {
          type: 'risk',
          level: 'medium',
          title: 'Document Review Required',
          description: includeQuestionnaire 
            ? 'Based on client concerns mentioned in questionnaire, additional review recommended for sections 3.2 and 4.1'
            : 'Standard document review recommended for sections 3.2 and 4.1',
          recommendation: 'Schedule expert review within 5 business days'
        }
      ],
      
      metadata: {
        includeQuestionnaire,
        questionnaireQuestions: includeQuestionnaire ? questionnaireData?.questions?.length || 0 : 0,
        documentsAnalyzed: documents?.length || 0,
        analysisMode: includeQuestionnaire ? 'questionnaire_enhanced' : 'document_only'
      }
    };

    return NextResponse.json({
      success: true,
      response: mockResponse,
      systemPrompt: finalSystemPrompt,
      config: {
        provider,
        model,
        temperature,
        maxTokens,
        includeQuestionnaire
      }
    });

  } catch (error) {
    console.error('LLM execution error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute LLM analysis' },
      { status: 500 }
    );
  }
} 