import React, { useState } from 'react';
import { Project, Area, WorkItem } from '../types';
import WorkItemModal from './WorkItemModal';
import AreaModal from './AreaModal';
import GenerateWorkModal from './GenerateWorkModal';
import GenerateImageModal from './GenerateImageModal';
import CameraModal from './CameraModal';
import DesignIdeasModal from './DesignIdeasModal';
import WorkItemCard from './WorkItemCard';
import ProgressSummary from './ProgressSummary';
import { PlusIcon, SparklesIcon, CameraIcon, PhotoIcon, WandIcon } from './icons';

interface ProjectViewProps {
  project: Project;
  onAddArea: (projectId: string, name: string) => void;
  onUpdateArea: (projectId: string, areaId: string, data: Partial<Area>) => void;
  onAddWorkItem: (projectId: string, areaId: string, item: WorkItem) => void;
  onAddMultipleWorkItems: (projectId: string, areaId: string, items: Partial<WorkItem>[]) => void;
  onUpdateWorkItem: (projectId: string, areaId: string, item: WorkItem) => void;
  onDeleteWorkItem: (projectId: string, areaId: string, itemId: string) => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ 
  project, 
  onAddArea, 
  onUpdateArea,
  onAddWorkItem,
  onAddMultipleWorkItems,
  onUpdateWorkItem,
  onDeleteWorkItem
}) => {
  const [isWorkItemModalOpen, setIsWorkItemModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerateImageModalOpen, setIsGenerateImageModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);

  const [editingWorkItem, setEditingWorkItem] = useState<WorkItem | null>(null);
  const [currentAreaId, setCurrentAreaId] = useState<string | null>(null);

  const handleOpenWorkItemModal = (areaId: string, workItem: WorkItem | null = null) => {
    setCurrentAreaId(areaId);
    setEditingWorkItem(workItem);
    setIsWorkItemModalOpen(true);
  };
  
  const handleCloseWorkItemModal = () => {
    setIsWorkItemModalOpen(false);
    setEditingWorkItem(null);
    setCurrentAreaId(null);
  };
  
  const handleSaveWorkItem = (item: WorkItem) => {
    if (!currentAreaId) return;
    if (editingWorkItem) {
      onUpdateWorkItem(project.id, currentAreaId, item);
    } else {
      onAddWorkItem(project.id, currentAreaId, item);
    }
    handleCloseWorkItemModal();
  };

  const handleOpenGenerateModal = (areaId: string) => {
    setCurrentAreaId(areaId);
    setIsGenerateModalOpen(true);
  };

  const handleSaveGeneratedItems = (items: Partial<WorkItem>[], imageUrl: string | null) => {
      if (currentAreaId) {
          if (imageUrl) {
            onUpdateArea(project.id, currentAreaId, { imageUrl });
          }
          onAddMultipleWorkItems(project.id, currentAreaId, items);
      }
      setIsGenerateModalOpen(false);
      setCurrentAreaId(null);
  };

  const handleOpenGenerateImageModal = (areaId: string) => {
    setCurrentAreaId(areaId);
    setIsGenerateImageModalOpen(true);
  };

  const handleSaveGeneratedImage = (imageUrl: string) => {
    if (currentAreaId) {
        onUpdateArea(project.id, currentAreaId, { imageUrl });
    }
    setIsGenerateImageModalOpen(false);
    setCurrentAreaId(null);
  };

  const handleOpenCameraModal = (areaId: string) => {
    setCurrentAreaId(areaId);
    setIsCameraModalOpen(true);
  };

  const handleSaveCapturedImage = (imageUrl: string) => {
    if (currentAreaId) {
      onUpdateArea(project.id, currentAreaId, { imageUrl });
    }
    setIsCameraModalOpen(false);
    setCurrentAreaId(null);
  };

  const handleOpenDesignModal = (areaId: string) => {
    setCurrentAreaId(areaId);
    setIsDesignModalOpen(true);
  };

  const handleCloseDesignModal = () => {
    setIsDesignModalOpen(false);
    setCurrentAreaId(null);
  };
  
  const handleDeleteItem = () => {
    if (editingWorkItem && currentAreaId) {
        onDeleteWorkItem(project.id, currentAreaId, editingWorkItem.id);
        handleCloseWorkItemModal();
    }
  };

  const handleSaveArea = (name: string) => {
      onAddArea(project.id, name);
      setIsAreaModalOpen(false);
  };

  const allWorkItems = project.areas.flatMap(a => a.workItems);
  const currentArea = project.areas.find(a => a.id === currentAreaId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold text-white">{project.name}</h2>
        <button onClick={() => setIsAreaModalOpen(true)} className="flex items-center justify-center gap-2 bg-accent text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-500 transition duration-300 self-start md:self-center">
          <PlusIcon />
          Add Area
        </button>
      </div>

      <ProgressSummary workItems={allWorkItems} />

      <div className="space-y-8">
        {project.areas.map(area => (
          <div key={area.id} className="bg-base-100 rounded-lg shadow-lg">
            {area.imageUrl && (
              <div className="rounded-t-lg overflow-hidden">
                  <img src={area.imageUrl} alt={area.name} className="w-full h-48 object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="text-xl font-semibold text-gray-100">{area.name}</h3>
                <div className="flex flex-wrap gap-2">
                   <button onClick={() => handleOpenGenerateModal(area.id)} className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg transition duration-300">
                      <SparklesIcon className="w-4 h-4" />
                      AI Generate
                  </button>
                  <button onClick={() => handleOpenGenerateImageModal(area.id)} className="flex items-center gap-2 text-sm bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg transition duration-300">
                      <PhotoIcon className="w-4 h-4" />
                      Generate Image
                  </button>
                   {area.imageUrl && (
                    <button onClick={() => handleOpenDesignModal(area.id)} className="flex items-center gap-2 text-sm bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-3 rounded-lg transition duration-300">
                        <WandIcon className="w-4 h-4" />
                        Design Ideas
                    </button>
                  )}
                  <button onClick={() => handleOpenCameraModal(area.id)} className="flex items-center gap-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-lg transition duration-300">
                      <CameraIcon className="w-4 h-4" />
                      Take Photo
                  </button>
                  <button onClick={() => handleOpenWorkItemModal(area.id)} className="flex items-center gap-2 text-sm bg-primary hover:bg-secondary text-white font-bold py-2 px-3 rounded-lg transition duration-300">
                    <PlusIcon className="w-4 h-4" />
                    Add Work
                  </button>
                </div>
              </div>
              {area.workItems.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {area.workItems.map(item => (
                    <WorkItemCard 
                      key={item.id} 
                      item={item} 
                      onEdit={() => handleOpenWorkItemModal(area.id, item)}
                      onDelete={() => {
                          if(window.confirm(`Delete work item "${item.name}"?`)) {
                              onDeleteWorkItem(project.id, area.id, item.id)
                          }
                      }}
                    />
                  ))}
                </div>
              ) : (
                  <p className="text-gray-500 text-center py-4">No work items in this area yet.</p>
              )}
            </div>
          </div>
        ))}
         {project.areas.length === 0 && (
            <div className="text-center py-10 bg-base-100 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-gray-400">No Areas Defined</h3>
                <p className="text-gray-500 mt-2">Get started by adding a work area to your project.</p>
            </div>
        )}
      </div>

      {isWorkItemModalOpen && currentAreaId && (
        <WorkItemModal
          isOpen={isWorkItemModalOpen}
          onClose={handleCloseWorkItemModal}
          onSave={handleSaveWorkItem}
          workItem={editingWorkItem}
          onDelete={editingWorkItem ? handleDeleteItem : undefined}
        />
      )}

      {isGenerateModalOpen && currentAreaId && (
          <GenerateWorkModal
              isOpen={isGenerateModalOpen}
              onClose={() => { setIsGenerateModalOpen(false); setCurrentAreaId(null); }}
              onSave={handleSaveGeneratedItems}
          />
      )}

      {isGenerateImageModalOpen && currentAreaId && (
        <GenerateImageModal
            isOpen={isGenerateImageModalOpen}
            onClose={() => { setIsGenerateImageModalOpen(false); setCurrentAreaId(null); }}
            onSave={handleSaveGeneratedImage}
        />
      )}
      
      {isCameraModalOpen && (
          <CameraModal
              isOpen={isCameraModalOpen}
              onClose={() => { setIsCameraModalOpen(false); setCurrentAreaId(null); }}
              onCapture={handleSaveCapturedImage}
          />
      )}

      {isDesignModalOpen && currentArea?.imageUrl && (
        <DesignIdeasModal
            isOpen={isDesignModalOpen}
            onClose={handleCloseDesignModal}
            imageUrl={currentArea.imageUrl}
        />
      )}

      <AreaModal
          isOpen={isAreaModalOpen}
          onClose={() => setIsAreaModalOpen(false)}
          onSave={handleSaveArea}
      />
    </div>
  );
};

export default ProjectView;