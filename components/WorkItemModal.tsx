
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { WorkItem, SubWork, WorkCategory, UnitType, WorkStatus } from '../types';
import { WORK_CATEGORY_OPTIONS, UNIT_TYPE_OPTIONS, WORK_STATUS_OPTIONS } from '../constants';
import Modal from './Modal';
import { PlusIcon, TrashIcon, SparklesIcon } from './icons';

interface WorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: WorkItem) => void;
  workItem: WorkItem | null;
  onDelete?: () => void;
}

const emptyWorkItem: Omit<WorkItem, 'id' | 'quantity'> = {
  name: '',
  category: WorkCategory.INTERIOR,
  subWorks: [],
  designPreference: '',
  color: '',
  colorFileName: '',
  length: 0,
  width: 0,
  depth: 0,
  units: 1,
  unitMultiplier: 1,
  unitType: UnitType.SQFT,
  status: WorkStatus.PENDING,
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const WorkItemModal: React.FC<WorkItemModalProps> = ({ isOpen, onClose, onSave, workItem, onDelete }) => {
  const [formData, setFormData] = useState(workItem || emptyWorkItem);
  const [quantity, setQuantity] = useState(workItem ? workItem.quantity : 0);
  const [newSubWork, setNewSubWork] = useState('');
  const [isGeneratingSubTasks, setIsGeneratingSubTasks] = useState(false);
  const [subTaskError, setSubTaskError] = useState<string | null>(null);

  const calculateQuantity = useCallback(() => {
    const { length, width, depth, units, unitMultiplier, unitType } = formData;
    switch (unitType) {
      case UnitType.SQFT:
      case UnitType.SQM:
        return length * width * units;
      case UnitType.CUBIC_METER:
        return length * width * depth;
      case UnitType.PIECES:
        return units * (unitMultiplier || 1);
      case UnitType.RUNNING_METER:
        return length;
      case UnitType.LUMPSUM:
          return 1;
      case UnitType.NOS:
        return length * width * depth * units;
      default:
        return 0;
    }
  }, [formData]);

  useEffect(() => {
    if (workItem) {
      const newFormData = {...workItem, unitMultiplier: workItem.unitMultiplier || 1};
      // For backward compatibility with old data where units might be 0 for sqft/sqm
      if ([UnitType.SQFT, UnitType.SQM].includes(newFormData.unitType) && !newFormData.units) {
          newFormData.units = 1;
      }
      setFormData(prev => ({...prev, ...newFormData}));
      setQuantity(workItem.quantity)
    } else {
      setFormData(emptyWorkItem);
      setQuantity(0);
    }
  }, [workItem]);

  useEffect(() => {
    setQuantity(calculateQuantity());
  }, [formData.length, formData.width, formData.depth, formData.units, formData.unitMultiplier, formData.unitType, calculateQuantity]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numericFields = ['length', 'width', 'depth', 'units', 'unitMultiplier'];
    setFormData(prev => ({ ...prev, [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          color: reader.result as string,
          colorFileName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, color: '', colorFileName: '' }));
    const fileInput = document.getElementById('color-file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleAddSubWork = () => {
    if (newSubWork.trim()) {
      const subWork: SubWork = { id: `sub-${Date.now()}`, name: newSubWork.trim(), isCompleted: false };
      setFormData(prev => ({ ...prev, subWorks: [...prev.subWorks, subWork] }));
      setNewSubWork('');
    }
  };
  
  const handleToggleSubWork = (id: string) => {
      setFormData(prev => ({...prev, subWorks: prev.subWorks.map(sw => sw.id === id ? {...sw, isCompleted: !sw.isCompleted} : sw)}))
  }

  const handleRemoveSubWork = (id: string) => {
    setFormData(prev => ({ ...prev, subWorks: prev.subWorks.filter(sw => sw.id !== id) }));
  };
  
  const handleGenerateSubTasks = async () => {
    if (!formData.name.trim()) return;
    
    setIsGeneratingSubTasks(true);
    setSubTaskError(null);

    try {
        const prompt = `Based on the construction work item "${formData.name}" in the "${formData.category}" category, generate a list of typical sub-tasks or steps required to complete it. Provide the response as a JSON array of strings. For example, for "Install Kitchen Cabinets", you might return ["Measure and mark layout", "Install wall cleats", "Hang upper cabinets", "Set and level base cabinets", "Install doors and hardware"].`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const subTaskNames = JSON.parse(response.text);
        if (Array.isArray(subTaskNames)) {
            const newSubWorks: SubWork[] = subTaskNames.map(name => ({
                id: `sub-${Date.now()}-${Math.random()}`,
                name,
                isCompleted: false,
            }));
            setFormData(prev => ({
                ...prev,
                subWorks: [...prev.subWorks, ...newSubWorks]
            }));
        } else {
             throw new Error("AI response was not a valid list.");
        }
    } catch (error) {
        console.error("Failed to generate sub-tasks:", error);
        setSubTaskError("AI failed to generate tasks. Please try again.");
    } finally {
        setIsGeneratingSubTasks(false);
    }
  };


  const handleSubmit = () => {
    onSave({ ...formData, id: workItem?.id || `item-${Date.now()}`, quantity });
  };
  
  const handleDelete = () => {
      if (window.confirm(`Are you sure you want to delete work item "${formData.name}"?`)) {
          onDelete?.();
      }
  }
  
  const renderQuantityFields = () => {
      switch (formData.unitType) {
          case UnitType.SQFT:
          case UnitType.SQM:
              return <>
                  <InputField label="Length" name="length" type="number" value={formData.length} onChange={handleChange} />
                  <InputField label="Width" name="width" type="number" value={formData.width} onChange={handleChange} />
                  <InputField label="Number of Items (Nos)" name="units" type="number" value={formData.units} onChange={handleChange} />
              </>;
          case UnitType.CUBIC_METER:
              return <>
                  <InputField label="Length" name="length" type="number" value={formData.length} onChange={handleChange} />
                  <InputField label="Width" name="width" type="number" value={formData.width} onChange={handleChange} />
                  <InputField label="Depth" name="depth" type="number" value={formData.depth} onChange={handleChange} />
              </>;
          case UnitType.PIECES:
              return <>
                  <InputField label="Number of Pieces" name="units" type="number" value={formData.units} onChange={handleChange} />
                  <InputField label="Unit Multiplier" name="unitMultiplier" type="number" value={formData.unitMultiplier || 1} onChange={handleChange} />
              </>;
          case UnitType.RUNNING_METER:
              return <InputField label="Length" name="length" type="number" value={formData.length} onChange={handleChange} />;
          case UnitType.NOS:
              return <>
                  <InputField label="Length" name="length" type="number" value={formData.length} onChange={handleChange} />
                  <InputField label="Width" name="width" type="number" value={formData.width} onChange={handleChange} />
                  <InputField label="Depth" name="depth" type="number" value={formData.depth} onChange={handleChange} />
                  <InputField label="Number of Items (Nos)" name="units" type="number" value={formData.units} onChange={handleChange} />
              </>;
          default:
              return null;
      }
  }

  const getQuantityGridCols = () => {
    switch (formData.unitType) {
        case UnitType.SQFT:
        case UnitType.SQM:
        case UnitType.CUBIC_METER:
            return 'md:grid-cols-3';
        case UnitType.PIECES:
            return 'md:grid-cols-2';
        case UnitType.NOS:
            return 'md:grid-cols-2 lg:grid-cols-4';
        case UnitType.RUNNING_METER:
            return 'md:grid-cols-1';
        default:
            return 'grid-cols-1';
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={workItem ? 'Edit Work Item' : 'Add New Work Item'}
      footer={
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-2">
          <div>
            {workItem && onDelete && (
              <button onClick={handleDelete} className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-error text-white rounded-lg hover:bg-red-700 transition">
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 sm:flex-none py-2 px-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition">Cancel</button>
            <button onClick={handleSubmit} className="flex-1 sm:flex-none py-2 px-4 bg-primary text-white rounded-lg hover:bg-secondary transition">Save Work Item</button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="p-4 border border-gray-700 rounded-lg bg-neutral space-y-4">
            <h4 className="font-semibold text-white">Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Work Item Name" name="name" value={formData.name} onChange={handleChange} required />
                <SelectField label="Category" name="category" value={formData.category} onChange={handleChange} options={WORK_CATEGORY_OPTIONS} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color/Shade</label>
                {formData.color && formData.color.startsWith('data:image/') ? (
                    <div className="flex items-center gap-4 p-2 bg-base-100 border border-gray-600 rounded-md">
                        <img src={formData.color} alt={formData.colorFileName} className="w-16 h-16 rounded object-cover" />
                        <div className="flex-grow">
                            <p className="text-sm text-gray-200 truncate">{formData.colorFileName}</p>
                            <button type="button" onClick={handleRemoveImage} className="text-xs text-red-500 hover:underline">Remove Image</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            name="color" 
                            value={formData.color} 
                            onChange={handleChange} 
                            placeholder="e.g., Off-white or #F5F5DC"
                            className="w-full bg-base-100 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent focus:border-accent" 
                        />
                         <label htmlFor="color-file-upload" className="cursor-pointer bg-primary hover:bg-secondary text-white font-bold py-2 px-3 rounded-lg transition duration-300 text-sm whitespace-nowrap inline-flex items-center">
                            Upload
                        </label>
                        <input id="color-file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                )}
            </div>
            <TextAreaField label="Design Preferences" name="designPreference" value={formData.designPreference} onChange={handleChange} />
        </div>
        
        {/* Sub Works */}
        <div className="p-4 border border-gray-700 rounded-lg bg-neutral space-y-4">
            <h4 className="font-semibold text-white">Sub-Works</h4>
            {formData.subWorks.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {formData.subWorks.map(sw => (
                        <div key={sw.id} className="flex items-center gap-3 bg-base-100 p-2 rounded">
                            <input type="checkbox" checked={sw.isCompleted} onChange={() => handleToggleSubWork(sw.id)} className="form-checkbox h-4 w-4 text-primary bg-gray-800 border-gray-600 rounded focus:ring-primary shrink-0"/>
                            <span className={`flex-grow text-sm ${sw.isCompleted ? 'line-through text-gray-500' : ''}`}>{sw.name}</span>
                            <button onClick={() => handleRemoveSubWork(sw.id)} className="text-gray-500 hover:text-red-500 shrink-0"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex gap-2">
                <input type="text" value={newSubWork} onChange={(e) => setNewSubWork(e.target.value)} placeholder="Add a new sub-task..." className="flex-grow bg-base-100 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent focus:border-accent" onKeyDown={e => e.key === 'Enter' && handleAddSubWork()}/>
                <button onClick={handleAddSubWork} aria-label="Add sub-work" className="p-2 bg-primary rounded-md text-white hover:bg-secondary shrink-0"><PlusIcon /></button>
                <button 
                    onClick={handleGenerateSubTasks} 
                    disabled={!formData.name.trim() || isGeneratingSubTasks}
                    aria-label="Generate sub-tasks with AI" 
                    className="p-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 shrink-0 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center w-10"
                    title="Generate sub-tasks with AI"
                >
                    {isGeneratingSubTasks ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <SparklesIcon />
                    )}
                </button>
            </div>
            {subTaskError && <p className="text-xs text-red-500">{subTaskError}</p>}
        </div>

        {/* Quantity Calculator */}
        <div className="p-4 border border-gray-700 rounded-lg bg-neutral space-y-4">
            <h4 className="font-semibold text-white">Quantity Calculator</h4>
            <SelectField label="Unit Type" name="unitType" value={formData.unitType} onChange={handleChange} options={UNIT_TYPE_OPTIONS} />
            <div className={`grid grid-cols-1 ${getQuantityGridCols()} gap-4`}>
                {renderQuantityFields()}
            </div>
            <div className="mt-4 p-4 border border-gray-600 bg-base-100 rounded-lg flex items-center justify-between">
                <h5 className="text-lg font-semibold text-white">Total Quantity</h5>
                <div className="text-right">
                    <p className="text-2xl font-bold text-accent">{quantity.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">{formData.unitType}</p>
                </div>
            </div>
        </div>
        
        {/* Status */}
        <div className="p-4 border border-gray-700 rounded-lg bg-neutral">
            <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={WORK_STATUS_OPTIONS} />
        </div>
      </div>
    </Modal>
  );
};


// Helper components for form fields
const InputField: React.FC<any> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input {...props} className="w-full bg-base-100 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent focus:border-accent" />
    </div>
);
const TextAreaField: React.FC<any> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <textarea {...props} rows={3} className="w-full bg-base-100 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent focus:border-accent" />
    </div>
);
const SelectField: React.FC<any> = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select {...props} className="w-full bg-base-100 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent focus:border-accent">
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


export default WorkItemModal;