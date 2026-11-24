import type { ChatApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function sendChatMessage(
  question: string,
  sessionId?: string,
  signal?: AbortSignal
): Promise<ChatApiResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      session_id: sessionId || '',
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown network error');
    throw new Error(`Server returned status ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function fetchHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchDocuments(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'GET',
    });
    if (response.ok) {
      const data = await response.json();
      return data.documents || [];
    }
    return [];
  } catch {
    return [];
  }
}
