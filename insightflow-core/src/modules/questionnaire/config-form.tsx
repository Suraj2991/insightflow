'use client';

import React, { useState, useEffect } from 'react';
import { QuestionnaireConfig, defaultQuestionnaireConfig, Question, QuestionType } from './types';
import { getDomainOptions, generateQuestionnaire } from './question-generator';

interface QuestionnaireConfigFormProps {
  onSave?: (config: QuestionnaireConfig) => void;
  onPreview?: (config: QuestionnaireConfig) => void;
}

export default function QuestionnaireConfigForm({
  onSave,
  onPreview
}: QuestionnaireConfigFormProps) {
  const [config, setConfig] = useState<QuestionnaireConfig>(defaultQuestionnaireConfig);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [organizationId, setOrganizationId] = useState<string>('');
  
  // NEW: Primary domain selection state
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [domainConfigured, setDomainConfigured] = useState(false);

  const domainOptions = getDomainOptions();

  // Load existing questionnaire on component mount
  useEffect(() => {
    loadQuestionnaire();
  }, []);

  // NEW: Auto-configure all modules when domain changes
  useEffect(() => {
    if (selectedDomain && domainConfigured) {
      autoConfigureModules(selectedDomain);
    }
  }, [selectedDomain, domainConfigured]);

  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/questionnaire');
      const data = await response.json();
      
      if (data.questionnaire) {
        setConfig(data.questionnaire.config);
        setOrganizationId(data.organizationId);
        
        // NEW: Detect domain from existing questionnaire
        const detectedDomain = detectDomainFromConfig(data.questionnaire.config);
        if (detectedDomain) {
          setSelectedDomain(detectedDomain);
          setDomainConfigured(true);
        }
        
        setSaveStatus('✅ Loaded existing questionnaire');
      } else {
        setSaveStatus('📝 No existing questionnaire - please select domain to auto-configure');
        setOrganizationId(data.organizationId || 'demo-org-001');
      }
    } catch (error) {
      console.error('Error loading questionnaire:', error);
      setSaveStatus('❌ Error loading questionnaire');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Detect domain from questionnaire config
  const detectDomainFromConfig = (config: QuestionnaireConfig): string | null => {
    if (!config?.questions?.length) return null;
    
    const questions = config.questions;
    
    // Check for domain indicators in question content
    if (questions.some((q: any) => 
      q.id?.includes('property') || 
      q.title?.toLowerCase().includes('property') ||
      q.title?.toLowerCase().includes('purchase')
    )) {
      return 'property';
    }
    
    if (questions.some((q: any) => 
      q.id?.includes('legal') || 
      q.title?.toLowerCase().includes('legal') ||
      q.title?.toLowerCase().includes('contract')
    )) {
      return 'legal';
    }
    
    if (questions.some((q: any) => 
      q.id?.includes('financial') || 
      q.title?.toLowerCase().includes('financial') ||
      q.title?.toLowerCase().includes('audit')
    )) {
      return 'financial';
    }
    
    if (questions.some((q: any) => 
      q.id?.includes('technical') || 
      q.title?.toLowerCase().includes('technical') ||
      q.title?.toLowerCase().includes('software')
    )) {
      return 'technical';
    }
    
    return null;
  };

  // NEW: Auto-configure all modules based on domain
  const autoConfigureModules = async (domain: string) => {
    try {
      setSaveStatus('⚙️ Auto-configuring all modules for ' + domain + ' domain...');
      
      // Propagate domain change to all modules
      const propagatePromises = [
        // Update documents config
        fetch('/api/documents/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, propagateFromQuestionnaire: true })
        }),
        // Update prompts config  
        fetch('/api/prompts/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, propagateFromQuestionnaire: true })
        }),
        // Update LLM config
        fetch('/api/llm/config', {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, propagateFromQuestionnaire: true })
        }),
        // Update findings config
        fetch('/api/findings/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, propagateFromQuestionnaire: true })
        }),
        // Update reports config
        fetch('/api/reports/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, propagateFromQuestionnaire: true })
        }),
        // Update Q&A config
        fetch('/api/qa/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, propagateFromQuestionnaire: true })
        })
      ];

      await Promise.all(propagatePromises);
      
      setTimeout(() => {
        setSaveStatus(`✨ All modules auto-configured for ${domain} domain! Documents, prompts, LLM, findings, reports, and Q&A settings optimized.`);
      }, 1000);
      
    } catch (error) {
      console.error('Error auto-configuring modules:', error);
      setSaveStatus('❌ Error auto-configuring modules');
    }
  };

  // NEW: Handle primary domain selection with automatic question generation
  const handleDomainSelection = (domain: string) => {
    setSelectedDomain(domain);
    setDomainConfigured(true);
    
    // Update config with domain-specific defaults
    const domainOption = domainOptions.find(opt => opt.value === domain);
    if (domainOption) {
      // NEW: Automatically generate 5 default questions
      const defaultQuestions = generateQuestionnaire(domain, 5);
      
      updateConfig({
        title: `${domainOption.label} Workflow`,
        description: domainOption.description,
        questions: defaultQuestions // Auto-populate with 5 questions
      });
      
      setSaveStatus(`✨ Generated 5 default ${domainOption.label.toLowerCase()} questions. Add or remove questions as needed.`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const detectedDomain = detectDomainFromConfig(config);
      setSaveStatus('💾 Saving questionnaire configuration...');
      
      // Save questionnaire configuration
      const response = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      if (response.ok) {
        const data = await response.json();
        setSaveStatus('✅ Questionnaire saved! Configuration complete.');
        onSave?.(config);
        
        // If domain was detected, auto-configure all other modules
        if (detectedDomain) {
          await autoConfigureModules(detectedDomain);
        }
        
        setTimeout(() => {
          setSaveStatus('✅ Configuration saved! Ready to proceed to Module 3: Document Upload');
        }, 2000);
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      setSaveStatus('❌ Error saving configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleNextModule = () => {
    // Navigate to next module (Module 3: Document Upload)
    window.location.href = '/admin/documents';
  };

  const handlePreview = () => {
    // Navigate to preview page with current config
    const previewUrl = `/admin/questionnaire/preview?config=${encodeURIComponent(JSON.stringify(config))}`;
    window.open(previewUrl, '_blank');
  };

  const updateConfig = (updates: Partial<QuestionnaireConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  // NEW: Simplified add question (uses domain-appropriate template)
  const addQuestion = () => {
    // Generate one more question from the domain template if available
    if (selectedDomain) {
      const currentCount = config.questions.length;
      const newQuestions = generateQuestionnaire(selectedDomain, currentCount + 1);
      const newQuestion = newQuestions[currentCount]; // Get the next question
      
      if (newQuestion) {
        updateConfig({
          questions: [...config.questions, newQuestion]
        });
        setSaveStatus(`➕ Added question ${currentCount + 1} from ${selectedDomain} domain`);
        return;
      }
    }
    
    // Fallback: Generic question if no more domain questions available
    const newQuestion: Question = {
      id: `question_${Date.now()}`,
      type: 'text',
      title: 'Enter your question...',
      description: 'Question description (optional)',
      required: false
    };
    
    updateConfig({
      questions: [...config.questions, newQuestion]
    });
    setSaveStatus('➕ Added new custom question');
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updatedQuestions = config.questions.map((q, i) => 
      i === index ? { ...q, ...updates } : q
    );
    updateConfig({ questions: updatedQuestions });
  };

  const addOption = (questionIndex: number) => {
    const question = config.questions[questionIndex];
    if (question.type === 'single_choice' || question.type === 'multiple_choice') {
      const newOption = {
        id: `option_${Date.now()}`,
        label: 'New option',
        value: `option_${Date.now()}`,
        description: ''
      };
      const updatedOptions = [...(question.options || []), newOption];
      updateQuestion(questionIndex, { options: updatedOptions });
    }
  };

  const updateOption = (questionIndex: number, optionIndex: number, updates: Partial<any>) => {
    const question = config.questions[questionIndex];
    if (question.options) {
      const updatedOptions = question.options.map((opt, i) => 
        i === optionIndex ? { ...opt, ...updates } : opt
      );
      updateQuestion(questionIndex, { options: updatedOptions });
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = config.questions[questionIndex];
    if (question.options) {
      const updatedOptions = question.options.filter((_, i) => i !== optionIndex);
      updateQuestion(questionIndex, { options: updatedOptions });
    }
  };

  const handleQuestionTypeChange = (questionIndex: number, newType: QuestionType) => {
    const updates: Partial<Question> = { type: newType };
    
    // Add default options for choice questions
    if ((newType === 'single_choice' || newType === 'multiple_choice') && 
        (!config.questions[questionIndex].options || config.questions[questionIndex].options!.length === 0)) {
      updates.options = [
        { id: 'option_1', label: 'Option 1', value: 'option_1', description: '' },
        { id: 'option_2', label: 'Option 2', value: 'option_2', description: '' }
      ];
    }
    
    // Remove options for non-choice questions
    if (newType === 'text' || newType === 'boolean' || newType === 'number') {
      updates.options = undefined;
    }
    
    updateQuestion(questionIndex, updates);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = config.questions.filter((_, i) => i !== index);
    updateConfig({ questions: updatedQuestions });
    setSaveStatus(`🗑️ Removed question ${index + 1}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Workflow Configuration</h2>
        {organizationId && (
          <p className="text-sm text-gray-600">Organization: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{organizationId}</span></p>
        )}
        {saveStatus && (
          <p className="text-sm mt-2 p-2 bg-gray-50 rounded border">{saveStatus}</p>
        )}
      </div>

      {/* NEW: Primary Domain Selection */}
      {!selectedDomain && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start mb-4">
            <span className="text-blue-500 text-2xl mr-3">🎯</span>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Select Your Workflow Domain</h3>
              <p className="text-blue-800 text-sm">
                Choose your primary domain to automatically configure all modules with expert defaults.
                This will set up 5 essential questions, documents, prompts, LLM settings, and analysis frameworks optimized for your use case.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {domainOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleDomainSelection(option.value)}
                className="p-4 text-left border border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-100 transition-all"
              >
                <h4 className="font-medium text-blue-900 mb-1">{option.label}</h4>
                <p className="text-sm text-blue-700">{option.description}</p>
                <p className="text-xs text-blue-600 mt-2 font-medium">• Generates 5 expert questions automatically</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Domain Status Display */}
      {selectedDomain && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <div>
                <span className="font-medium text-green-900">
                  {domainOptions.find(opt => opt.value === selectedDomain)?.label} Domain
                </span>
                <p className="text-sm text-green-700 mt-1">
                  {config.questions.length} questions configured • All modules auto-configured with expert defaults
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedDomain('');
                setDomainConfigured(false);
                updateConfig({ questions: [] }); // Clear questions when changing domain
                setSaveStatus('🔄 Domain reset - please select new domain');
              }}
              className="text-sm text-green-700 hover:text-green-900 underline"
            >
              Change Domain
            </button>
          </div>
        </div>
      )}
      
      {/* Only show configuration options if domain is selected */}
      {selectedDomain ? (
        <>
          {/* Basic Info */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workflow Title *
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => updateConfig({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Property Review Workflow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={config.description || ''}
                onChange={(e) => updateConfig({ description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of this workflow's purpose"
              />
            </div>
          </div>

          {/* Questions Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Questions ({config.questions.length})</h3>
              <button
                onClick={addQuestion}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                + Add Question
              </button>
            </div>

            {/* Question List */}
            {config.questions.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-gray-400 text-4xl mb-2">📝</div>
                <p className="text-gray-500">No questions yet. Click "Add Question" to start building your questionnaire.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {config.questions.map((question, index) => (
                  <div key={question.id} className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                    {/* Question Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                          Question {index + 1}
                        </span>
                        <select
                          value={question.type}
                          onChange={(e) => handleQuestionTypeChange(index, e.target.value as QuestionType)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                          <option value="text">Text</option>
                          <option value="single_choice">Single Choice</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="boolean">Yes/No</option>
                          <option value="number">Number</option>
                        </select>
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                            className="mr-1"
                          />
                          Required
                        </label>
                      </div>
                      <button
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded hover:bg-red-50 border border-red-200"
                      >
                        Remove
                      </button>
                    </div>
                    
                    {/* Question Content */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Title *
                        </label>
                        <input
                          type="text"
                          value={question.title}
                          onChange={(e) => updateQuestion(index, { title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your question..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (Optional)
                        </label>
                        <textarea
                          value={question.description || ''}
                          onChange={(e) => updateQuestion(index, { description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Additional context or instructions..."
                        />
                      </div>
                      
                      {/* Options for choice questions */}
                      {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Answer Options
                            </label>
                            <button
                              onClick={() => addOption(index)}
                              className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                            >
                              + Add Option
                            </button>
                          </div>
                          
                          {question.options && question.options.length > 0 ? (
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={option.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded border">
                                  <div className="flex-1 space-y-2">
                                    <input
                                      type="text"
                                      value={option.label}
                                      onChange={(e) => updateOption(index, optionIndex, { 
                                        label: e.target.value, 
                                        value: e.target.value.toLowerCase().replace(/\s+/g, '_') 
                                      })}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                      placeholder="Option label"
                                    />
                                    <input
                                      type="text"
                                      value={option.description || ''}
                                      onChange={(e) => updateOption(index, optionIndex, { description: e.target.value })}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-gray-600"
                                      placeholder="Option description (optional)"
                                    />
                                  </div>
                                  <button
                                    onClick={() => removeOption(index, optionIndex)}
                                    className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded">
                              <p className="text-sm text-gray-500">No options yet. Click "Add Option" to start.</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Preview based on question type */}
                      <div className="pt-3 border-t border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-2">Preview:</label>
                        <div className="bg-blue-50 p-3 rounded border">
                          <p className="font-medium text-sm text-gray-800">{question.title}</p>
                          {question.description && (
                            <p className="text-xs text-gray-600 mt-1">{question.description}</p>
                          )}
                          <div className="mt-2">
                            {question.type === 'text' && (
                              <input type="text" placeholder="User would type here..." className="w-full px-2 py-1 text-sm border rounded" disabled />
                            )}
                            {question.type === 'number' && (
                              <input type="number" placeholder="User would enter number..." className="w-full px-2 py-1 text-sm border rounded" disabled />
                            )}
                            {question.type === 'boolean' && (
                              <div className="flex gap-4">
                                <label className="flex items-center text-sm"><input type="radio" name={`preview_${index}`} disabled /> Yes</label>
                                <label className="flex items-center text-sm"><input type="radio" name={`preview_${index}`} disabled /> No</label>
                              </div>
                            )}
                            {question.type === 'single_choice' && question.options && (
                              <div className="space-y-1">
                                {question.options.map((option, optIndex) => (
                                  <label key={optIndex} className="flex items-center text-sm">
                                    <input type="radio" name={`preview_${index}`} disabled className="mr-2" />
                                    {option.label}
                                  </label>
                                ))}
                              </div>
                            )}
                            {question.type === 'multiple_choice' && question.options && (
                              <div className="space-y-1">
                                {question.options.map((option, optIndex) => (
                                  <label key={optIndex} className="flex items-center text-sm">
                                    <input type="checkbox" disabled className="mr-2" />
                                    {option.label}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={loading || !config.title}
                className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
              
              <button
                onClick={handlePreview}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
              >
                Preview User Experience
              </button>
            </div>

            {/* Module Navigation */}
            {saveStatus.includes('Configuration saved') && (
              <button
                onClick={handleNextModule}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                Next: Document Upload
                <span>→</span>
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👆</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select Domain to Continue</h3>
          <p className="text-gray-600">
            Choose your workflow domain above to unlock configuration options and auto-generate 5 expert questions.
          </p>
        </div>
      )}
    </div>
  );
} 