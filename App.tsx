import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ApiKeyInput from './components/ApiKeyInput';
import { UploadedFile } from './types';

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
  };

  const handleResetKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey(null);
    setUploadedFiles([]); // Clean up files on logout for security
  };

  if (!apiKey) {
    return <ApiKeyInput onSave={handleSaveKey} />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-100 overflow-hidden">
      {/* Sidebar - Files */}
      <Sidebar 
        files={uploadedFiles} 
        setFiles={setUploadedFiles} 
        onResetKey={handleResetKey}
      />
      
      {/* Main Content - Chat */}
      <main className="flex-1 h-full relative">
         <ChatArea files={uploadedFiles} apiKey={apiKey} />
      </main>
    </div>
  );
};

export default App;
