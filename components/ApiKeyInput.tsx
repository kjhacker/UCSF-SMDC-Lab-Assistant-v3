import React, { useState } from 'react';
import { Key, Beaker, ShieldCheck } from 'lucide-react';

interface ApiKeyInputProps {
  onSave: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave }) => {
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onSave(inputKey.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-teal-900 p-8 text-center">
          <div className="mx-auto bg-teal-800 w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <Beaker className="w-8 h-8 text-teal-300" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">UCSF Lab Assistant</h1>
          <p className="text-teal-200 text-sm">Please authenticate to access laboratory protocols.</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-2">
                Gemini API Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  id="apiKey"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-slate-900 placeholder-slate-400"
                  placeholder="Paste your API key here..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  required
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Your key is stored locally in your browser and is never sent to any server other than Google's API.
              </p>
            </div>

            <button
              type="submit"
              disabled={!inputKey.trim()}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all
                ${inputKey.trim() 
                  ? 'bg-teal-600 hover:bg-teal-700 hover:shadow-md' 
                  : 'bg-slate-300 cursor-not-allowed'}
              `}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Authenticate
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-teal-600 hover:text-teal-800 font-medium underline"
          >
            Get a Gemini API Key
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;
