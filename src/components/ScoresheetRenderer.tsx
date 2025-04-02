import React, { useState, useEffect } from 'react';

// This component implements the scoresheet rendering and filling functionality
// with support for subcategories as required for complex games like D&D

interface ScoresheetValue {
  fieldId: string;
  value: any;
}

interface ScoresheetField {
  id: string;
  name: string;
  type: 'number' | 'text' | 'checkbox' | 'dropdown' | 'calculation';
  defaultValue?: any;
  options?: string[];
  formula?: string;
  min?: number;
  max?: number;
}

interface ScoresheetSubcategory {
  id: string;
  name: string;
  fields: ScoresheetField[];
}

interface ScoresheetSession {
  id: string;
  gameId: string;
  scoresheetId: string;
  createdAt: string;
  players: { id: string; name: string }[];
  values: ScoresheetValue[];
}

const ScoresheetRenderer = ({ 
  sessionId, 
  readOnly = false 
}: { 
  sessionId: string; 
  readOnly?: boolean;
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ScoresheetSession | null>(null);
  const [scoresheet, setScoresheet] = useState<{ subcategories: ScoresheetSubcategory[] } | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [game, setGame] = useState<{ name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Fetch session, scoresheet, and game data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, these would be API calls
        const sessionResponse = await fetch(`/api/sessions/${sessionId}`);
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.success) {
          setError(sessionData.error || 'Failed to load session');
          return;
        }
        
        setSession(sessionData.data);
        
        // Fetch scoresheet template
        const scoresheetResponse = await fetch(`/api/scoresheets/${sessionData.data.scoresheetId}`);
        const scoresheetData = await scoresheetResponse.json();
        
        if (!scoresheetData.success) {
          setError(scoresheetData.error || 'Failed to load scoresheet');
          return;
        }
        
        setScoresheet(scoresheetData.data);
        
        // Fetch game details
        const gameResponse = await fetch(`/api/games/${sessionData.data.gameId}`);
        const gameData = await gameResponse.json();
        
        if (!gameData.success) {
          setError(gameData.error || 'Failed to load game details');
          return;
        }
        
        setGame(gameData.data);
        
        // Initialize values from session or defaults
        const initialValues: Record<string, any> = {};
        
        // First set default values from scoresheet template
        scoresheetData.data.subcategories.forEach((subcategory: ScoresheetSubcategory) => {
          subcategory.fields.forEach((field: ScoresheetField) => {
            initialValues[field.id] = field.defaultValue !== undefined ? field.defaultValue : 
              field.type === 'number' ? 0 : 
              field.type === 'checkbox' ? false : 
              field.type === 'dropdown' && field.options?.length ? field.options[0] : '';
          });
        });
        
        // Then override with saved values from session
        sessionData.data.values.forEach((value: ScoresheetValue) => {
          initialValues[value.fieldId] = value.value;
        });
        
        setValues(initialValues);
        
        // Calculate formula fields
        if (scoresheetData.data.subcategories) {
          const calculatedValues = { ...initialValues };
          
          scoresheetData.data.subcategories.forEach((subcategory: ScoresheetSubcategory) => {
            subcategory.fields.forEach((field: ScoresheetField) => {
              if (field.type === 'calculation' && field.formula) {
                try {
                  let formula = field.formula;
                  Object.keys(calculatedValues).forEach(key => {
                    formula = formula.replace(new RegExp(`\\b${key}\\b`, 'g'), calculatedValues[key]);
                  });
                  calculatedValues[field.id] = eval(formula);
                } catch (err) {
                  console.error('Error evaluating formula', err);
                }
              }
            });
          });
          
          setValues(calculatedValues);
        }
      } catch (err) {
        setError('Error loading data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);
  
  // Handle field value changes
  const handleFieldChange = (fieldId: string, value: any) => {
    if (readOnly) return;
    
    setValues(prev => {
      const newValues = { ...prev, [fieldId]: value };
      
      // Recalculate any fields with formulas
      if (scoresheet) {
        scoresheet.subcategories.forEach(subcategory => {
          subcategory.fields.forEach(field => {
            if (field.type === 'calculation' && field.formula) {
              try {
                let formula = field.formula;
                Object.keys(newValues).forEach(key => {
                  formula = formula.replace(new RegExp(`\\b${key}\\b`, 'g'), newValues[key]);
                });
                newValues[field.id] = eval(formula);
              } catch (err) {
                console.error('Error evaluating formula', err);
              }
            }
          });
        });
      }
      
      return newValues;
    });
  };
  
  // Save scoresheet values
  const saveScoresheet = async () => {
    if (readOnly) return;
    
    try {
      setSaving(true);
      
      // Convert values object to array of { fieldId, value } objects
      const valuesArray = Object.entries(values).map(([fieldId, value]) => ({
        fieldId,
        value
      }));
      
      // In a real implementation, this would be an API call
      const response = await fetch(`/api/sessions/${sessionId}/values`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: valuesArray
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to save values');
      }
    } catch (err) {
      setError('Error saving values');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Export scoresheet as PDF
  const exportPdf = async () => {
    try {
      // In a real implementation, this would call a PDF generation API
      const response = await fetch(`/api/sessions/${sessionId}/export?format=pdf`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${game?.name}-scoresheet-${sessionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to export PDF');
      }
    } catch (err) {
      setError('Error exporting PDF');
      console.error(err);
    }
  };
  
  // Render field based on its type
  const renderField = (field: ScoresheetField) => {
    const value = values[field.id];
    
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
              disabled={readOnly}
              className={`mt-1 block w-full rounded-md ${
                readOnly ? 'bg-gray-100' : 'border-gray-300'
              } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
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
              disabled={readOnly}
              className={`mt-1 block w-full rounded-md ${
                readOnly ? 'bg-gray-100' : 'border-gray-300'
              } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
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
                disabled={readOnly}
                className={`h-4 w-4 rounded ${
                  readOnly ? 'bg-gray-100' : 'border-gray-300'
                } text-indigo-600 focus:ring-indigo-500`}
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
              disabled={readOnly}
              className={`mt-1 block w-full rounded-md ${
                readOnly ? 'bg-gray-100' : 'border-gray-300'
              } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
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
  
  if (!session || !scoresheet || !game) {
    return <div className="text-center py-8">No data available</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{game.name} Scoresheet</h2>
          <p className="text-sm text-gray-500">
            Created: {new Date(session.createdAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {!readOnly && (
            <button
              onClick={saveScoresheet}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
          
          <button
            onClick={exportPdf}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Export PDF
          </button>
        </div>
      </div>
      
      {session.players.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Players</h3>
          <div className="flex flex-wrap gap-2">
            {session.players.map(player => (
              <div key={player.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {player.name}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {scoresheet.subcategories.map((subcategory) => (
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
    </div>
  );
};

export default ScoresheetRenderer;
