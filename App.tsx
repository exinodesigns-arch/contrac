
import React, { useState, useMemo, useEffect } from 'react';
import { Project, Area, WorkItem, WorkStatus, WorkCategory, UnitType } from './types';
import ProjectSidebar from './components/ProjectSidebar';
import ProjectView from './components/ProjectView';
import LoginPage from './components/LoginPage';
import { PlusIcon, CloudUploadIcon, MenuIcon } from './components/icons';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/projects')
        .then(res => res.json())
        .then(data => {
          setProjects(data);
          if (data.length > 0) {
            setSelectedProjectId(data[0].id);
          }
        });
    }
  }, [isAuthenticated]);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  const handleAddProject = (name: string) => {
    const newProject: Project = { id: `proj-${Date.now()}`, name, areas: [] };
    setProjects(prev => [...prev, newProject]);
    setSelectedProjectId(newProject.id);
    setIsSidebarOpen(false);
  };
  
  const handleSelectProject = (id: string) => {
      setSelectedProjectId(id);
      setIsSidebarOpen(false);
  }

  const handleUpdateProject = (projectId: string, name: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name } : p));
  };
  
  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProjectId === projectId) {
        setSelectedProjectId(projects.length > 1 ? projects.filter(p=>p.id !== projectId)[0].id : null);
    }
  };

  const handleAddArea = (projectId: string, name: string) => {
    const newArea: Area = { id: `area-${Date.now()}`, name, workItems: [] };
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, areas: [...p.areas, newArea] } : p
    ));
  };

  const handleUpdateArea = (projectId: string, areaId: string, updatedAreaData: Partial<Area>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, areas: p.areas.map(a => {
            if (a.id === areaId) {
                return { ...a, ...updatedAreaData };
            }
            return a;
        })};
      }
      return p;
    }));
  };

  const handleAddWorkItem = (projectId: string, areaId: string, item: WorkItem) => {
     setProjects(prev => prev.map(p => {
       if (p.id === projectId) {
         return { ...p, areas: p.areas.map(a => {
           if (a.id === areaId) {
             return { ...a, workItems: [...a.workItems, item] };
           }
           return a;
         })}
       }
       return p;
     }));
  };

  const handleAddMultipleWorkItems = (projectId: string, areaId: string, items: Partial<WorkItem>[]) => {
    const fullWorkItems: WorkItem[] = items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        name: item.name || 'Unnamed Work',
        category: item.category || WorkCategory.OTHER,
        subWorks: [],
        designPreference: '',
        color: '',
        length: 0, width: 0, depth: 0, units: 0, unitMultiplier: 1,
        unitType: UnitType.LUMPSUM,
        quantity: 1,
        status: WorkStatus.PENDING,
        ...item,
    }));

    setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            return {
                ...p,
                areas: p.areas.map(a => {
                    if (a.id === areaId) {
                        return { ...a, workItems: [...a.workItems, ...fullWorkItems] };
                    }
                    return a;
                })
            };
        }
        return p;
    }));
  };

  const handleUpdateWorkItem = (projectId: string, areaId: string, updatedItem: WorkItem) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, areas: p.areas.map(a => {
          if (a.id === areaId) {
            return { ...a, workItems: a.workItems.map(wi => wi.id === updatedItem.id ? updatedItem : wi) };
          }
          return a;
        })}
      }
      return p;
    }));
  };

  const handleDeleteWorkItem = (projectId: string, areaId: string, itemId: string) => {
     setProjects(prev => prev.map(p => {
       if (p.id === projectId) {
         return { ...p, areas: p.areas.map(a => {
           if (a.id === areaId) {
             return { ...a, workItems: a.workItems.filter(wi => wi.id !== itemId) };
           }
           return a;
         })}
       }
       return p;
     }));
  };
  
  const handleSaveToCloud = async () => {
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projects),
      });
      if (response.ok) {
        alert('Projects saved successfully!');
      } else {
        alert('Failed to save projects.');
      }
    } catch (error) {
      console.error('Error saving projects:', error);
      alert('An error occurred while saving projects.');
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-neutral text-gray-200 font-sans">
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
        onAddProject={handleAddProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-base-100 shadow-md p-4 z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1 text-gray-300 hover:text-white" aria-label="Open sidebar">
                    <MenuIcon />
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-white">ConstructTrack Dashboard</h1>
            </div>
            <button 
                onClick={handleSaveToCloud} 
                className="flex items-center gap-2 bg-accent hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
                <CloudUploadIcon />
                <span className="hidden sm:inline">Save to Cloud</span>
            </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {selectedProject ? (
            <ProjectView
              project={selectedProject}
              onAddArea={handleAddArea}
              onUpdateArea={handleUpdateArea}
              onAddWorkItem={handleAddWorkItem}
              onAddMultipleWorkItems={handleAddMultipleWorkItems}
              onUpdateWorkItem={handleUpdateWorkItem}
              onDeleteWorkItem={handleDeleteWorkItem}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-3xl font-bold text-white400">No Project Selected</h2>
              <p className="text-gray-500 mt-2">Please select a project from the sidebar or create a new one.</p>
               <button onClick={() => {
                   const name = prompt("Enter new project name:");
                   if (name) handleAddProject(name);
               }} className="mt-6 flex items-center gap-2 bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    <PlusIcon />
                    Create New Project
                </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
