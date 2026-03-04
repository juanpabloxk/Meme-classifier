import { useState } from 'react';
import { Bot, Check, X, Edit2, Loader2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function MemeCard({ image, settings, onRemove }) {
  const [suggestedName, setSuggestedName] = useState("");
  const [isClassifying, setIsClassifying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [manualName, setManualName] = useState("");
  const [error, setError] = useState(null);

  const handleClassify = async () => {
    if (!settings || !window.api) return;
    setIsClassifying(true);
    setError(null);
    setSuggestedName("");
    
    try {
      const result = await window.api.classifyImage(image.path, settings);
      if (result.success) {
        setSuggestedName(result.name);
        setManualName(result.name);
      } else {
        setError(result.error || "Failed to classify");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to LLM");
    } finally {
      setIsClassifying(false);
    }
  };

  const handleApply = async () => {
    if (!window.api || (!suggestedName && !manualName)) return;
    
    const finalName = isEditing ? manualName : suggestedName;
    if (finalName === "UNCLASSIFIABLE_IMAGE") {
      onRemove();
      return;
    }

    // Attempt to rename via IPC
    // Calculate new path by replacing file name (but keeping extension)
    const normalizedName = finalName.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
    
    // Extract extension from original
    const extMatch = image.name.match(/\.[^.]+$/);
    const ext = extMatch ? extMatch[0] : '.jpg';
    
    const folderPath = image.path.substring(0, image.path.lastIndexOf('/'));
    const finalPath = `${folderPath}/${normalizedName}${ext}`;

    // If name hasn't changed, just remove
    if (image.path === finalPath) {
      onRemove();
      return;
    }

    const result = await window.api.renameImage(image.path, finalPath);
    if (result.success) {
      // Done renaming, remove from workspace
      onRemove();
    } else {
      setError(result.error);
    }
  };

  const handleDiscard = () => {
    setSuggestedName("");
    setManualName("");
    setError(null);
    setIsEditing(false);
  };

  const isUnclassifiable = suggestedName === "UNCLASSIFIABLE_IMAGE";

  return (
    <div className="group relative bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-700/60 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col h-full">
      {/* Visual Preview */}
      <div className="relative aspect-square w-full bg-slate-900/50 flex items-center justify-center overflow-hidden border-b border-slate-700/50">
        <img 
          src={image.url} 
          alt={image.name} 
          className="object-contain w-full h-full max-h-full transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = ''; }}
        />
        {/* File name overlay label */}
        <div className="absolute top-2 left-2 right-2 flex justify-between">
          <span className="bg-slate-900/80 backdrop-blur-md text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 whitespace-nowrap overflow-hidden text-ellipsis shadow-lg relative max-w-full">
            {image.name}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {error && (
          <div className="mb-3 text-red-400 bg-red-900/20 text-xs px-3 py-2 rounded-lg border border-red-900/50 flex items-center gap-2 font-medium">
            <AlertCircle size={14} />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Suggestion Section */}
        {suggestedName ? (
          <div className="flex-1 flex flex-col gap-3">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 relative group/edit">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block flex items-center gap-1">
                <Sparkles size={12} className={isUnclassifiable ? 'text-orange-400' : 'text-blue-400'} />
                {isUnclassifiable ? 'Attention' : 'Suggested Name'}
              </label>
              
              {isEditing && !isUnclassifiable ? (
                <input 
                  type="text" 
                  value={manualName} 
                  onChange={(e) => setManualName(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-800 border border-blue-500 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-mono shadow-inner"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApply();
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                  onBlur={() => setIsEditing(false)}
                />
              ) : (
                <div 
                  className={`text-sm font-mono break-all cursor-pointer border border-transparent rounded-lg p-1 -mx-1 transition-colors ${isUnclassifiable ? 'text-orange-400 font-bold' : 'text-emerald-400 hover:bg-slate-800 hover:border-slate-600'}`}
                  onClick={() => !isUnclassifiable && setIsEditing(true)}
                  title={isUnclassifiable ? "Image doesn't seem to be a meme." : "Click to edit"}
                >
                  {isEditing ? manualName : suggestedName}
                </div>
              )}
              {!isUnclassifiable && !isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors opacity-0 group-hover/edit:opacity-100 p-1"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>

            <div className="flex gap-2 mt-auto">
              <button 
                onClick={handleApply}
                title={isUnclassifiable ? "Acknowledge and remove from workspace" : "Apply this filename"}
                className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 text-sm"
              >
                <Check size={16} /> {isUnclassifiable ? 'Acknowledge' : 'Apply'}
              </button>
              <button 
                onClick={handleClassify}
                disabled={isClassifying}
                title="Generates a new name suggestion"
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl font-bold flex items-center justify-center transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
              >
                {isClassifying ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
              </button>
              <button 
                onClick={handleDiscard}
                title="Discard this suggestion"
                className="bg-slate-700 hover:bg-red-500/80 text-white p-2.5 rounded-xl font-bold flex items-center justify-center transition-all hover:shadow-lg hover:shadow-red-500/20 active:scale-95 aspect-square"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-end">
            <button 
              onClick={handleClassify}
              disabled={isClassifying}
              className={`w-full p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm ${
                isClassifying 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30'
              }`}
            >
              {isClassifying ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Analyzing...
                </>
              ) : (
                <>
                  <Bot size={18} /> Classify Meme
                </>
              )}
            </button>
            <button
               onClick={onRemove}
               className="mt-3 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1 w-full"
            >
              <X size={12} /> Ignore
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
