import React, { useState } from 'react';

// This component allows users to create custom scoresheet templates
// with support for subcategories as required for complex games like D&D

interface FieldType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const ScoresheetTemplateCreator = ({ gameId, gameName }: { gameId: string, gameName: string }) => {
  const [templateName, setTemplateName] = useState('');
  const [subcategories, setSubcategories] = useState([
    { id: crypto.randomUUID(), name: 'General', fields: [] }
  ]);
  const [currentSubcategoryIndex, setCurrentSubcategoryIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Available field types
  const fieldTypes: FieldType[] = [
    { id: 'number', name: 'Number', description: 'Numeric value with optional min/max', icon: '123' },
    { id: 'text', name: 'Text', description: 'Single line text input', icon: 'Aa' },
    { id: 'checkbox', name: 'Checkbox', description: 'True/false toggle', icon: '☑' },
    { id: 'dropdown', name: 'Dropdown', description: 'Select from predefined options', icon: '▼' },
    { id: 'calculation', name: 'Calculation', description: 'Formula-based calculated value', icon: '=' }
  ];
  
  // Add a new subcategory
  const addSubcategory = () => {
    setSubcategories([
      ...subcategories,
      { id: crypto.randomUUID(), name: `Subcategory ${subcategories.length + 1}`, fields: [] }
    ]);
    setCurrentSubcategoryIndex(subcategories.length);
  };
  
  // Remove a subcategory
  const removeSubcategory = (index: number) => {
    if (subcategories.length <= 1) {
      setError('You must have at least one subcategory');
      return;
    }
    
    const newSubcategories = [...subcategories];
    newSubcategories.splice(index, 1);
    setSubcategories(newSubcategories);
    
    if (currentSubcategoryIndex >= newSubcategories.length) {
      setCurrentSubcategoryIndex(newSubcategories.length - 1);
    }
  };
  
  // Update subcategory name
  const updateSubcategoryName = (index: number, name: string) => {
    const newSubcategories = [...subcategories];
    newSubcategories[index].name = name;
    setSubcategories(newSubcategories);
  };
  
  // Add a field to the current subcategory
  const addField = (fieldType: string) => {
    const newSubcategories = [...subcategories];
    const subcategory = newSubcategories[currentSubcategoryIndex];
    
    const newField = {
      id: crypto.randomUUID(),
      name: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      type: fieldType,
      defaultValue: fieldType === 'number' ? 0 : fieldType === 'checkbox' ? false : '',
      options: fieldType === 'dropdown' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      formula: fieldType === 'calculation' ? 'field1 + field2' : undefined,
      min: fieldType === 'number' ? 0 : undefined,
      max: fieldType === 'number' ? 100 : undefined
    };
    
    subcategory.fields.push(newField);
    setSubcategories(newSubcategories);
  };
  
  // Remove a field from a subcategory
  const removeField = (subcategoryIndex: number, fieldIndex: number) => {
    const newSubcategories = [...subcategories];
    newSubcategories[subcategoryIndex].fields.splice(fieldIndex, 1);
    setSubcategories(newSubcategories);
  };
  
  // Update field properties
  const updateField = (subcategoryIndex: number, fieldIndex: number, updates: Record<string, any>) => {
    const newSubcategories = [...subcategories];
    const field = newSubcategories[subcategoryIndex].fields[fieldIndex];
    
    newSubcategories[subcategoryIndex].fields[fieldIndex] = {
      ...field,
      ...updates
    };
    
    setSubcategories(newSubcategories);
  };
  
  // Save the template
  const saveTemplate = async () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }
    
