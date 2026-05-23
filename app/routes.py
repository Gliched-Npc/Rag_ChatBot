from fastapi import APIRouter
from pydantic import BaseModel
from core.retriever import get_rag_chain
from memory.chat_history import chat_memory

router = APIRouter()
chain = get_rag_chain()

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: list[str]

@router.get('/')
def home_page():
    return "Welcome to the RAG Chatbot API. Go to /docs for the interactive API documentation."


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    response = chain.invoke({
        "input": request.question,
        "chat_history": chat_memory.messages
    })

    answer = response["answer"]

    sources = list(set(
        doc.metadata.get("source", "Unknown")
        for doc in response.get("context", [])
    ))

    chat_memory.add_user_message(request.question)
    chat_memory.add_ai_message(answer)

    return ChatResponse(answer=answer, sources=sources)

@router.get("/health")
async def health():
    return {"status": "ok"}