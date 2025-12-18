
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { WorkCategory, WorkItem } from '../types';
import Modal from './Modal';
import { SparklesIcon } from './icons';

interface GenerateWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: Partial<WorkItem>[], imageUrl: string | null) => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const GenerateWorkModal: React.FC<GenerateWorkModalProps> = ({ isOpen, onClose, onSave }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedItems, setGeneratedItems] = useState<Array<{ name: string; category: WorkCategory }>>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Reset previous results
      setGeneratedItems([]);
      setSelectedItems(new Set());
      setError(null);
    }
  };
  
  const handleGenerate = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError(null);
    setGeneratedItems([]);

    try {
      const imagePart = await fileToGenerativePart(imageFile);
      
      const prompt = `Analyze the provided image of a room or construction area. Identify potential work items that need to be completed. For each item, provide a descriptive name and classify it into one of these categories: '${Object.values(WorkCategory).join("', '")}'. Return the result as a JSON array of objects, where each object has a 'name' and 'category' property.`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [imagePart, { text: prompt }] },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        category: { type: Type.STRING, enum: Object.values(WorkCategory) }
                    },
                    required: ['name', 'category']
                }
            }
          }
      });
      
      const parsedResult = JSON.parse(response.text);
      
      if (Array.isArray(parsedResult)) {
        setGeneratedItems(parsedResult);
        // Pre-select all generated items
        setSelectedItems(new Set(parsedResult.map((_, index) => index)));
      } else {
        throw new Error("AI did not return a valid list of items.");
      }

    } catch (err) {
      console.error("AI Generation Error:", err);
      setError("Failed to generate work items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleItem = (index: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          setSelectedItems(new Set(generatedItems.map((_, index) => index)));
      } else {
          setSelectedItems(new Set());
      }
  };

  const handleSave = () => {
    const itemsToSave = generatedItems.filter((_, index) => selectedItems.has(index));
    onSave(itemsToSave, previewUrl);
    resetState();
  };

  const resetState = () => {
      setImageFile(null);
      setPreviewUrl(null);
      setIsLoading(false);
      setError(null);
      setGeneratedItems([]);
      setSelectedItems(new Set());
  };

  const handleClose = () => {
      resetState();
      onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate Work Items with AI"
      footer={
        <div className="flex justify-between items-center w-full">
            <span className="text-sm text-gray-400">{selectedItems.size} of {generatedItems.length} selected</span>
            <div className="flex gap-2">
                <button onClick={handleClose} className="py-2 px-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition">Cancel</button>
                <button onClick={handleSave} disabled={selectedItems.size === 0} className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-secondary transition disabled:bg-gray-500 disabled:cursor-not-allowed">
                    Add Selected Items
                </button>
            </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-1">
            Upload an image of the work area
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="mx-auto h-48 w-auto rounded-md" />
              ) : (
                <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <div className="flex text-sm text-gray-500 justify-center">
                <label htmlFor="image-upload-input" className="relative cursor-pointer bg-neutral rounded-md font-medium text-accent hover:text-blue-400 focus-within:outline-none p-1">
                  <span>{imageFile ? 'Change image' : 'Upload a file'}</span>
                  <input id="image-upload-input" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>
        
        {imageFile && (
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-500"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing Image...
                    </>
                ) : (
                    <>
                        <SparklesIcon />
                        Generate Work Items
                    </>
                )}
            </button>
        )}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {generatedItems.length > 0 && (
          <div className="space-y-2 border-t border-gray-700 pt-4">
             <div className="flex items-center justify-between pb-2">
                <h4 className="font-semibold text-white">Suggested Work Items</h4>
                <div className="flex items-center">
                    <input type="checkbox" id="select-all" className="form-checkbox h-4 w-4 text-primary bg-gray-800 border-gray-600 rounded focus:ring-primary"
                        checked={selectedItems.size === generatedItems.length}
                        onChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="ml-2 text-sm text-gray-300">Select All</label>
                </div>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 rounded-md">
                {generatedItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 bg-base-100 p-2 rounded-md">
                        <input
                            type="checkbox"
                            checked={selectedItems.has(index)}
                            onChange={() => handleToggleItem(index)}
                            className="form-checkbox h-4 w-4 text-primary bg-gray-800 border-gray-600 rounded focus:ring-primary shrink-0"
                        />
                        <div className="flex-grow">
                           <span className="text-sm text-gray-200">{item.name}</span>
                           <span className="ml-2 text-xs text-gray-400 bg-neutral px-2 py-0.5 rounded-full">{item.category}</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GenerateWorkModal;