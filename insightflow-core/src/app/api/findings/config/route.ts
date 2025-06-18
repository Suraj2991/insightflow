import { NextRequest, NextResponse } from 'next/server';
import { getFindingsConfig, saveFindingsConfig } from '@/lib/db';

// Domain-specific findings templates
const DOMAIN_FINDINGS_TEMPLATES = {
  property: {
    categories: [
      {
        id: 'legal_compliance',
        name: 'Legal Compliance',
        description: 'Legal and regulatory compliance findings',
        color: '#dc2626',
        priority: 'high'
      },
      {
        id: 'financial_analysis',
        name: 'Financial Analysis',
        description: 'Financial viability and risk assessment',
        color: '#059669',
        priority: 'high'
      },
      {
        id: 'market_conditions',
        name: 'Market Conditions',
        description: 'Market analysis and comparative assessment',
        color: '#0891b2',
        priority: 'medium'
      },
      {
        id: 'physical_condition',
        name: 'Physical Condition',
        description: 'Property condition and maintenance findings',
        color: '#7c3aed',
        priority: 'medium'
      },
      {
        id: 'recommendations',
        name: 'Recommendations',
        description: 'Action items and strategic recommendations',
        color: '#ea580c',
        priority: 'high'
      }
    ],
    extractionRules: [
      {
        pattern: /risk|concern|issue|problem/i,
        category: 'legal_compliance',
        confidence: 0.8
      },
      {
        pattern: /value|price|cost|financial|revenue/i,
        category: 'financial_analysis',
        confidence: 0.7
      },
      {
        pattern: /market|comparable|location|neighborhood/i,
        category: 'market_conditions',
        confidence: 0.6
      }
    ]
  },
  legal: {
    categories: [
      {
        id: 'contractual_obligations',
        name: 'Contractual Obligations',
        description: 'Key terms and obligations identified',
        color: '#dc2626',
        priority: 'high'
      },
      {
        id: 'legal_risks',
        name: 'Legal Risks',
        description: 'Potential legal risks and liabilities',
        color: '#ea580c',
        priority: 'high'
      },
      {
        id: 'compliance_requirements',
        name: 'Compliance Requirements',
        description: 'Regulatory and compliance obligations',
        color: '#7c3aed',
        priority: 'medium'
      },
      {
        id: 'recommendations',
        name: 'Legal Recommendations',
        description: 'Legal advice and recommended actions',
        color: '#059669',
        priority: 'high'
      }
    ]
  },
  financial: {
    categories: [
      {
        id: 'financial_metrics',
        name: 'Financial Metrics',
        description: 'Key financial ratios and indicators',
        color: '#059669',
        priority: 'high'
      },
      {
        id: 'risk_indicators',
        name: 'Risk Indicators',
        description: 'Financial risks and warning signs',
        color: '#dc2626',
        priority: 'high'
      },
      {
        id: 'performance_trends',
        name: 'Performance Trends',
        description: 'Financial performance over time',
        color: '#0891b2',
        priority: 'medium'
      },
      {
        id: 'investment_recommendations',
        name: 'Investment Recommendations',
        description: 'Investment advice and opportunities',
        color: '#7c3aed',
        priority: 'high'
      }
    ]
  },
  technical: {
    categories: [
      {
        id: 'technical_specifications',
        name: 'Technical Specifications',
        description: 'Technical requirements and specifications',
        color: '#0891b2',
        priority: 'high'
      },
      {
        id: 'implementation_risks',
        name: 'Implementation Risks',
        description: 'Technical risks and challenges',
        color: '#dc2626',
        priority: 'high'
      },
      {
        id: 'quality_assessment',
        name: 'Quality Assessment',
        description: 'Quality standards and compliance',
        color: '#059669',
        priority: 'medium'
      },
      {
        id: 'optimization_opportunities',
        name: 'Optimization Opportunities',
        description: 'Improvement suggestions and alternatives',
        color: '#7c3aed',
        priority: 'medium'
      }
    ]
  }
};

export async function GET() {
  try {
    const config = await getFindingsConfig();
    
    // If no config exists, create default based on domain
    if (!config) {
      const domain = 'property'; // Default domain for now
      const template = DOMAIN_FINDINGS_TEMPLATES[domain as keyof typeof DOMAIN_FINDINGS_TEMPLATES] || DOMAIN_FINDINGS_TEMPLATES.property;
      
      const defaultConfig = {
        domain,
        workflowId: 'demo',
        categories: template.categories,
        extractionRules: template.extractionRules || [],
        settings: {
          autoExtraction: true,
          confidenceThreshold: 0.7,
          maxFindingsPerCategory: 10,
          enableSentimentAnalysis: true,
          groupSimilarFindings: true
        },
        scoring: {
          enableConfidenceScoring: true,
          weightFactors: {
            textMatching: 0.4,
            contextRelevance: 0.3,
            domainExpertise: 0.3
          }
        }
      };

      return NextResponse.json({ 
        success: true, 
        config: defaultConfig,
        isDefault: true
      });
    }

    return NextResponse.json({ 
      success: true, 
      config: JSON.parse(config.config),
      isDefault: false
    });
  } catch (error) {
    console.error('Error fetching findings config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch findings configuration' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    
    await saveFindingsConfig(JSON.stringify(config));
    
    return NextResponse.json({ 
      success: true, 
      config,
      message: 'Findings configuration saved successfully',
      isDefault: false
    });
  } catch (error) {
    console.error('Error saving findings config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save findings configuration' 
    }, { status: 500 });
  }
} 