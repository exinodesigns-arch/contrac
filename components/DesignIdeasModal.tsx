import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Modal from './Modal';
import { WandIcon } from './icons';

interface DesignIdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const dataUrlToGenerativePart = (dataUrl: string) => {
  const parts = dataUrl.split(',');
  const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const base64Data = parts[1];
  return {
    inlineData: { data: base64Data, mimeType },
  };
};

const DesignIdeasModal: React.FC<DesignIdeasModalProps> = ({ isOpen, onClose, imageUrl }) => {
  const [stylePrompt, setStylePrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [designIdeas, setDesignIdeas] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setDesignIdeas(null);

    try {
      const imagePart = dataUrlToGenerativePart(imageUrl);
      
      let prompt = `You are an expert interior designer. Analyze the provided image of a room. Generate a few creative design ideas to enhance the space.`;
      if (stylePrompt.trim()) {
          prompt += ` The user's desired style is: "${stylePrompt.trim()}".`;
      }
      prompt += ` Structure your response with clear markdown headings for different aspects like 'Color Palette', 'Furniture', 'Lighting', and 'Decor'. Be detailed and inspiring.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
      });

      setDesignIdeas(response.text);

    } catch (err) {
      console.error("AI Design Ideas Generation Error:", err);
      setError("Failed to generate design ideas. Please try again or refine your style description.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStylePrompt('');
    setIsLoading(false);
    setError(null);
    setDesignIdeas(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="AI Design Assistant"
      footer={
        <div className="flex justify-end items-center w-full">
            <button onClick={handleClose} className="py-2 px-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition">Close</button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 flex flex-col">
          <img src={imageUrl} alt="Area to design" className="rounded-lg w-full object-cover shadow-lg" />
           <div className="flex-grow">
            <label htmlFor="style-prompt" className="block text-sm font-medium text-gray-300 mb-1">
              Describe your desired style (optional)
            </label>
            <textarea
              id="style-prompt"
              rows={3}
              value={stylePrompt}
              onChange={(e) => setStylePrompt(e.target.value)}
              placeholder="e.g., Modern minimalist, cozy with warm lighting..."
              className="w-full bg-base-100 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent focus:border-accent"
            />
          </div>
           <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:bg-gray-500"
          >
              {isLoading ? (
                  <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                  </>
              ) : (
                  <>
                      <WandIcon />
                      Generate Ideas
                  </>
              )}
          </button>
        </div>

        <div className="bg-neutral p-4 rounded-lg max-h-[65vh] overflow-y-auto">
          <h4 className="font-semibold text-white mb-2">Design Suggestions</h4>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {designIdeas ? (
             <div className="text-sm text-gray-300 whitespace-pre-wrap space-y-4 font-sans">
                {designIdeas}
             </div>
          ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-center">Your AI-generated design ideas will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DesignIdeasModal;