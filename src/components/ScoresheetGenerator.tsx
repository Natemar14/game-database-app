import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Advanced scoresheet generator component with subcategories support
// This implements the user requirement for subcategories in scoresheets for complex games

interface ScoresheetField {
  id: string;
  name: string;
  type: 'number' | 'text' | 'checkbox' | 'dropdown' | 'calculation';
  defaultValue?: any;
  options?: string[];
  formula?: string;
  min?: number;
  max?: number;
  value?: any;
}

interface ScoresheetSubcategory {
  id: string;
  name: string;
  fields: ScoresheetField[];
}

interface ScoresheetTemplate {
  id: string;
  name: string;
  gameId: string;
  subcategories: ScoresheetSubcategory[];
}

const ScoresheetGenerator = ({ gameId, gameName }: { gameId: string, gameName: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ScoresheetTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ScoresheetTemplate | null>(null);
  const [scoresheetData, setScoresheetData] = useState<Record<string, any>>({});
  
  // Fetch available scoresheet templates for this game
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would be an API call
        const response = await fetch(`/api/games/${gameId}/scoresheets`);
        const data = await response.json();
        
        if (data.success) {
          setTemplates(data.data);
          // If templates exist, select the first one by default
          if (data.data.length > 0) {
            setSelectedTemplate(data.data[0]);
            initializeScoresheet(data.data[0]);
          }
        } else {
          setError(data.error || 'Failed to load scoresheet templates');
        }
      } catch (err) {
        setError('Error loading scoresheet templates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (gameId) {
      fetchTemplates();
    }
  }, [gameId]);
  
  // Initialize scoresheet with default values
  const initializeScoresheet = (template: ScoresheetTemplate) => {
    const initialData: Record<string, any> = {};
    
    template.subcategories.forEach(subcategory => {
      subcategory.fields.forEach(field => {
        initialData[field.id] = field.defaultValue !== undefined ? field.defaultValue : 
          field.type === 'number' ? 0 : 
          field.type === 'checkbox' ? false : 
          field.type === 'dropdown' && field.options?.length ? field.options[0] : '';
      });
    });
    
    setScoresheetData(initialData);
  };
  
  // Handle field value changes
  const handleFieldChange = (fieldId: string, value: any) => {
    setScoresheetData(prev => {
      const newData = { ...prev, [fieldId]: value };
      
      // Recalculate any fields with formulas that depend on this field
      if (selectedTemplate) {
        selectedTemplate.subcategories.forEach(subcategory => {
          subcategory.fields.forEach(field => {
            if (field.type === 'calculation' && field.formula) {
              try {
                // Simple formula evaluation (in a real app, this would be more sophisticated)
                // Replace field IDs with their values and evaluate
                let formula = field.formula;
                Object.keys(newData).forEach(key => {
                  formula = formula.replace(new RegExp(`\\b${key}\\b`, 'g'), newData[key]);
                });
                newData[field.id] = eval(formula);
              } catch (err) {
                console.error('Error evaluating formula', err);
              }
            }
          });
        });
      }
      
      return newData;
    });
  };
  
  // Save scoresheet
  const saveScoresheet = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would be an API call
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          scoresheetId: selectedTemplate?.id,
          scoresheetData
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Navigate to the session page
        router.push(`/sessions/${data.data.id}`);
      } else {
        setError(data.error || 'Failed to save scoresheet');
      }
    } catch (err) {
      setError('Error saving scoresheet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Render field based on its type
  const renderField = (field: ScoresheetField) => {
    const value = scoresheetData[field.id];
    
    switch (field.type) {
      case 'number':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">{field.name}</label>
            <input
              type="number"
              min={field.min}
              max={field.max}
              value={value}
              onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        );
        
      case 'text':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">{field.name}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">{field.name}</label>
            </div>
          </div>
        );
        
      case 'dropdown':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">{field.name}</label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
        
      case 'calculation':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">{field.name}</label>
            <input
              type="text"
              value={value}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading scoresheet...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  
  if (!selectedTemplate) {
    return (
      <div className="text-center py-8">
        <p>No scoresheet templates available for this game.</p>
        <button
          onClick={() => router.push(`/games/${gameId}/create-scoresheet`)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New Scoresheet Template
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{gameName} Scoresheet</h2>
        
        {templates.length > 1 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Scoresheet Template</label>
            <select
              value={selectedTemplate.id}
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value);
                if (template) {
                  setSelectedTemplate(template);
                  initializeScoresheet(template);
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {selectedTemplate.subcategories.map((subcategory) => (
        <div key={subcategory.id} className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
            {subcategory.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subcategory.fields.map((field) => (
              <div key={field.id}>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={saveScoresheet}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Saving...' : 'Save Scoresheet'}
        </button>
      </div>
    </div>
  );
};

export default ScoresheetGenerator;
