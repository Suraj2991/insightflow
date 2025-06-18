import { Question } from './types';

export interface QuestionTemplate {
  id: string;
  type: 'text' | 'single_choice' | 'multiple_choice' | 'boolean' | 'number';
  title: string;
  description?: string;
  required: boolean;
  options?: Array<{
    id: string;
    label: string;
    value: string;
    description?: string;
  }>;
}

export interface DomainConfig {
  name: string;
  description: string;
  questions: QuestionTemplate[];
}

export const DOMAIN_TEMPLATES: Record<string, DomainConfig> = {
  property: {
    name: "Property Review",
    description: "Questions for property purchase and due diligence",
    questions: [
      {
        id: "property_type",
        type: "single_choice",
        title: "What type of property are you buying?",
        description: "This affects what documents you'll need and what risks to consider.",
        required: true,
        options: [
          { id: "freehold_house", label: "Freehold House", value: "freehold_house", description: "You own the building and the land" },
          { id: "leasehold_house", label: "Leasehold House", value: "leasehold_house", description: "You own the building but lease the land" },
          { id: "flat_leasehold", label: "Leasehold Flat/Apartment", value: "flat_leasehold", description: "Most common for flats and apartments" },
          { id: "new_build", label: "New Build Property", value: "new_build", description: "Recently constructed or under construction" },
          { id: "period_property", label: "Period Property", value: "period_property", description: "Victorian, Edwardian, Georgian, or older" }
        ]
      },
      {
        id: "property_value",
        type: "single_choice",
        title: "What is the approximate value of the property?",
        description: "Property value affects survey requirements and legal considerations.",
        required: true,
        options: [
          { id: "under_200k", label: "Under £200,000", value: "under_200k", description: "Lower value property" },
          { id: "200k_500k", label: "£200,000 - £500,000", value: "200k_500k", description: "Mid-range property value" },
          { id: "500k_1m", label: "£500,000 - £1,000,000", value: "500k_1m", description: "Higher value property" },
          { id: "over_1m", label: "Over £1,000,000", value: "over_1m", description: "High value property" }
        ]
      },
      {
        id: "location_factors",
        type: "multiple_choice",
        title: "Which location factors apply to this property?",
        description: "Location affects what searches and surveys might be most important.",
        required: false,
        options: [
          { id: "flood_risk", label: "Flood risk area", value: "flood_risk", description: "Property in area with flood risk" },
          { id: "conservation_area", label: "Conservation area", value: "conservation_area", description: "Planning restrictions apply" },
          { id: "listed_building", label: "Listed building", value: "listed_building", description: "Grade I, II*, or II listed property" },
          { id: "mining_area", label: "Former mining area", value: "mining_area", description: "Historical mining activity" }
        ]
      },
      {
        id: "timeline_urgency",
        type: "single_choice",
        title: "What is your transaction timeline?",
        description: "Timeline affects how quickly you need professional advice.",
        required: true,
        options: [
          { id: "urgent_2weeks", label: "Exchange within 2 weeks", value: "urgent_2weeks", description: "Very urgent timeline" },
          { id: "moderate_1month", label: "Exchange in 1 month", value: "moderate_1month", description: "Standard timeline" },
          { id: "flexible", label: "Flexible timeline", value: "flexible", description: "No rush on exchange" }
        ]
      },
      {
        id: "risk_tolerance",
        type: "single_choice",
        title: "How would you describe your approach to property risks?",
        description: "This affects how we prioritize and present potential issues.",
        required: true,
        options: [
          { id: "conservative", label: "Conservative - I want to know about every potential issue", value: "conservative", description: "Identify all possible risks" },
          { id: "moderate", label: "Balanced - Focus on significant issues", value: "moderate", description: "Important issues without minor details" },
          { id: "aggressive", label: "Risk-tolerant - Only flag major concerns", value: "aggressive", description: "Comfortable with normal property risks" }
        ]
      },
      {
        id: "professional_team",
        type: "multiple_choice",
        title: "Which professionals do you already have in place?",
        description: "We'll tailor advice based on your existing professional support.",
        required: false,
        options: [
          { id: "solicitor", label: "Solicitor instructed", value: "solicitor", description: "Legal representation secured" },
          { id: "surveyor", label: "Survey booked", value: "surveyor", description: "Professional survey arranged" },
          { id: "broker", label: "Mortgage broker", value: "broker", description: "Financing assistance" }
        ]
      },
      {
        id: "specific_concerns",
        type: "text",
        title: "Are there any specific concerns or requirements you have about this property?",
        description: "e.g., structural issues, planning permissions, accessibility needs",
        required: false
      }
    ]
  },

  legal: {
    name: "Legal Document Review",
    description: "Questions for legal document analysis and compliance",
    questions: [
      {
        id: "document_type",
        type: "single_choice",
        title: "What type of legal documents are you reviewing?",
        description: "Document type affects the review approach and focus areas.",
        required: true,
        options: [
          { id: "contracts", label: "Contracts", value: "contracts", description: "Service, employment, or commercial contracts" },
          { id: "agreements", label: "Legal Agreements", value: "agreements", description: "Partnership, licensing, or settlement agreements" },
          { id: "compliance", label: "Compliance Documents", value: "compliance", description: "Regulatory or policy compliance materials" },
          { id: "litigation", label: "Litigation Materials", value: "litigation", description: "Court filings or dispute-related documents" }
        ]
      },
      {
        id: "review_purpose",
        type: "single_choice",
        title: "What is the primary purpose of this legal review?",
        description: "Purpose determines the depth and focus of analysis.",
        required: true,
        options: [
          { id: "due_diligence", label: "Due Diligence", value: "due_diligence", description: "Pre-transaction or acquisition review" },
          { id: "risk_assessment", label: "Risk Assessment", value: "risk_assessment", description: "Identify potential legal risks" },
          { id: "compliance_check", label: "Compliance Check", value: "compliance_check", description: "Ensure regulatory compliance" },
          { id: "dispute_analysis", label: "Dispute Analysis", value: "dispute_analysis", description: "Litigation or conflict assessment" }
        ]
      },
      {
        id: "jurisdiction",
        type: "single_choice",
        title: "Which jurisdiction's laws apply?",
        description: "Legal jurisdiction affects applicable laws and regulations.",
        required: true,
        options: [
          { id: "england_wales", label: "England & Wales", value: "england_wales", description: "English law applies" },
          { id: "scotland", label: "Scotland", value: "scotland", description: "Scottish law applies" },
          { id: "northern_ireland", label: "Northern Ireland", value: "northern_ireland", description: "Northern Irish law applies" },
          { id: "international", label: "International/Multiple", value: "international", description: "Cross-border or multiple jurisdictions" }
        ]
      },
      {
        id: "urgency_level",
        type: "single_choice",
        title: "How urgent is this legal review?",
        description: "Urgency affects prioritization and turnaround time.",
        required: true,
        options: [
          { id: "immediate", label: "Immediate (24 hours)", value: "immediate", description: "Critical urgent review needed" },
          { id: "urgent", label: "Urgent (1 week)", value: "urgent", description: "High priority review" },
          { id: "standard", label: "Standard (2-4 weeks)", value: "standard", description: "Normal business timeline" },
          { id: "comprehensive", label: "Comprehensive (1+ months)", value: "comprehensive", description: "Thorough detailed analysis" }
        ]
      },
      {
        id: "risk_areas",
        type: "multiple_choice",
        title: "Which risk areas should we focus on?",
        description: "Select the areas of highest concern for this review.",
        required: false,
        options: [
          { id: "liability", label: "Liability Issues", value: "liability", description: "Exposure to legal liability" },
          { id: "compliance", label: "Regulatory Compliance", value: "compliance", description: "Meeting legal requirements" },
          { id: "financial", label: "Financial Terms", value: "financial", description: "Payment and financial obligations" },
          { id: "termination", label: "Termination Clauses", value: "termination", description: "Exit and termination terms" }
        ]
      }
    ]
  },

  financial: {
    name: "Financial Document Review",
    description: "Questions for financial analysis and due diligence",
    questions: [
      {
        id: "financial_documents",
        type: "multiple_choice",
        title: "What types of financial documents are you reviewing?",
        description: "Document types determine the analysis approach.",
        required: true,
        options: [
          { id: "financial_statements", label: "Financial Statements", value: "financial_statements", description: "P&L, balance sheet, cash flow" },
          { id: "audit_reports", label: "Audit Reports", value: "audit_reports", description: "Independent audit findings" },
          { id: "tax_documents", label: "Tax Documents", value: "tax_documents", description: "Tax returns and related filings" },
          { id: "management_accounts", label: "Management Accounts", value: "management_accounts", description: "Internal financial reporting" }
        ]
      },
      {
        id: "analysis_purpose",
        type: "single_choice",
        title: "What is the purpose of this financial analysis?",
        description: "Purpose guides the focus and depth of review.",
        required: true,
        options: [
          { id: "investment", label: "Investment Decision", value: "investment", description: "Evaluating investment opportunity" },
          { id: "acquisition", label: "Acquisition Due Diligence", value: "acquisition", description: "Pre-acquisition analysis" },
          { id: "lending", label: "Lending Assessment", value: "lending", description: "Credit or loan evaluation" },
          { id: "performance", label: "Performance Review", value: "performance", description: "Business performance analysis" }
        ]
      },
      {
        id: "time_period",
        type: "single_choice",
        title: "What time period do these documents cover?",
        description: "Time period affects trend analysis and forecasting.",
        required: true,
        options: [
          { id: "current_year", label: "Current Year", value: "current_year", description: "Year-to-date information" },
          { id: "1_year", label: "1 Year", value: "1_year", description: "12 months of data" },
          { id: "3_years", label: "3 Years", value: "3_years", description: "Three-year trend analysis" },
          { id: "5_plus_years", label: "5+ Years", value: "5_plus_years", description: "Long-term historical data" }
        ]
      },
      {
        id: "key_metrics",
        type: "multiple_choice",
        title: "Which financial metrics are most important?",
        description: "Focus areas for detailed analysis.",
        required: false,
        options: [
          { id: "profitability", label: "Profitability", value: "profitability", description: "Revenue, margins, net income" },
          { id: "liquidity", label: "Liquidity", value: "liquidity", description: "Cash flow and working capital" },
          { id: "debt", label: "Debt & Leverage", value: "debt", description: "Debt levels and ratios" },
          { id: "growth", label: "Growth Trends", value: "growth", description: "Revenue and profit growth" }
        ]
      }
    ]
  },

  technical: {
    name: "Technical Document Review",
    description: "Questions for technical documentation and specifications",
    questions: [
      {
        id: "technical_domain",
        type: "single_choice",
        title: "What technical domain do these documents cover?",
        description: "Domain determines specialized knowledge requirements.",
        required: true,
        options: [
          { id: "software", label: "Software/IT", value: "software", description: "Software specifications, code documentation" },
          { id: "engineering", label: "Engineering", value: "engineering", description: "Technical drawings, specifications" },
          { id: "manufacturing", label: "Manufacturing", value: "manufacturing", description: "Process documentation, quality specs" },
          { id: "research", label: "Research & Development", value: "research", description: "Research reports, technical studies" }
        ]
      },
      {
        id: "document_types",
        type: "multiple_choice",
        title: "What types of technical documents are included?",
        description: "Document types affect the review methodology.",
        required: true,
        options: [
          { id: "specifications", label: "Technical Specifications", value: "specifications", description: "Detailed technical requirements" },
          { id: "drawings", label: "Technical Drawings", value: "drawings", description: "CAD drawings, blueprints, schematics" },
          { id: "manuals", label: "User/Technical Manuals", value: "manuals", description: "Operating and maintenance guides" },
          { id: "reports", label: "Test/Analysis Reports", value: "reports", description: "Testing results and analysis" }
        ]
      },
      {
        id: "review_focus",
        type: "single_choice",
        title: "What is the primary focus of this technical review?",
        description: "Focus determines the depth and methodology of analysis.",
        required: true,
        options: [
          { id: "compliance", label: "Standards Compliance", value: "compliance", description: "Meeting technical standards and regulations" },
          { id: "feasibility", label: "Technical Feasibility", value: "feasibility", description: "Assessing technical viability" },
          { id: "quality", label: "Quality Assurance", value: "quality", description: "Quality and reliability assessment" },
          { id: "innovation", label: "Innovation Assessment", value: "innovation", description: "Evaluating technical innovation" }
        ]
      },
      {
        id: "complexity_level",
        type: "single_choice",
        title: "How would you rate the technical complexity?",
        description: "Complexity affects resource allocation and timeline.",
        required: true,
        options: [
          { id: "basic", label: "Basic", value: "basic", description: "Standard technical documentation" },
          { id: "intermediate", label: "Intermediate", value: "intermediate", description: "Moderately complex technical content" },
          { id: "advanced", label: "Advanced", value: "advanced", description: "Highly technical and complex" },
          { id: "cutting_edge", label: "Cutting Edge", value: "cutting_edge", description: "Novel or experimental technology" }
        ]
      }
    ]
  }
};

export function generateQuestionnaire(domain: string, questionCount: number): Question[] {
  const domainConfig = DOMAIN_TEMPLATES[domain];
  if (!domainConfig) {
    throw new Error(`Unknown domain: ${domain}`);
  }

  // Select questions up to the requested count
  const selectedTemplates = domainConfig.questions.slice(0, questionCount);
  
  // Convert templates to actual questions
  return selectedTemplates.map((template, index) => ({
    id: `${domain}_question_${index + 1}_${Date.now()}`,
    type: template.type,
    title: template.title,
    description: template.description,
    required: template.required,
    options: template.options
  }));
}

export function getDomainOptions() {
  return Object.entries(DOMAIN_TEMPLATES).map(([key, config]) => ({
    id: key,
    label: config.name,
    value: key,
    description: config.description
  }));
}

export function getMaxQuestionsForDomain(domain: string): number {
  const domainConfig = DOMAIN_TEMPLATES[domain];
  return domainConfig ? domainConfig.questions.length : 0;
} 