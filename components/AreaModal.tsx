
import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface AreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const AreaModal: React.FC<AreaModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setName('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Area"
      footer={
        <div className="flex gap-2">
          <button onClick={onClose} className="py-2 px-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition">Cancel</button>
          <button onClick={handleSave} className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-secondary transition">Save Area</button>
        </div>
      }
    >
      <div>
        <label htmlFor="area-name" className="block text-sm font-medium text-gray-300 mb-1">
          Area Name
        </label>
        <input
          id="area-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., First Floor - Kitchen"
          className="w-full bg-neutral border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent focus:border-accent"
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
        />
        <p className="text-xs text-gray-500 mt-2">Examples: First Floor, Kitchen, Bedroom, Bathroom, Balcony, etc.</p>
      </div>
    </Modal>
  );
};

export default AreaModal;
