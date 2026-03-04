import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    provider: 'ollama',
    apiKey: '',
    baseUrl: 'http://127.0.0.1:11434/v1',
    modelName: 'llava:latest',
    enableThinking: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      if (window.api && window.api.getSettings) {
        const loaded = await window.api.getSettings();
        setSettings(loaded);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setSaved(false);
  };

  const handleProviderChange = (e) => {
    const provider = e.target.value;
    let bUrl = settings.baseUrl;
    let mName = settings.modelName;

    if (provider === 'ollama') {
      bUrl = 'http://127.0.0.1:11434/v1';
      mName = 'llava:latest';
    } else if (provider === 'lmstudio') {
      bUrl = 'http://127.0.0.1:1234/v1';
      mName = 'vision-model';
    } else if (provider === 'openai') {
      bUrl = 'https://api.openai.com/v1';
      mName = 'gpt-4o-mini';
    } else if (provider === 'claude') {
      bUrl = 'https://api.anthropic.com/v1';
      mName = 'claude-3-haiku-20240307';
    } else if (provider === 'google') {
      bUrl = 'https://generativelanguage.googleapis.com/v1beta';
      mName = 'gemini-2.5-flash';
    }

    setSettings(prev => ({
      ...prev,
      provider,
      baseUrl: bUrl,
      modelName: mName
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    if (window.api && window.api.saveSettings) {
      await window.api.saveSettings(settings);
    }
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-900 text-slate-200">
      <div className="max-w-2xl mx-auto backdrop-blur-sm bg-slate-800/80 p-8 rounded-2xl shadow-xl border border-slate-700/50">
        <h1 className="text-3xl font-bold mb-8 text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
          Model Settings
        </h1>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">AI Provider</label>
            <select 
              name="provider" 
              value={settings.provider} 
              onChange={handleProviderChange}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="ollama">Ollama (Local)</option>
              <option value="lmstudio">LM Studio (Local)</option>
              <option value="openai">OpenAI</option>
              <option value="claude">Anthropic Claude</option>
              <option value="google">Google Gemini</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Base URL</label>
            <input 
              type="text" 
              name="baseUrl"
              value={settings.baseUrl}
              onChange={handleChange}
              placeholder="e.g. http://127.0.0.1:11434/v1"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-600 rounded-lg p-3">
            <input 
              type="checkbox" 
              id="enableThinking"
              name="enableThinking"
              checked={settings.enableThinking}
              onChange={handleChange}
              className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500/50 bg-slate-800 cursor-pointer transition-all"
            />
            <div className="flex flex-col">
              <label htmlFor="enableThinking" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
                Enable Model Thinking/Reasoning
              </label>
              <span className="text-xs text-slate-500">
                Allows models like qwen3.5 to process reasoning tokens (increases max tokens).
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Model Name</label>
            <input 
              type="text" 
              name="modelName"
              value={settings.modelName}
              onChange={handleChange}
              placeholder="e.g. llava:latest or gpt-4o-mini"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">Make sure the model supports vision!</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">API Key</label>
            <input 
              type="password" 
              name="apiKey"
              value={settings.apiKey}
              onChange={handleChange}
              placeholder="Leave blank for local models usually"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-4">
          {saved && (
            <span className="text-emerald-400 text-sm flex items-center gap-2 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={16} /> Saved!
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 font-medium"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
