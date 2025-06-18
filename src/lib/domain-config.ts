export type DomainType = 'property' | 'legal' | 'financial' | 'technical';

export interface DomainContext {
  domain: DomainType;
  organizationId: string;
  workflowId: string;
}

// Detect domain from questionnaire configuration
export function detectDomainFromQuestionnaire(questionnaireConfig: any): DomainType | null {
  if (!questionnaireConfig?.questions?.length) return null;
  
  // Look for domain indicators in question IDs, titles, or content
  const questions = questionnaireConfig.questions;
  
  // Check for property-specific indicators
  if (questions.some((q: any) => 
    q.id?.includes('property') || 
    q.title?.toLowerCase().includes('property') ||
    q.title?.toLowerCase().includes('purchase') ||
    q.title?.toLowerCase().includes('mortgage')
  )) {
    return 'property';
  }
  
  // Check for legal indicators
  if (questions.some((q: any) => 
    q.id?.includes('legal') || 
    q.title?.toLowerCase().includes('legal') ||
    q.title?.toLowerCase().includes('contract') ||
    q.title?.toLowerCase().includes('agreement')
  )) {
    return 'legal';
  }
  
  // Check for financial indicators
  if (questions.some((q: any) => 
    q.id?.includes('financial') || 
    q.title?.toLowerCase().includes('financial') ||
    q.title?.toLowerCase().includes('audit') ||
    q.title?.toLowerCase().includes('investment')
  )) {
    return 'financial';
  }
  
  // Check for technical indicators
  if (questions.some((q: any) => 
    q.id?.includes('technical') || 
    q.title?.toLowerCase().includes('technical') ||
    q.title?.toLowerCase().includes('software') ||
    q.title?.toLowerCase().includes('engineering')
  )) {
    return 'technical';
  }
  
  return null;
}

// Module 3: Document Upload Configuration
export const DOMAIN_DOCUMENT_CONFIGS = {
  property: {
    title: "Property Document Requirements",
    description: "Upload the essential property documents for comprehensive review",
    requiredTypes: [
      {
        id: "purchase_contract",
        name: "Purchase Contract/Offer",
        description: "Sale agreement or accepted offer details",
        required: true,
        accepts: [".pdf", ".doc", ".docx"]
      },
      {
        id: "property_survey",
        name: "Property Survey",
        description: "Structural survey, homebuyer report, or valuation",
        required: true,
        accepts: [".pdf"]
      },
      {
        id: "title_deeds",
        name: "Title Deeds/Land Registry",
        description: "Property ownership and boundary information",
        required: false,
        accepts: [".pdf"]
      },
      {
        id: "search_reports",
        name: "Local Authority Searches",
        description: "Planning, environmental, and drainage searches",
        required: false,
        accepts: [".pdf"]
      },
      {
        id: "mortgage_docs",
        name: "Mortgage Documents",
        description: "Mortgage offer and related financing documents",
        required: false,
        accepts: [".pdf", ".doc", ".docx"]
      }
    ]
  },
  
  legal: {
    title: "Legal Document Upload",
    description: "Provide legal documents for comprehensive analysis and review",
    requiredTypes: [
      {
        id: "primary_contract",
        name: "Primary Contract/Agreement",
        description: "Main legal document requiring review",
        required: true,
        accepts: [".pdf", ".doc", ".docx"]
      },
      {
        id: "supporting_docs",
        name: "Supporting Legal Documents",
        description: "Amendments, schedules, or related agreements",
        required: false,
        accepts: [".pdf", ".doc", ".docx"]
      },
      {
        id: "compliance_docs",
        name: "Compliance Documentation",
        description: "Regulatory or compliance-related materials",
        required: false,
        accepts: [".pdf"]
      },
      {
        id: "precedent_cases",
        name: "Precedent Cases/References",
        description: "Relevant case law or precedent documents",
        required: false,
        accepts: [".pdf"]
      }
    ]
  },
  
  financial: {
    title: "Financial Document Analysis",
    description: "Upload financial documents for comprehensive analysis",
    requiredTypes: [
      {
        id: "financial_statements",
        name: "Financial Statements",
        description: "P&L, Balance Sheet, Cash Flow statements",
        required: true,
        accepts: [".pdf", ".xlsx", ".xls"]
      },
      {
        id: "audit_reports",
        name: "Audit Reports",
        description: "Independent audit findings and reports",
        required: false,
        accepts: [".pdf"]
      },
      {
        id: "tax_documents",
        name: "Tax Documentation",
        description: "Tax returns and related filings",
        required: false,
        accepts: [".pdf"]
      },
      {
        id: "management_accounts",
        name: "Management Accounts",
        description: "Internal financial reporting and analysis",
        required: false,
        accepts: [".pdf", ".xlsx", ".xls"]
      }
    ]
  },
  
  technical: {
    title: "Technical Documentation Upload",
    description: "Provide technical documents for expert analysis",
    requiredTypes: [
      {
        id: "specifications",
        name: "Technical Specifications",
        description: "Detailed technical requirements and specs",
        required: true,
        accepts: [".pdf", ".doc", ".docx"]
      },
      {
        id: "drawings",
        name: "Technical Drawings",
        description: "CAD files, blueprints, schematics",
        required: false,
        accepts: [".pdf", ".dwg", ".jpg", ".png"]
      },
      {
        id: "test_reports",
        name: "Test/Analysis Reports",
        description: "Testing results and technical analysis",
        required: false,
        accepts: [".pdf"]
      },
      {
        id: "manuals",
        name: "Technical Manuals",
        description: "User guides, maintenance manuals",
        required: false,
        accepts: [".pdf", ".doc", ".docx"]
      }
    ]
  }
};

