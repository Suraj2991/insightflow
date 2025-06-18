// Question Types
export type QuestionType = 'text' | 'single_choice' | 'multiple_choice' | 'boolean' | 'number';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  description?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[]; // For choice questions
  placeholder?: string; // For text questions
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface QuestionnaireConfig {
  title: string;
  description?: string;
  questions: Question[];
}

export interface QuestionnaireForm {
  organizationId: string;
  workflowId: string;
  title: string;
  description?: string;
  config: QuestionnaireConfig;
  isActive: boolean;
}

export interface QuestionnaireResponse {
  sessionId: string;
  questionnaireId: string;
  answers: Record<string, any>; // questionId -> answer
  completedAt?: Date;
}

// Default questionnaire for demo - Property Review Questions
export const defaultQuestionnaireConfig: QuestionnaireConfig = {
  title: "Property Document Review Questionnaire",
  description: "Please answer these questions to help us understand your property purchase and document review requirements.",
  questions: [
    {
      id: "initial_consent",
      type: "boolean",
      title: "Important: Understanding This Tool",
      description: "Before we begin, please confirm you understand what this tool does and doesn't do. This tool helps you organize your property documents and prepare better questions for professionals. It does not replace legal or surveying advice.",
      required: true
    },
    {
      id: "property_type",
      type: "single_choice",
      title: "What type of property are you buying?",
      description: "This affects what documents you'll need and what risks to consider.",
      required: true,
      options: [
        { id: "house_freehold", label: "Freehold House", value: "house_freehold", description: "You own the building and the land" },
        { id: "house_leasehold", label: "Leasehold House", value: "house_leasehold", description: "You own the building but lease the land" },
        { id: "flat_leasehold", label: "Leasehold Flat/Apartment", value: "flat_leasehold", description: "Most common for flats and apartments" },
        { id: "new_build", label: "New Build Property", value: "new_build", description: "Recently constructed or under construction" },
        { id: "period_property", label: "Period Property", value: "period_property", description: "Victorian, Edwardian, Georgian, or older" },
        { id: "other", label: "Other/Unique Property", value: "other", description: "Unusual property type or mixed use" }
      ]
    },
    {
      id: "property_details",
      type: "multiple_choice",
      title: "Property Details",
      description: "Tell us more about the property specifics. This helps us understand potential risks and required documentation.",
      required: false,
      options: [
        { id: "property_age_pre_1900", label: "Built before 1900", value: "property_age_pre_1900", description: "Period property with potential heritage considerations" },
        { id: "property_age_1900_1950", label: "Built 1900-1950", value: "property_age_1900_1950", description: "Early 20th century construction" },
        { id: "property_age_1950_2000", label: "Built 1950-2000", value: "property_age_1950_2000", description: "Post-war to modern construction" },
        { id: "property_age_post_2000", label: "Built after 2000", value: "property_age_post_2000", description: "Modern construction standards" },
        { id: "property_value_under_200k", label: "Under £200,000", value: "property_value_under_200k", description: "Lower value property" },
        { id: "property_value_200k_500k", label: "£200,000 - £500,000", value: "property_value_200k_500k", description: "Mid-range property value" },
        { id: "property_value_500k_1m", label: "£500,000 - £1,000,000", value: "property_value_500k_1m", description: "Higher value property" },
        { id: "property_value_over_1m", label: "Over £1,000,000", value: "property_value_over_1m", description: "High value property" }
      ]
    },
    {
      id: "location_details",
      type: "multiple_choice",
      title: "Location and Environmental Factors",
      description: "Help us understand the location-specific risks. Location affects what searches and surveys might be most important.",
      required: false,
      options: [
        { id: "flood_risk_area", label: "Property in flood risk area", value: "flood_risk_area", description: "Located in area with flood risk" },
        { id: "conservation_area", label: "Conservation area", value: "conservation_area", description: "Property in conservation area with planning restrictions" },
        { id: "listed_building", label: "Listed building", value: "listed_building", description: "Grade I, II*, or II listed property" },
        { id: "new_development", label: "New development area", value: "new_development", description: "Property in recently developed area" },
        { id: "city_centre", label: "City centre location", value: "city_centre", description: "Central urban location" },
        { id: "rural_location", label: "Rural location", value: "rural_location", description: "Countryside or village location" },
        { id: "near_transport", label: "Near major transport links", value: "near_transport", description: "Close to train stations, motorways, airports" },
        { id: "mining_area", label: "Former mining area", value: "mining_area", description: "Area with historical mining activity" }
      ]
    },
    {
      id: "risk_tolerance",
      type: "single_choice",
      title: "How would you describe your approach to property risks?",
      description: "This affects how we prioritize and present potential issues in your documents.",
      required: true,
      options: [
        { 
          id: "conservative", 
          label: "Conservative - I want to know about every potential issue",
          value: "conservative",
          description: "I prefer to identify and understand all possible risks, even minor ones"
        },
        { 
          id: "moderate", 
          label: "Balanced - Focus on significant issues",
          value: "moderate",
          description: "I want to know about important issues but don't need every minor detail"
        },
        { 
          id: "aggressive", 
          label: "Risk-tolerant - Only flag major concerns",
          value: "aggressive",
          description: "I'm comfortable with normal property risks and only want to know about serious issues"
        }
      ]
    }
  ]
}; 