from fastapi import FastAPI
from app.routes import router

app = FastAPI(
    title="RAG Chatbot API",
    description="RAG-based chatbot that answers questions from PDF documents",
    version="1.0.0"
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)