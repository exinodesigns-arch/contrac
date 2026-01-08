import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { CameraIcon, UploadIcon } from './icons';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please ensure you have granted permission.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        onCapture(imageDataUrl);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        onCapture(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Take a Photo"
      footer={
        <div className="flex justify-between items-center w-full">
            <button onClick={triggerFileUpload} className="flex items-center gap-2 py-2 px-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition">
                <UploadIcon className="w-4 h-4" />
                Upload Image
            </button>
            <div className="flex gap-2">
                <button onClick={onClose} className="py-2 px-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition">Cancel</button>
                <button onClick={handleCapture} disabled={!stream} className="flex items-center gap-2 py-2 px-4 bg-primary text-white rounded-lg hover:bg-secondary transition disabled:bg-gray-500">
                    <CameraIcon className="w-4 h-4" />
                    Capture
                </button>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*"
            />
        </div>
      }
    >
      <div className="bg-black rounded-lg overflow-hidden aspect-video">
        {error ? (
          <div className="flex items-center justify-center h-full text-red-500 p-4">
            {error}
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
        )}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </Modal>
  );
};

export default CameraModal;
