import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Bot, User, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm
          ${isUser ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-teal-700'}
        `}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
        </div>

        {/* Bubble */}
        <div className={`
          flex flex-col p-5 rounded-2xl shadow-sm text-sm leading-relaxed
          ${isUser 
            ? 'bg-teal-600 text-white rounded-tr-none' 
            : isError 
              ? 'bg-red-50 border border-red-200 text-red-800 rounded-tl-none'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
          }
        `}>
          {isError && (
             <div className="flex items-center gap-2 mb-2 text-red-600 font-semibold">
               <AlertCircle className="w-4 h-4" />
               <span>Error</span>
             </div>
          )}
          
          <div className={`markdown-content ${isUser ? 'text-white' : 'text-slate-800'}`}>
            <ReactMarkdown
              components={{
                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                a: ({node, ...props}) => <a className="underline hover:opacity-80" {...props} />,
                code: ({node, ...props}) => (
                    <code className={`px-1 py-0.5 rounded ${isUser ? 'bg-teal-700' : 'bg-slate-100 text-slate-700'} font-mono text-xs`} {...props} />
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
          
          <span className={`text-[10px] mt-2 opacity-60 ${isUser ? 'text-teal-100' : 'text-slate-400'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