// Module 4: Prompt Templates
export const DOMAIN_PROMPT_TEMPLATES = {
  property: {
    systemPrompt: `You are an expert property advisor and conveyancer with extensive experience in UK property law and transactions. 
Your role is to analyze property documents, identify potential risks, and provide clear, actionable advice to property buyers.

Focus areas:
- Legal title and ownership issues
- Structural and survey concerns  
- Planning and development risks
- Environmental factors
- Financial implications
- Timeline and process guidance

Provide advice that is practical, legally sound, and helps clients make informed decisions about their property purchase.`,
    
    analysisPrompt: `Analyze the uploaded property documents and questionnaire responses to identify:

1. **Critical Issues** - Problems that could prevent or delay the purchase
2. **Significant Concerns** - Issues requiring further investigation or professional advice  
3. **Minor Considerations** - Items to be aware of but unlikely to affect the transaction
4. **Positive Factors** - Strengths and advantages of this property

For each finding, provide:
- Clear description of the issue/factor
- Potential impact on the purchase
- Recommended actions or next steps
- Urgency level (immediate, before exchange, before completion, post-completion)

Use UK property law and current market conditions in your analysis.`,

    summaryPrompt: `Create a comprehensive property review summary that includes:

1. **Executive Summary** - Overall assessment and recommendation
2. **Critical Actions Required** - Immediate steps needed
3. **Professional Recommendations** - Which experts to consult
4. **Timeline Considerations** - Key dates and deadlines
5. **Financial Impact** - Cost implications and budget considerations

Write in clear, non-technical language suitable for property buyers.`
  },
  
  legal: {
    systemPrompt: `You are a qualified legal professional with expertise in contract law, commercial agreements, and legal document analysis.
Your role is to review legal documents, identify risks, and provide clear legal guidance.

Focus areas:
- Contract terms and conditions
- Legal obligations and liabilities
- Compliance requirements
- Risk assessment and mitigation
- Dispute prevention
- Regulatory considerations

Provide analysis that is legally sound, practical, and helps clients understand their legal position.`,
    
    analysisPrompt: `Review the legal documents and questionnaire responses to identify:

1. **High Risk Issues** - Terms or clauses that create significant legal exposure
2. **Compliance Concerns** - Potential regulatory or legal compliance issues
3. **Commercial Considerations** - Terms affecting business operations or finances
4. **Procedural Requirements** - Legal processes or formalities required

For each finding:
- Explain the legal implication in plain English
- Assess the level of risk or concern
- Suggest amendments or protective measures
- Identify any urgent actions required

Apply relevant UK law and current legal precedents.`,

    summaryPrompt: `Prepare a legal review summary containing:

1. **Legal Assessment** - Overall legal position and risk level
2. **Key Recommendations** - Essential actions and amendments
3. **Compliance Requirements** - Legal obligations to fulfill
4. **Risk Mitigation** - Steps to reduce legal exposure
5. **Next Steps** - Immediate and future actions required

Present findings in accessible language for non-legal professionals.`
  },
  
  financial: {
    systemPrompt: `You are a qualified financial analyst with expertise in financial statement analysis, due diligence, and business valuation.
Your role is to analyze financial documents and provide insights on financial health, performance, and risks.

Focus areas:
- Financial performance and trends
- Liquidity and cash flow analysis
- Debt and leverage assessment
- Profitability and efficiency ratios
- Growth prospects and sustainability
- Investment and lending risks

Provide analysis that is technically accurate and commercially relevant.`,
    
    analysisPrompt: `Analyze the financial documents and questionnaire responses to assess:

1. **Financial Health** - Overall financial stability and viability
2. **Performance Trends** - Revenue, profitability, and efficiency trends
3. **Risk Factors** - Financial risks and potential concerns
4. **Opportunities** - Strengths and positive indicators

For each finding:
- Quantify the financial impact where possible
- Compare to industry benchmarks if relevant
- Identify underlying causes or drivers
- Assess implications for stakeholders

Use standard financial analysis techniques and current market conditions.`,

    summaryPrompt: `Create a financial analysis summary including:

1. **Executive Summary** - Overall financial assessment
2. **Key Metrics** - Important financial ratios and indicators
3. **Risk Assessment** - Financial risks and concerns
4. **Investment Perspective** - Attractiveness for investors/lenders
5. **Recommendations** - Actions to improve financial position

Present findings with supporting data and clear explanations.`
  },
  
  technical: {
    systemPrompt: `You are a senior technical expert with deep knowledge across engineering, software, and technical documentation.
Your role is to review technical documents, assess feasibility, and identify technical risks and opportunities.

Focus areas:
- Technical accuracy and completeness
- Standards compliance and best practices
- Feasibility and implementation risks
- Quality and reliability assessment
- Innovation and competitive advantages
- Technical debt and maintenance considerations

Provide analysis that is technically sound and practically applicable.`,
    
    analysisPrompt: `Review the technical documents and questionnaire responses to evaluate:

1. **Technical Viability** - Feasibility of proposed technical solutions
2. **Compliance Issues** - Adherence to standards and regulations
3. **Quality Concerns** - Potential technical risks or deficiencies
4. **Innovation Assessment** - Technical advantages and competitive benefits

For each finding:
- Explain technical implications clearly
- Assess risk levels and potential impact
- Suggest improvements or alternatives
- Identify verification or testing needs

Apply current technical standards and industry best practices.`,

    summaryPrompt: `Develop a technical review summary covering:

1. **Technical Assessment** - Overall technical evaluation
2. **Compliance Status** - Standards and regulatory compliance
3. **Risk Analysis** - Technical risks and mitigation strategies
4. **Implementation Guidance** - Technical recommendations
5. **Quality Assurance** - Testing and validation requirements

Present technical findings in language accessible to stakeholders.`
  }
};

