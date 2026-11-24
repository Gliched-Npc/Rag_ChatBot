import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, FileCheck, AlertTriangle } from 'lucide-react';
import type { ChatMessage } from '../types';

interface MessageItemProps {
  message: ChatMessage;
}

const DOCUMENT_NAMES: Record<string, string> = {
  '1706.03762v7.pdf': 'Attention Is All You Need',
  '1810.04805v2.pdf': 'BERT (Devlin et al.)',
  '2005.11401v4.pdf': 'RAG (Lewis et al.)',
};

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const copyContent = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`py-5 px-4 md:px-6 flex gap-4 transition-colors ${
      isAssistant ? 'bg-slate-900/50 border-y border-slate-800/40' : 'bg-transparent'
    }`}>
      {/* Avatar */}
      <div className="shrink-0">
        {isAssistant ? (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Bot className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-400">
            {isAssistant ? 'Gemini 2.5 Flash (RAG)' : 'You'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isAssistant && message.status === 'success' && (
              <button
                onClick={copyContent}
                title="Copy response"
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Pending state */}
        {message.status === 'pending' && (
          <div className="flex items-center gap-2 py-2 text-slate-400 text-sm">
            <div className="flex space-x-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Retrieving context & generating answer...</span>
          </div>
        )}

        {/* Error state */}
        {message.status === 'error' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Failed to get response</p>
              <p className="text-rose-400/90 mt-0.5">{message.errorMessage || 'Please check that the FastAPI server is running on port 8000.'}</p>
            </div>
          </div>
        )}

        {/* Markdown body */}
        {message.content && (
          <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Source Citations */}
        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileCheck className="w-3 h-3 text-emerald-400" />
              <span>Referenced Sources ({message.sources.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((src, idx) => {
                const label = DOCUMENT_NAMES[src] || src;
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-950/50 text-indigo-300 border border-indigo-800/60 shadow-sm"
                    title={src}
                  >
                    <span>📄</span>
                    <span className="font-mono">{label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
