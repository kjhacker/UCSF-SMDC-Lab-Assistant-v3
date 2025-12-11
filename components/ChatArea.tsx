import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, Upload, Paperclip } from 'lucide-react';
import { Message, UploadedFile } from '../types';
import ChatMessage from './ChatMessage';
import { generateLabResponse } from '../services/geminiService';
import { generateId } from '../utils/fileUtils';

interface ChatAreaProps {
  files: UploadedFile[];
  apiKey: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({ files, apiKey }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello. I am the UCSF Lab Assistant. Please upload your protocols (PDF) or training videos (MP4) in the sidebar, and I will answer questions based strictly on their content.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const newMessage: Message = {
      id: generateId(),
      role: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      // Pass the apiKey to the service
      const responseText = await generateLabResponse(apiKey, messages, files, userText);
      
      const botMessage: Message = {
        id: generateId(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'model',
        text: error.message || "I encountered an error. Please check your settings.",
        timestamp: new Date(),
        isError: true
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
        <div className="max-w-4xl mx-auto pb-4">
            {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
                <div className="flex justify-start mb-6 w-full animate-pulse">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                             <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                             <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce mx-1" style={{ animationDelay: '150ms' }} />
                             <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-slate-400 font-medium">Analyzing documents...</span>
                     </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 md:p-6 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={files.length > 0 ? "Ask a question about the uploaded protocols..." : "Upload files in the sidebar to begin..."}
              className="flex-1 bg-transparent border-none resize-none focus:ring-0 p-3 max-h-32 text-slate-800 placeholder-slate-400 text-sm md:text-base"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-xl mb-0.5 transition-all duration-200 
                ${!input.trim() || isLoading 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg active:scale-95'
                }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-slate-400">
               AI responses are generated based on uploaded content. Verify critical protocols independently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
