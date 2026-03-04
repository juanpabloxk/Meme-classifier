import { useState, useEffect } from 'react';
import { FolderOpen, LayoutGrid, Image as ImageIcon } from 'lucide-react';
import MemeCard from './MemeCard';

export default function MemeWorkspace({ workspaceImages, setWorkspaceImages }) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function init() {
      if (window.api && window.api.getSettings) {
        setSettings(await window.api.getSettings());
      }
    }
    init();
  }, []);

  const handleSelectFolder = async () => {
    if (!window.api) return;
    const folderPath = await window.api.selectFolder();
    if (folderPath) {
      setLoading(true);
      const fetchedImages = await window.api.getImages(folderPath);
      setTimeout(() => {
        setWorkspaceImages(fetchedImages);
        setLoading(false);
      }, 400);
    }
  };

  const handleRemoveFromWorkspace = (pathToRemove) => {
    setWorkspaceImages(prev => prev.filter(img => img.path !== pathToRemove));
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 relative flex flex-col h-full bg-slate-900">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8 backdrop-blur-md bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 shadow-lg sticky top-0 z-20">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-2">
            AI Meme Classifier
          </h1>
          <p className="text-slate-400 text-sm font-medium">Review, rename, and organize your images rapidly.</p>
        </div>
        <button 
          onClick={handleSelectFolder}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 group font-bold"
        >
          <FolderOpen size={20} className="group-hover:rotate-12 transition-transform duration-300" />
          Select Folder
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center animate-pulse gap-6">
          <LayoutGrid size={56} className="text-blue-500/50" />
        <p className="text-blue-400 font-bold tracking-wider uppercase text-sm">Scanning Folder...</p>
        </div>
      ) : workspaceImages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-12">
          {workspaceImages.map((img) => (
            <MemeCard 
              key={img.path} 
              image={img} 
              settings={settings}
              onRemove={() => handleRemoveFromWorkspace(img.path)}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/50 rounded-[2rem] bg-slate-800/20 m-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700 rounded-[2rem] pointer-events-none"></div>
          <ImageIcon size={64} className="mb-6 opacity-40 group-hover:scale-110 group-hover:text-blue-400 transition-all duration-500 group-hover:opacity-100" />
          <p className="text-2xl font-bold tracking-wide text-slate-300 group-hover:text-white transition-colors">Workspace Empty</p>
          <p className="text-sm mt-3 font-mono text-slate-500">Pick a folder to start organizing your collection.</p>
        </div>
      )}
    </div>
  );
}
