import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Settings as SettingsIcon, Image as ImageIcon } from 'lucide-react';
import MemeWorkspace from './components/MemeWorkspace';
import Settings from './components/Settings';

export default function App() {
  const location = useLocation();
  const [workspaceImages, setWorkspaceImages] = useState([]);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <nav className="w-16 bg-slate-800 flex flex-col items-center py-4 border-r border-slate-700 shrink-0 shadow-lg z-10">
        <Link 
          to="/" 
          className={`p-3 rounded-xl mb-4 transition-all duration-200 ${location.pathname === '/' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          title="Workspace"
        >
          <ImageIcon size={24} />
        </Link>
        <Link 
          to="/settings" 
          className={`p-3 rounded-xl transition-all duration-200 ${location.pathname === '/settings' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          title="Settings"
        >
          <SettingsIcon size={24} />
        </Link>
      </nav>

      <main className="flex-1 overflow-hidden flex flex-col relative bg-slate-900 w-full">
        <Routes>
          <Route path="/" element={<MemeWorkspace workspaceImages={workspaceImages} setWorkspaceImages={setWorkspaceImages} />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
