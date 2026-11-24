import React, { useState, useEffect, useRef } from 'react';
import { Menu, Sparkles, AlertCircle } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { MessageItem } from './components/MessageItem';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import type { ChatMessage, ChatSession } from './types';
import { sendChatMessage, fetchHealth, fetchDocuments } from './services/api';

const SESSIONS_STORAGE_KEY = 'rag_chatbot_sessions';
const MESSAGES_STORAGE_PREFIX = 'rag_chatbot_messages_';

export const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed[0].id;
    }
    return null;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<string[]>([]);
  const [backendOnline, setBackendOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync sessions to localStorage
  useEffect(() => {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Load messages for active session
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }
    try {
      const saved = localStorage.getItem(`${MESSAGES_STORAGE_PREFIX}${activeSessionId}`);
      setMessages(saved ? JSON.parse(saved) : []);
    } catch {
      setMessages([]);
    }
  }, [activeSessionId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(`${MESSAGES_STORAGE_PREFIX}${activeSessionId}`, JSON.stringify(messages));
    }
  }, [messages, activeSessionId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Fetch initial system status & documents
  useEffect(() => {
    const checkSystem = async () => {
      const healthy = await fetchHealth();
      setBackendOnline(healthy);
      if (healthy) {
        const docs = await fetchDocuments();
        setDocuments(docs);
      }
    };

    checkSystem();
    const interval = setInterval(checkSystem, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNewChat = () => {
    const newSessionId = crypto.randomUUID();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Conversation',
      updatedAt: Date.now(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    localStorage.removeItem(`${MESSAGES_STORAGE_PREFIX}${id}`);
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (text: string) => {
    let currentSessionId = activeSessionId;

    // Create session if none exists
    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID();
      const newSession: ChatSession = {
        id: currentSessionId,
        title: text.slice(0, 36) + (text.length > 36 ? '...' : ''),
        updatedAt: Date.now(),
      };
      setSessions([newSession]);
      setActiveSessionId(currentSessionId);
    } else {
      // Update session title if it's the first message
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId && s.title === 'New Conversation'
            ? { ...s, title: text.slice(0, 36) + (text.length > 36 ? '...' : ''), updatedAt: Date.now() }
            : s
        )
      );
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      status: 'success',
    };

    const assistantPlaceholderId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await sendChatMessage(text, currentSessionId, abortController.signal);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantPlaceholderId
            ? {
                ...m,
                content: response.answer,
                sources: response.sources,
                status: 'success',
              }
            : m
        )
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantPlaceholderId
              ? {
                  ...m,
                  content: '_Generation stopped by user._',
                  status: 'success',
                }
              : m
          )
        );
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantPlaceholderId
              ? {
                  ...m,
                  status: 'error',
                  errorMessage,
                }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          setSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        documents={documents}
        backendOnline={backendOnline}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md px-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-slate-200">
                {sessions.find((s) => s.id === activeSessionId)?.title || 'Research RAG Chatbot'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {!backendOnline && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Backend Offline (port 8000)</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>MMR Retrieval (k=7)</span>
            </div>
          </div>
        </header>

        {/* Message View Area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {messages.length === 0 ? (
            <EmptyState onSelectPrompt={handleSendMessage} />
          ) : (
            <div className="w-full max-w-4xl mx-auto py-4 flex-1">
              {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onCancel={handleCancel}
          disabled={!backendOnline}
        />
      </div>
    </div>
  );
};

export default App;
