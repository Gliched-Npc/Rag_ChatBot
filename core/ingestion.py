import os
import time
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from core.config import settings

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
EMBEDDINGS_DIR = BASE_DIR / "embeddings"

def ingest_documents():
    documents = []

    if not DATA_DIR.exists():
        print(f"Directory not found: {DATA_DIR}")
        return

    for file in os.listdir(DATA_DIR):
        if file.endswith(".pdf"):
            print(f"Loading {file}...")
            loader = PyPDFLoader(str(DATA_DIR / file))
            documents.extend(loader.load())

    if not documents:
        print("No PDFs found in the data directory. Exiting.")
        return

    print(f"Total pages loaded: {len(documents)}")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_documents(documents)
    print(f"Total chunks created: {len(chunks)}")

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=settings.google_api_key,
    )

    print("Building FAISS index in batches to respect rate limits...")
    db = None
    batch_size = 90  # Keeps us safely under the 100/min limit
    
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        print(f"Processing batch {i // batch_size + 1} (chunks {i} to {min(i + len(batch), len(chunks))})...")
        
        if db is None:
            db = FAISS.from_documents(batch, embeddings)
        else:
            db.add_documents(batch)
            
        # If there are more chunks left, sleep to let the 1-minute quota reset
        if i + batch_size < len(chunks):
            print("Sleeping for 60 seconds to reset rate limit. Please wait...")
            time.sleep(60)
    
    EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)
    
    db.save_local(str(EMBEDDINGS_DIR))
    print(f"Done. Embeddings saved to {EMBEDDINGS_DIR}")

if __name__ == "__main__":
    ingest_documents()