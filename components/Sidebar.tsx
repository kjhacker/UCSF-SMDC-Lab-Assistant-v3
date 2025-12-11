import React, { useRef } from 'react';
import { UploadedFile } from '../types';
import { fileToBase64, generateId, getFileType, formatFileSize } from '../utils/fileUtils';
import { 
  FileUp, 
  Trash2, 
  Video as VideoIcon, 
  FileText as FileIcon,
  Beaker,
  ShieldAlert,
  BookOpen,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  onResetKey: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ files, setFiles, onResetKey }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // 1. Validate File Size (Not Empty)
      if (selectedFile.size === 0) {
        alert("Error: The selected file is empty (0 bytes). Please upload a valid file.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const fileType = getFileType(selectedFile.type);

      if (fileType === 'unknown') {
        alert('Please upload only PDF documents, Text files (.txt), or MP4 videos.');
        return;
      }

      // 2. Validate Large Files
      if (selectedFile.size > 50 * 1024 * 1024) {
        if(!confirm("This file is large (>50MB). It may take a while to process. Continue?")) {
            return;
        }
      }

      try {
        const base64Data = await fileToBase64(selectedFile);
        const newFile: UploadedFile = {
          id: generateId(),
          name: selectedFile.name,
          type: fileType,
          mimeType: selectedFile.type,
          data: base64Data,
        };
        setFiles((prev) => [...prev, newFile]);
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Failed to read file.");
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const localProtocols = files.filter(f => f.type === 'text');
  const manualFiles = files.filter(f => f.type === 'pdf');
  const videoFiles = files.filter(f => f.type === 'video');

  return (
    <div className="w-80 bg-teal-950 text-slate-100 flex flex-col h-full border-r border-teal-900 shadow-xl z-20">
      {/* Header */}
      <div className="p-6 border-b border-teal-800 bg-teal-900/50">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-teal-500 rounded-lg">
            <Beaker className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">UCSF Lab Assistant</h1>
        </div>
        <p className="text-xs text-teal-300 mt-2">SMDC Protocol Bot</p>
      </div>

      {/* Upload Section */}
      <div className="p-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".txt,text/plain,.pdf,application/pdf,.mp4,video/mp4"
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-teal-700 rounded-xl bg-teal-900/30 hover:bg-teal-800/50 hover:border-teal-500 transition-all cursor-pointer group"
        >
          <div className="p-2 bg-teal-900 rounded-full mb-2 group-hover:scale-110 transition-transform">
             <FileUp className="w-5 h-5 text-teal-400" />
          </div>
          <span className="text-sm font-medium text-teal-200 group-hover:text-white">Upload Reference</span>
          <span className="text-[10px] text-teal-500 mt-1 uppercase">TXT, PDF, MP4</span>
        </label>
      </div>

      {/* File Lists */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6">
        
        {/* Local Protocols (Text) - Priority 1 */}
        <div>
          <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <ShieldAlert className="w-3 h-3" />
            Local Protocols (Highest Authority)
          </h3>
          {localProtocols.length === 0 ? (
            <p className="text-[10px] text-teal-700 italic pl-2 border-l-2 border-teal-800">No local protocols.</p>
          ) : (
            <ul className="space-y-2">
              {localProtocols.map((file) => (
                <li key={file.id} className="flex items-center justify-between p-2.5 bg-amber-900/20 rounded-lg border border-amber-700/50 hover:border-amber-500 transition-colors group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileIcon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-sm text-amber-100 truncate font-medium" title={file.name}>{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(file.id)} className="text-teal-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Manuals (PDF) - Priority 2 */}
        <div>
          <h3 className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <BookOpen className="w-3 h-3" />
            Manufacturer Manuals
          </h3>
          {manualFiles.length === 0 ? (
            <p className="text-[10px] text-teal-700 italic pl-2 border-l-2 border-teal-800">No manuals uploaded.</p>
          ) : (
            <ul className="space-y-2">
              {manualFiles.map((file) => (
                <li key={file.id} className="flex items-center justify-between p-2.5 bg-teal-900/40 rounded-lg border border-teal-800/50 hover:border-teal-700 transition-colors group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileIcon className="w-4 h-4 text-teal-300 shrink-0" />
                    <span className="text-sm text-teal-100 truncate" title={file.name}>{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(file.id)} className="text-teal-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Videos - Priority 3 */}
        <div>
          <h3 className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <VideoIcon className="w-3 h-3" />
            Training Videos
          </h3>
          {videoFiles.length === 0 ? (
            <p className="text-[10px] text-teal-700 italic pl-2 border-l-2 border-teal-800">No videos uploaded.</p>
          ) : (
            <ul className="space-y-2">
              {videoFiles.map((file) => (
                <li key={file.id} className="flex items-center justify-between p-2.5 bg-teal-900/40 rounded-lg border border-teal-800/50 hover:border-teal-700 transition-colors group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <VideoIcon className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-sm text-teal-100 truncate" title={file.name}>{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(file.id)} className="text-teal-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Footer Status */}
      <div className="p-4 bg-teal-950 border-t border-teal-900 text-xs text-teal-500 flex justify-between items-center">
        <span>{files.length} Files loaded</span>
        <button 
          onClick={onResetKey}
          className="flex items-center gap-1 hover:text-teal-300 transition-colors"
          title="Reset API Key"
        >
          <LogOut className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;