// Module 5: LLM Configuration
export const DOMAIN_LLM_CONFIGS = {
  property: {
    provider: "openai",
    model: "gpt-4",
    temperature: 0.1, // Lower for more consistent legal/property advice
    maxTokens: 2000,
    functions: [
      {
        name: "property_risk_assessment",
        description: "Assess property-specific risks and issues",
        parameters: {
          type: "object",
          properties: {
            riskLevel: { type: "string", enum: ["low", "medium", "high", "critical"] },
            category: { type: "string", enum: ["legal", "structural", "financial", "environmental"] },
            urgency: { type: "string", enum: ["immediate", "before_exchange", "before_completion", "post_completion"] }
          }
        }
      }
    ]
  },
  
  legal: {
    provider: "openai", 
    model: "gpt-4",
    temperature: 0.05, // Very low for legal precision
    maxTokens: 2500,
    functions: [
      {
        name: "legal_risk_analysis",
        description: "Analyze legal risks and compliance issues",
        parameters: {
          type: "object",
          properties: {
            riskLevel: { type: "string", enum: ["low", "medium", "high", "critical"] },
            category: { type: "string", enum: ["contractual", "compliance", "liability", "procedural"] },
            jurisdiction: { type: "string", enum: ["england_wales", "scotland", "northern_ireland", "international"] }
          }
        }
      }
    ]
  },
  
  financial: {
    provider: "openai",
    model: "gpt-4", 
    temperature: 0.2, // Slightly higher for financial analysis creativity
    maxTokens: 2000,
    functions: [
      {
        name: "financial_analysis",
        description: "Perform financial analysis and assessment",
        parameters: {
          type: "object",
          properties: {
            metricType: { type: "string", enum: ["profitability", "liquidity", "leverage", "efficiency"] },
            trend: { type: "string", enum: ["improving", "stable", "declining", "volatile"] },
            riskLevel: { type: "string", enum: ["low", "medium", "high", "critical"] }
          }
        }
      }
    ]
  },
  
  technical: {
    provider: "openai",
    model: "gpt-4",
    temperature: 0.3, // Higher for technical creativity and solutions
    maxTokens: 2000,
    functions: [
      {
        name: "technical_assessment", 
        description: "Assess technical feasibility and compliance",
        parameters: {
          type: "object",
          properties: {
            complexity: { type: "string", enum: ["basic", "intermediate", "advanced", "cutting_edge"] },
            compliance: { type: "string", enum: ["compliant", "minor_issues", "significant_gaps", "non_compliant"] },
            feasibility: { type: "string", enum: ["feasible", "challenging", "high_risk", "not_feasible"] }
          }
        }
      }
    ]
  }
};

// Generate module configurations based on domain
export function generateDomainModuleConfigs(domain: DomainType) {
  return {
    documents: DOMAIN_DOCUMENT_CONFIGS[domain],
    prompts: DOMAIN_PROMPT_TEMPLATES[domain], 
    llm: DOMAIN_LLM_CONFIGS[domain],
    // Additional modules can be added here
  };
}

// Main function to get domain-aware configuration
export async function getDomainAwareConfig(organizationId: string, workflowId: string) {
  // This would typically fetch from database
  // For now, we'll use a placeholder that can be implemented with actual DB calls
  return {
    domain: 'property' as DomainType, // Default or from DB
    organizationId,
    workflowId,
    configs: generateDomainModuleConfigs('property')
  };
} 