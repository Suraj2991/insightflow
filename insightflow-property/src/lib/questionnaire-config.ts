import { QuestionnaireConfig } from '@/types/questionnaire'

export const propertyQuestionnaireConfig: QuestionnaireConfig = {
  id: 'uk-property-review-v1',
  title: 'Property Document Review Questionnaire',
  description: 'Help us understand your property and situation to provide better document analysis and professional consultation guidance.',
  
  disclaimers: {
    initial: 'This tool provides decision support only. All findings require professional verification. We help you organize your questions, not provide final recommendations.',
    intermediate: [
      'Remember: This analysis is to help you prepare for professional consultations.',
      'Your solicitor and surveyor will provide the final expert advice you need.'
    ],
    final: 'Based on your responses, we\'ll help you organize your documents and prepare questions for your professional team. This is not a substitute for expert legal and surveying advice.'
  },

  professionalAdviceGuidance: {
    solicitorQuestions: [
      'What legal risks should I be most concerned about?',
      'Are there any unusual clauses in the contract?',
      'What searches are absolutely critical for this property?',
      'What happens if issues are found before exchange?'
    ],
    surveyorQuestions: [
      'What are the most significant structural concerns?',
      'What should I budget for immediate repairs?',
      'Are there any deal-breaker issues?',
      'What should I monitor after moving in?'
    ],
    generalAdvice: [
      'Schedule your solicitor consultation within 1 week of instruction',
      'Book your survey as soon as your offer is accepted',
      'Keep all property documents organized and accessible',
      'Don\'t hesitate to ask professionals to explain anything unclear'
    ]
  },

  steps: [
    // Step 1: Initial Disclaimer and Consent
    {
      id: 'initial_consent',
      title: 'Important: Understanding This Tool',
      description: 'Before we begin, please confirm you understand what this tool does and doesn\'t do.',
      type: 'boolean',
      required: true,
      helpText: 'This tool helps you organize your property documents and prepare better questions for professionals. It does not replace legal or surveying advice.',
      professionalNote: 'This ensures users understand the tool\'s limitations and the need for professional advice.'
    },

    // Step 2: Property Type
    {
      id: 'property_type',
      title: 'What type of property are you buying?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'house_freehold', label: 'Freehold House', description: 'You own the building and the land' },
        { value: 'house_leasehold', label: 'Leasehold House', description: 'You own the building but lease the land' },
        { value: 'flat_leasehold', label: 'Leasehold Flat/Apartment', description: 'Most common for flats and apartments' },
        { value: 'new_build', label: 'New Build Property', description: 'Recently constructed or under construction' },
        { value: 'period_property', label: 'Period Property', description: 'Victorian, Edwardian, Georgian, or older' },
        { value: 'other', label: 'Other/Unique Property', description: 'Unusual property type or mixed use' }
      ],
      helpText: 'This affects what documents you\'ll need and what risks to consider.',
      professionalNote: 'Different property types have different legal and structural considerations.'
    },

    // Step 3: Property Age and Value
    {
      id: 'property_details',
      title: 'Property Details',
      description: 'Tell us more about the property specifics.',
      type: 'multiple_choice',
      required: false,
      options: [
        { value: 'property_age_pre_1900', label: 'Built before 1900', description: 'Period property with potential heritage considerations' },
        { value: 'property_age_1900_1950', label: 'Built 1900-1950', description: 'Early 20th century construction' },
        { value: 'property_age_1950_2000', label: 'Built 1950-2000', description: 'Post-war to modern construction' },
        { value: 'property_age_post_2000', label: 'Built after 2000', description: 'Modern construction standards' },
        { value: 'property_value_under_200k', label: 'Under £200,000', description: 'Lower value property' },
        { value: 'property_value_200k_500k', label: '£200,000 - £500,000', description: 'Mid-range property value' },
        { value: 'property_value_500k_1m', label: '£500,000 - £1,000,000', description: 'Higher value property' },
        { value: 'property_value_over_1m', label: 'Over £1,000,000', description: 'High value property' }
      ],
      helpText: 'This helps us understand potential risks and required documentation.'
    },

    // Step 4: Leasehold Information (Conditional)
    {
      id: 'leasehold_details',
      title: 'Leasehold Information',
      description: 'Since this is a leasehold property, we need some additional details.',
      type: 'multiple_choice',
      required: true,
      conditionalOn: {
        field: 'property_type',
        value: ['house_leasehold', 'flat_leasehold']
      },
      options: [
        { value: 'lease_over_100_years', label: 'More than 100 years remaining', description: 'Long lease, minimal impact on value' },
        { value: 'lease_80_100_years', label: '80-100 years remaining', description: 'Good lease length' },
        { value: 'lease_60_80_years', label: '60-80 years remaining', description: 'May affect mortgage and value' },
        { value: 'lease_under_60_years', label: 'Less than 60 years remaining', description: 'Significant impact on value and mortgageability' },
        { value: 'ground_rent_low', label: 'Ground rent under £250/year', description: 'Reasonable ground rent' },
        { value: 'ground_rent_high', label: 'Ground rent over £250/year', description: 'High ground rent may affect value' },
        { value: 'service_charge_known', label: 'Service charges disclosed', description: 'You have the service charge information' },
        { value: 'management_company_info', label: 'Management company details available', description: 'You have management company information' }
      ],
      helpText: 'Leasehold properties have additional legal considerations that affect value and your rights.',
      professionalNote: 'Critical for solicitor review - lease terms significantly impact property value and usability.'
    },

    // Step 5: Location and Environmental
    {
      id: 'location_details',
      title: 'Location and Environmental Factors',
      description: 'Help us understand the location-specific risks.',
      type: 'multiple_choice',
      required: false,
      options: [
        { value: 'flood_risk_area', label: 'Property in flood risk area', description: 'Located in area with flood risk' },
        { value: 'conservation_area', label: 'Conservation area', description: 'Property in conservation area with planning restrictions' },
        { value: 'listed_building', label: 'Listed building', description: 'Grade I, II*, or II listed property' },
        { value: 'new_development', label: 'New development area', description: 'Property in recently developed area' },
        { value: 'city_centre', label: 'City centre location', description: 'Central urban location' },
        { value: 'rural_location', label: 'Rural location', description: 'Countryside or village location' },
        { value: 'near_transport', label: 'Near major transport links', description: 'Close to train stations, motorways, airports' },
        { value: 'mining_area', label: 'Former mining area', description: 'Area with historical mining activity' }
      ],
      helpText: 'Location affects what searches and surveys might be most important.'
    },

    // Step 6: Risk Tolerance
    {
      id: 'risk_tolerance',
      title: 'How would you describe your approach to property risks?',
      type: 'single_choice',
      required: true,
      options: [
        { 
          value: 'conservative', 
          label: 'Conservative - I want to know about every potential issue',
          description: 'I prefer to identify and understand all possible risks, even minor ones'
        },
        { 
          value: 'moderate', 
          label: 'Balanced - Focus on significant issues',
          description: 'I want to know about important issues but don\'t need every minor detail'
        },
        { 
          value: 'aggressive', 
          label: 'Risk-tolerant - Only flag major concerns',
          description: 'I\'m comfortable with normal property risks and only want to know about serious issues'
        }
      ],
      helpText: 'This affects how we prioritize and present potential issues in your documents.',
      professionalNote: 'Helps tailor the analysis sensitivity to the buyer\'s comfort level.'
    },

    // Step 7: Timeline and Urgency
    {
      id: 'timeline',
      title: 'Transaction Timeline',
      description: 'When do you need to exchange and complete?',
      type: 'multiple_choice',
      required: true,
      options: [
        { value: 'exchange_within_2_weeks', label: 'Exchange within 2 weeks', description: 'Very urgent timeline' },
        { value: 'exchange_2_4_weeks', label: 'Exchange in 2-4 weeks', description: 'Moderate urgency' },
        { value: 'exchange_1_2_months', label: 'Exchange in 1-2 months', description: 'Standard timeline' },
        { value: 'exchange_flexible', label: 'Flexible timeline', description: 'No rush on exchange' },
        { value: 'completion_4_weeks', label: 'Complete within 4 weeks of exchange', description: 'Quick completion needed' },
        { value: 'completion_flexible', label: 'Flexible completion', description: 'Standard completion timeline' },
        { value: 'chain_dependent', label: 'Dependent on property chain', description: 'Timeline depends on other transactions' }
      ],
      helpText: 'Tight timelines affect how quickly you need professional advice and which issues to prioritize.',
      professionalNote: 'Critical for scheduling professional consultations and prioritizing urgent issues.'
    },

    // Step 8: Professional Team Status
    {
      id: 'professional_team',
      title: 'Your Professional Team',
      description: 'Do you already have professionals working on this purchase?',
      type: 'multiple_choice',
      required: true,
      options: [
        { value: 'solicitor_instructed', label: 'Solicitor already instructed', description: 'You have a solicitor working on the purchase' },
        { value: 'solicitor_researching', label: 'Researching solicitors', description: 'Looking for a solicitor to instruct' },
        { value: 'solicitor_none', label: 'No solicitor yet', description: 'Haven\'t started looking for legal representation' },
        { value: 'survey_booked', label: 'Survey already booked', description: 'Professional survey scheduled or completed' },
        { value: 'survey_researching', label: 'Researching surveyors', description: 'Looking for a surveyor to book' },
        { value: 'survey_none', label: 'No survey arranged', description: 'Haven\'t arranged a professional survey yet' },
        { value: 'broker_involved', label: 'Mortgage broker involved', description: 'Using a mortgage broker for financing' },
        { value: 'estate_agent_help', label: 'Estate agent providing guidance', description: 'Getting advice from the selling/buying agent' }
      ],
      helpText: 'We\'ll tailor our advice based on what professional support you already have in place.',
      professionalNote: 'Determines what additional professional services might be needed.'
    },

    // Step 9: Document Availability - Comprehensive Checklist
    {
      id: 'documents_available',
      title: 'Property Document Checklist',
      description: 'Here are the typical documents involved in a UK property purchase. Select which ones you currently have:',
      type: 'multiple_choice',
      required: true,
      options: [
        // Essential Legal Documents
        { value: 'ta6', label: 'TA6 Property Information Form', description: 'Seller\'s property disclosure form' },
        { value: 'ta10', label: 'TA10 Fixtures & Fittings Form', description: 'What\'s included in the sale' },
        { value: 'draft_contract', label: 'Draft Contract/Title Deeds', description: 'Legal ownership documents' },
        
        // Searches (Official)
        { value: 'local_authority_search', label: 'Local Authority Search', description: 'Planning, roads, and local issues' },
        { value: 'environmental_search', label: 'Environmental Search', description: 'Contamination and environmental risks' },
        { value: 'water_drainage_search', label: 'Water & Drainage Search', description: 'Water supply and sewerage' },
        { value: 'coal_mining_search', label: 'Coal Mining Search', description: 'If in former mining area' },
        
        // Surveys and Inspections
        { value: 'homebuyer_survey', label: 'Homebuyer Survey/Building Survey', description: 'Professional structural assessment' },
        { value: 'mortgage_valuation', label: 'Mortgage Valuation', description: 'Lender\'s property valuation' },
        
        // Certificates and Compliance
        { value: 'epc', label: 'Energy Performance Certificate (EPC)', description: 'Energy efficiency rating' },
        { value: 'gas_safety', label: 'Gas Safety Certificate', description: 'If property has gas appliances' },
        { value: 'electrical_certificate', label: 'Electrical Safety Certificate', description: 'Recent electrical inspection' },
        
        // Leasehold Specific (if applicable)
        { value: 'lease_document', label: 'Lease Document', description: 'Full lease terms and conditions' },
        { value: 'service_charge_accounts', label: 'Service Charge Accounts', description: 'Building management finances' },
        { value: 'ground_rent_details', label: 'Ground Rent Information', description: 'Annual ground rent amount and terms' },
        
        // Additional Property Information
        { value: 'planning_permissions', label: 'Planning Permissions', description: 'For any extensions or alterations' },
        { value: 'building_regulations', label: 'Building Regulations Certificates', description: 'For recent building work' },
        { value: 'warranties', label: 'NHBC/Structural Warranties', description: 'New build or recent work warranties' },
        
        // Other Documents
        { value: 'other_documents', label: 'Other Relevant Documents', description: 'Management company info, restrictive covenants, etc.' }
      ],
      helpText: 'Don\'t worry if you don\'t have everything - most buyers start with just a few documents. We\'ll help you understand what\'s missing and prioritize what to obtain.',
      professionalNote: 'Comprehensive document tracking enables better gap analysis and prioritization of missing documentation.'
    },

    // Step 10: Special Considerations
    {
      id: 'special_considerations',
      title: 'Special Considerations',
      description: 'Are there any specific needs or circumstances we should consider?',
      type: 'multiple_choice',
      required: false,
      options: [
        { value: 'first_time_buyer', label: 'First-time buyer', description: 'This is my first property purchase' },
        { value: 'investment_property', label: 'Investment/rental property', description: 'I plan to rent this out' },
        { value: 'accessibility_needs', label: 'Accessibility requirements', description: 'Property needs to accommodate specific accessibility needs' },
        { value: 'family_specific', label: 'Family-specific needs', description: 'Schools, family space, etc.' },
        { value: 'business_use', label: 'Business/mixed use', description: 'Property will be used partly for business' }
      ],
      helpText: 'This helps us identify issues that might be particularly important for your situation.',
      professionalNote: 'Special circumstances may require additional professional advice or specific legal considerations.'
    },

    // Step 11: Professional Advice Timeline
    {
      id: 'advice_timeline',
      title: 'Professional Consultation Planning',
      description: 'When do you plan to consult with professionals about your findings?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'asap', label: 'As soon as possible', description: 'I want to discuss findings immediately' },
        { value: 'this_week', label: 'Within this week', description: 'I can schedule consultations this week' },
        { value: 'next_week', label: 'Next week', description: 'I\'ll arrange meetings next week' },
        { value: 'flexible', label: 'Flexible timing', description: 'No rush, I can schedule when convenient' }
      ],
      helpText: 'This helps us prioritize urgent issues and suggest appropriate next steps.',
      professionalNote: 'Timeline affects how quickly urgent issues need to be flagged and addressed.'
    },

    // Step 12: Final Understanding Confirmation
    {
      id: 'final_confirmation',
      title: 'Final Confirmation',
      description: 'Please confirm your understanding before we analyze your information.',
      type: 'boolean',
      required: true,
      helpText: 'By proceeding, you confirm that you understand this tool provides decision support only, and that all findings require professional verification.',
      professionalNote: 'Final consent ensures users understand they need professional follow-up on all findings.'
    }
  ]
} 