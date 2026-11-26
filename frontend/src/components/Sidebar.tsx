import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  FileText, 
  Sparkles,
  Database
} from 'lucide-react';
import type { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  documents: string[];
  backendOnline: boolean;
  isOpen: boolean;
  onCloseMobile: () => void;
}

const DOCUMENT_NAMES: Record<string, string> = {
  '1706.03762v7.pdf': 'Attention Is All You Need (Transformer)',
  '1810.04805v2.pdf': 'BERT: Pre-training of Deep Bidirectional Transformers',
  '2005.11401v4.pdf': 'Retrieval-Augmented Generation for Knowledge NLP',
};

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  documents,
  backendOnline,
  isOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-40
        w-72 bg-slate-900 border-r border-slate-800 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sm text-slate-100 tracking-wide">RAG Chatbot</h1>
              <p className="text-xs text-slate-400">Gemini 2.5 Flash + FAISS</p>
            </div>
          </div>
        </div>

        {/* Action: New Chat */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Conversations
          </div>
          {sessions.length === 0 ? (
            <div className="px-3 py-4 text-xs text-slate-500 text-center">
              No conversations yet. Start one!
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-slate-800 text-indigo-400 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate flex-1">{session.title || 'Untitled Conversation'}</span>
                  <button
                    title="Delete session"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}

          {/* Document Knowledge Base section */}
          <div className="pt-4 px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3 h-3 text-slate-400" />
            <span>Knowledge Base ({documents.length})</span>
          </div>

          <div className="space-y-1 pt-1">
            {documents.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500">Checking vector index...</div>
            ) : (
              documents.map((doc) => {
                const label = DOCUMENT_NAMES[doc] || doc;
                return (
                  <div
                    key={doc}
                    className="flex items-start gap-2 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 bg-slate-950/40 border border-slate-800/80"
                    title={doc}
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="truncate font-mono">{label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Backend Status Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 py-1">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              FastAPI Backend
            </span>
            <span className={`text-[11px] font-medium ${backendOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
              {backendOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
