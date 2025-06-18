// Questionnaire Types with Confidence Scoring and Professional Advice Integration

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive'

export type PropertyType = 
  | 'house_freehold'
  | 'house_leasehold' 
  | 'flat_leasehold'
  | 'new_build'
  | 'period_property'
  | 'other'

export type DocumentType = 
  | 'ta6'
  | 'home_survey'
  | 'searches'
  | 'epc'
  | 'leasehold_pack'
  | 'other'

export interface DocumentAvailability {
  type: DocumentType
  available: boolean
  quality?: 'digital' | 'scanned' | 'poor_scan'
  notes?: string
}

export interface ProfessionalTeam {
  hasSolicitor: boolean
  solicitorName?: string
  hasSurveyor: boolean
  surveyorType?: 'homebuyer' | 'building_survey' | 'valuation'
  otherProfessionals?: string[]
}

export interface QuestionnaireResponse {
  // Property Information
  propertyType: PropertyType
  propertyAge?: string
  propertyValue?: number
  location: {
    postcode?: string
    floodZone?: boolean
    conservationArea?: boolean
  }
  
  // Leasehold Specific
  leasehold?: {
    yearsRemaining?: number
    groundRent?: number
    serviceCharge?: number
    managementCompany?: string
  }
  
  // Buyer Context
  riskTolerance: RiskTolerance
  timeline: {
    exchangeDate?: Date
    completionDate?: Date
    urgency: 'relaxed' | 'normal' | 'urgent'
  }
  
  // Professional Support
  professionalTeam: ProfessionalTeam
  professionalAdviceTimeline: {
    solicitorConsultation?: Date
    surveyBooked?: boolean
    surveyDate?: Date
  }
  
  // Document Status
  documentsAvailable: DocumentAvailability[]
  
  // Special Considerations
  specialConsiderations: {
    accessibility?: boolean
    familyNeeds?: string[]
    investmentProperty?: boolean
    firstTimeBuyer?: boolean
  }
  
  // Consent and Understanding
  disclaimerAccepted: boolean
  understandsLimitations: boolean
  professionalAdviceRequired: boolean
  
  // Metadata
  sessionId: string
  completedAt?: Date
  confidenceScore?: number
}

export interface QuestionStep {
  id: string
  title: string
  description?: string
  type: 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'date' | 'boolean'
  options?: { value: string; label: string; description?: string }[]
  required: boolean
  conditionalOn?: {
    field: string
    value: any
  }
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  helpText?: string
  professionalNote?: string // Explains why this matters for professional advice
}

export interface QuestionnaireConfig {
  id: string
  title: string
  description: string
  steps: QuestionStep[]
  disclaimers: {
    initial: string
    intermediate: string[]
    final: string
  }
  professionalAdviceGuidance: {
    solicitorQuestions: string[]
    surveyorQuestions: string[]
    generalAdvice: string[]
  }
}

export interface QuestionnaireProgress {
  currentStep: number
  totalSteps: number
  completedSteps: string[]
  canProceed: boolean
  warnings: string[]
  missingCriticalInfo: string[]
}

export interface ConfidenceMetrics {
  overallConfidence: number // 0-100
  dataCompleteness: number // 0-100
  documentCoverage: number // 0-100
  riskAssessmentReliability: number // 0-100
  professionalAdviceUrgency: 'low' | 'medium' | 'high'
} 