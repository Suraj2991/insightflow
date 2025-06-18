export interface Finding {
  id: string;
  type: 'positive' | 'concern' | 'risk' | 'red_flag';
  title: string;
  description: string;
  confidence: number; // 0-1
  severity: 'low' | 'medium' | 'high' | 'critical';
  citations: Citation[];
  recommendations: string[];
  metadata?: Record<string, any>;
}

export interface Citation {
  documentId: string;
  documentName: string;
  section: string;
  excerpt: string;
  confidence: number; // 0-1
}

export interface AnalysisSummary {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  keyFindings: string[];
  documentsAnalyzed: number;
  completeness: number; // 0-1 score
  recommendedActions: string[];
  executiveSummary?: string;
  riskBreakdown?: Record<string, number>;
  positiveAspects?: string[];
}

export interface Question {
  id: string;
  category: 'solicitor' | 'surveyor' | 'specialist' | 'general';
  question: string;
  priority: 'low' | 'medium' | 'high';
  context: string;
}

export interface AnalysisResult {
  id: string;
  sessionId: string;
  findings: Finding[];
  summary: AnalysisSummary;
  questions: Question[];
  confidence: number; // 0-1
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface FindingsConfig {
  domain: string;
  confidenceThreshold: number; // 0-1, minimum confidence to include finding
  severityThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  enabledTypes: Array<'positive' | 'concern' | 'risk' | 'red_flag'>;
  maxFindingsPerType: number;
  requireCitations: boolean;
  generateQuestions: boolean;
}

// Domain-specific configuration for findings generation
export interface DomainFindingsConfig {
  domain: string;
  commonFindings: {
    positive: string[];
    concerns: string[];
    risks: string[];
    redFlags: string[];
  };
  riskFactors: string[];
  questionTemplates: {
    solicitor: string[];
    surveyor: string[];
    specialist: string[];
  };
  confidenceAdjustments: Record<string, number>;
}

export const DOMAIN_FINDINGS_CONFIG: Record<string, DomainFindingsConfig> = {
  property: {
    domain: 'property',
    commonFindings: {
      positive: [
        'No Contaminated Land Issues',
        'Completed Building Work',
        'No Disclosed Problems',
        'Rights of Way or Easements',
        'Adopted Highway'
      ],
      concerns: [
        'Potential Dispute with Neighbour',
        'Roof Integrity Concern',
        'Damp and Moisture Issue',
        'Minor Structural Issues'
      ],
      risks: [
        'Electrical System Risk',
        'Planning Permission Issues',
        'Boundary Disputes',
        'Restrictive Covenant'
      ],
      redFlags: [
        'Subsidence Evidence',
        'Major Structural Defects',
        'Legal Complications',
        'Environmental Hazards'
      ]
    },
    riskFactors: [
      'age of property',
      'structural condition',
      'legal complications',
      'environmental factors',
      'neighbourhood issues'
    ],
    questionTemplates: {
      solicitor: [
        'What are the legal implications of the findings in this report?',
        'How do planning permission issues affect the purchase?',
        'What key documents should I obtain before exchange?'
      ],
      surveyor: [
        'What structural issues require immediate attention?',
        'What type of survey is recommended for this property?',
        'What is the extent of any structural risk and required remediation?'
      ],
      specialist: [
        'Are any specialist reports recommended?',
        'Do I need any environmental reports for this property?',
        'What insurance considerations should I review?'
      ]
    },
    confidenceAdjustments: {
      'survey_report': 0.9,
      'legal_documents': 0.95,
      'search_reports': 0.85,
      'property_information': 0.8
    }
  },
  legal: {
    domain: 'legal',
    commonFindings: {
      positive: [
        'Compliant Contract Terms',
        'Clear Legal Framework',
        'No Outstanding Issues',
        'Proper Documentation'
      ],
      concerns: [
        'Ambiguous Contract Language',
        'Missing Documentation',
        'Potential Compliance Gaps'
      ],
      risks: [
        'Liability Exposure',
        'Regulatory Non-Compliance',
        'Contract Termination Risk'
      ],
      redFlags: [
        'Legal Violations',
        'Breach of Contract',
        'Regulatory Penalties',
        'Litigation Risk'
      ]
    },
    riskFactors: [
      'regulatory compliance',
      'contract terms',
      'liability exposure',
      'legal precedents'
    ],
    questionTemplates: {
      solicitor: [
        'What are the compliance requirements for this jurisdiction?',
        'How should we address the contract ambiguities?',
        'What liability protections are recommended?'
      ],
      surveyor: [],
      specialist: [
        'Do we need regulatory compliance audit?',
        'What are the industry best practices?',
        'Should we engage specialist legal counsel?'
      ]
    },
    confidenceAdjustments: {
      'contracts': 0.95,
      'compliance_docs': 0.9,
      'legal_opinions': 0.85
    }
  },
  financial: {
    domain: 'financial',
    commonFindings: {
      positive: [
        'Strong Financial Position',
        'Consistent Revenue Growth',
        'Good Cash Flow',
        'Proper Financial Controls'
      ],
      concerns: [
        'Revenue Concentration Risk',
        'Working Capital Issues',
        'Audit Qualifications'
      ],
      risks: [
        'Debt Covenant Breach',
        'Liquidity Risk',
        'Market Risk Exposure'
      ],
      redFlags: [
        'Going Concern Issues',
        'Fraud Indicators',
        'Regulatory Violations',
        'Material Misstatements'
      ]
    },
    riskFactors: [
      'financial stability',
      'cash flow',
      'debt levels',
      'market exposure',
      'regulatory compliance'
    ],
    questionTemplates: {
      solicitor: [
        'What are the legal implications of the financial findings?',
        'How do we address regulatory compliance issues?'
      ],
      surveyor: [],
      specialist: [
        'Should we engage forensic accountants?',
        'What additional financial due diligence is needed?',
        'Do we need independent valuation?'
      ]
    },
    confidenceAdjustments: {
      'financial_statements': 0.95,
      'audit_reports': 0.9,
      'management_accounts': 0.8
    }
  },
  technical: {
    domain: 'technical',
    commonFindings: {
      positive: [
        'Modern Technical Standards',
        'Good Documentation',
        'Compliant Implementation',
        'Best Practice Adherence'
      ],
      concerns: [
        'Legacy System Issues',
        'Documentation Gaps',
        'Performance Concerns'
      ],
      risks: [
        'Security Vulnerabilities',
        'Scalability Issues',
        'Technical Debt'
      ],
      redFlags: [
        'Critical Security Flaws',
        'System Failures',
        'Non-Compliance',
        'Data Loss Risk'
      ]
    },
    riskFactors: [
      'system architecture',
      'security implementation',
      'performance metrics',
      'compliance standards'
    ],
    questionTemplates: {
      solicitor: [
        'What are the legal implications of technical compliance issues?',
        'How do we address intellectual property concerns?'
      ],
      surveyor: [],
      specialist: [
        'Should we engage technical security specialists?',
        'What additional technical assessments are needed?',
        'Do we need independent code review?'
      ]
    },
    confidenceAdjustments: {
      'technical_specs': 0.9,
      'test_reports': 0.85,
      'security_audits': 0.95
    }
  }
}; 