    // Validate that each subcategory has at least one field
    const emptySubcategories = subcategories.filter(s => s.fields.length === 0);
    if (emptySubcategories.length > 0) {
      setError(`${emptySubcategories[0].name} has no fields. Each subcategory must have at least one field.`);
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // In a real implementation, this would be an API call
      const response = await fetch('/api/scoresheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName,
          gameId,
          subcategories
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to the game page or scoresheet list
        window.location.href = `/games/${gameId}`;
      } else {
        setError(data.error || 'Failed to save template');
      }
    } catch (err) {
      setError('Error saving template');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Render field editor based on field type
  const renderFieldEditor = (subcategoryIndex: number, fieldIndex: number) => {
    const field = subcategories[subcategoryIndex].fields[fieldIndex];
    
    return (
      <div className="border rounded-md p-4 mb-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium">{field.name}</h4>
          <button
            onClick={() => removeField(subcategoryIndex, fieldIndex)}
            className="text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Field Name</label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => updateField(subcategoryIndex, fieldIndex, { name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        {field.type === 'number' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Default Value</label>
              <input
                type="number"
                value={field.defaultValue}
                onChange={(e) => updateField(subcategoryIndex, fieldIndex, { defaultValue: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Min Value</label>
                <input
                  type="number"
                  value={field.min}
                  onChange={(e) => updateField(subcategoryIndex, fieldIndex, { min: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Max Value</label>
                <input
                  type="number"
                  value={field.max}
                  onChange={(e) => updateField(subcategoryIndex, fieldIndex, { max: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </>
        )}
        
        {field.type === 'text' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Default Value</label>
            <input
              type="text"
              value={field.defaultValue}
              onChange={(e) => updateField(subcategoryIndex, fieldIndex, { defaultValue: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}
        
        {field.type === 'checkbox' && (
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={field.defaultValue}
                onChange={(e) => updateField(subcategoryIndex, fieldIndex, { defaultValue: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">Default Value</label>
            </div>
          </div>
        )}
        
        {field.type === 'dropdown' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Options (one per line)</label>
            <textarea
              value={field.options?.join('\n')}
              onChange={(e) => updateField(subcategoryIndex, fieldIndex, { options: e.target.value.split('\n').filter(Boolean) })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Default Value</label>
              <select
                value={field.defaultValue}
                onChange={(e) => updateField(subcategoryIndex, fieldIndex, { defaultValue: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {field.type === 'calculation' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Formula</label>
            <input
              type="text"
              value={field.formula}
              onChange={(e) => updateField(subcategoryIndex, fieldIndex, { formula: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Use field IDs in your formula. Example: field1 + field2 * 2
            </p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Scoresheet Template for {gameName}</h2>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Template Name</label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Subcategories</h3>
          <button
            onClick={addSubcategory}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Subcategory
          </button>
        </div>
        
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          {subcategories.map((subcategory, index) => (
            <button
              key={subcategory.id}
              onClick={() => setCurrentSubcategoryIndex(index)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                currentSubcategoryIndex === index
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {subcategory.name}
            </button>
          ))}
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">Subcategory Name</label>
              <input
                type="text"
                value={subcategories[currentSubcategoryIndex].name}
                onChange={(e) => updateSubcategoryName(currentSubcategoryIndex, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            {subcategories.length > 1 && (
              <button
                onClick={() => removeSubcategory(currentSubcategoryIndex)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
          
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-900 mb-2">Fields</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
              {fieldTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => addField(type.id)}
                  className="flex flex-col items-center p-3 border rounded-md hover:bg-gray-50"
                >
                  <span className="text-xl mb-1">{type.icon}</span>
                  <span className="text-sm font-medium">{type.name}</span>
                  <span className="text-xs text-gray-500 text-center mt-1">{type.description}</span>
                </button>
              ))}
            </div>
            
            {subcategories[currentSubcategoryIndex].fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No fields added yet. Click on a field type above to add one.
              </div>
            ) : (
              subcategories[currentSubcategoryIndex].fields.map((field, fieldIndex) => (
                <div key={field.id}>
                  {renderFieldEditor(currentSubcategoryIndex, fieldIndex)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={saveTemplate}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </div>
  );
};

export default ScoresheetTemplateCreator;
