import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import Modal from './Modal';
import { PhotoIcon } from './icons';

interface GenerateImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const GenerateImageModal: React.FC<GenerateImageModalProps> = ({ isOpen, onClose, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a description for the image.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64ImageBytes = part.inlineData.data;
          const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
          setGeneratedImage(imageUrl);
          return;
        }
      }
      throw new Error("No image data received from the AI.");

    } catch (err) {
      console.error("AI Image Generation Error:", err);
      setError("Failed to generate image. The model may have refused the prompt. Please try a different description.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (generatedImage) {
      onSave(generatedImage);
      handleClose();
    }
  };

  const resetState = () => {
    setPrompt('');
    setIsLoading(false);
    setError(null);
    setGeneratedImage(null);
  };
  
  const handleClose = () => {
      resetState();
      onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate Area Image with AI"
      footer={
        <div className="flex justify-between items-center w-full">
            <div/>
            <div className="flex gap-2">
                <button onClick={handleClose} className="py-2 px-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition">Cancel</button>
                <button onClick={handleSave} disabled={!generatedImage || isLoading} className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-secondary transition disabled:bg-gray-500 disabled:cursor-not-allowed">
                    Save Image
                </button>
            </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-300 mb-1">
            Describe the image you want to create
          </label>
          <textarea
            id="image-prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A modern kitchen with marble countertops and stainless steel appliances, sunny day."
            className="w-full bg-base-100 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent focus:border-accent"
          />
        </div>
        
        <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-500"
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
                    <PhotoIcon />
                    Generate Image
                </>
            )}
        </button>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <div className="mt-4 bg-neutral rounded-lg p-2 min-h-[256px] flex items-center justify-center">
            {generatedImage ? (
                <img src={generatedImage} alt="AI generated preview" className="max-h-80 w-auto rounded-md" />
            ) : (
                <p className="text-gray-500">Image preview will appear here</p>
            )}
        </div>
      </div>
    </Modal>
  );
};

export default GenerateImageModal;