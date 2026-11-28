---
title: Rag Chat Bot
emoji: 🚀
colorFrom: indigo
colorTo: pink
sdk: docker
pinned: false
---

# RAG Research Chatbot

An end-to-end Retrieval-Augmented Generation (RAG) assistant for querying machine learning research papers. Powered by **Google Gemini 2.5 Flash**, **LangChain**, **FAISS Vector Store**, and a modern **React 19 + TypeScript + Tailwind CSS** frontend.

---

## Architecture Overview

```
Frontend (React 19 + Vite + Tailwind CSS) [Port 3000]
      │
      ▼  (HTTP POST /chat, GET /documents, GET /health)
FastAPI Backend [Port 8000]
      ├─► FAISS Vector Store (Google GenAI Embeddings)
      ├─► Gemini 2.5 Flash LLM (Contextualized History-Aware Q&A)
      └─► Chat Memory (Firestore with automatic In-Memory fallback)
```

---

## Prerequisites
- **Python 3.10+** (tested on 3.11)
- **Node.js 18+** and **npm**
- **Google Gemini API Key** (Free from [Google AI Studio](https://aistudio.google.com/apikey))

---

## Quickstart Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Gliched-Npc/Rag_ChatBot
cd Rag_Chatbot
```

### 2. Configure Environment Variables
Copy the example environment file and add your Gemini API key:
```bash
cp .env.example .env
```
Open `.env` and set:
```ini
GOOGLE_API_KEY=your_gemini_api_key_here
```
> **Note on Firestore:** Google Cloud Firestore is completely optional. If credentials are not provided or expired, the system automatically falls back to local in-memory session history without errors.

---

### 3. Backend Setup & Run

Create a virtual environment and install Python dependencies:

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
*The FastAPI backend will start at `http://localhost:8000` (API docs at `http://localhost:8000/docs`).*

---

### 4. Frontend Setup & Run

In a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run at `http://localhost:3000` with an automatic reverse proxy to the backend on port 8000.*

---

## Key Features

- **Document Grounding**: Synthesizes answers strictly from indexed research paper chunks.
- **Source Attribution**: Highlights clickable badges citing exact source PDFs (e.g. `1706.03762v7.pdf`).
- **Session Management**: Multi-conversation support persisted locally in `localStorage` and synced with backend session memory.
- **Robust Memory Fallback**: Automatically operates in zero-credential in-memory mode when GCP Firestore is unavailable.
- **Markdown & LaTeX Support**: Full support for code snippets, lists, tables, and formatted research notes.

---

## Ingesting New PDF Documents

To index your own PDFs:
1. Place PDF files in the `data/` directory.
2. Run the ingestion pipeline:
   ```bash
   python -m core.ingestion
   ```
This chunks the documents and updates the local FAISS index in `embeddings/`.
