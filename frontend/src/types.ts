export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: string[];
  timestamp: string;
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: number;
}

export interface ChatApiResponse {
  answer: string;
  sources: string[];
  session_id: string;
}

export interface DocumentInfo {
  filename: string;
  displayName: string;
  description?: string;
}

