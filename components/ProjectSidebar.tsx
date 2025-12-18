
import React, { useState } from 'react';
import { Project } from '../types';
import { PlusIcon, EditIcon, TrashIcon, ClipboardListIcon, XIcon } from './icons';

interface ProjectSidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: (name: string) => void;
  onUpdateProject: (id: string, name: string) => void;
  onDeleteProject: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  isOpen,
  onClose,
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim());
      setNewProjectName('');
      setIsAdding(false);
    }
  };
  
  const sidebarClasses = `
    w-64 bg-base-100 flex-shrink-0 flex flex-col border-r border-gray-700
    fixed md:relative inset-y-0 left-0 z-40
    transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0
  `;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={onClose} aria-hidden="true"></div>}
      
      <aside className={sidebarClasses}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><ClipboardListIcon/> Projects</h2>
          <button onClick={onClose} className="md:hidden p-1 text-gray-300 hover:text-white" aria-label="Close sidebar">
            <XIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2">
            {projects.map(project => (
              <div key={project.id} className={`group flex items-center justify-between rounded-md text-sm font-medium transition-colors ${selectedProjectId === project.id ? 'bg-primary text-white' : 'text-gray-300 hover:bg-neutral'}`}>
                  <button onClick={() => onSelectProject(project.id)} className="flex-grow text-left p-2 truncate">
                      {project.name}
                  </button>
                  <div className="hidden group-hover:flex items-center p-2">
                      <button onClick={() => {
                          const name = prompt("Enter new name:", project.name);
                          if(name) onUpdateProject(project.id, name);
                      }} className="text-gray-400 hover:text-white"><EditIcon className="w-4 h-4"/></button>
                      <button onClick={() => {
                          if(window.confirm(`Are you sure you want to delete "${project.name}"?`)) onDeleteProject(project.id);
                      }} className="ml-2 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                  </div>
              </div>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-700">
          {isAdding ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="New project name"
                className="w-full bg-neutral border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent focus:border-accent"
                onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
              />
              <div className="flex gap-2">
                <button onClick={handleAddProject} className="flex-1 bg-primary text-white py-2 px-3 rounded-md text-sm font-semibold hover:bg-secondary transition">Add</button>
                <button onClick={() => setIsAdding(false)} className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-md text-sm hover:bg-gray-500 transition">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center gap-2 bg-accent text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-500 transition duration-300">
              <PlusIcon />
              New Project
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default ProjectSidebar;