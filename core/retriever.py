from pathlib import Path
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_classic.chains import create_retrieval_chain, create_history_aware_retriever
from langchain_classic.chains.combine_documents import create_stuff_documents_chain

from langchain_core.prompts import ChatPromptTemplate, PromptTemplate, MessagesPlaceholder
from core.config import settings

BASE_DIR = Path(__file__).resolve().parent.parent
EMBEDDINGS_DIR = BASE_DIR / "embeddings"

def load_retriever():
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=settings.google_api_key
    )

    db = FAISS.load_local(
        str(EMBEDDINGS_DIR),
        embeddings,
        allow_dangerous_deserialization=True
    )

    return db.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 7, "fetch_k": 20}
    )

def get_rag_chain():
    retriever = load_retriever()

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", 
        google_api_key=settings.google_api_key,
        temperature=0.3
    )

    # 1. The Question Re-writer Prompt
    contextualize_q_system_prompt = """Given a chat history and the latest user question \
    which might reference context in the chat history, formulate a standalone question \
    which can be understood without the chat history. Do NOT answer the question, \
    just reformulate it if needed and otherwise return it as is."""
    
    contextualize_q_prompt = ChatPromptTemplate.from_messages([
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    
    # 2. The History-Aware Retriever
    history_aware_retriever = create_history_aware_retriever(
        llm, retriever, contextualize_q_prompt
    )

    # 3. The Main Answer Prompt
    qa_system_prompt = """You are a helpful, expert assistant. 
    
    If the user is just greeting you or making small talk (like "hi" or "how are you"), respond politely and conversationally without using the context.
    
    For all factual questions, use ONLY the provided context to answer.
    Be concise and precise. If the answer spans multiple documents, synthesize them.
    If you cannot find the answer in the context, say so explicitly.
    
    IMPORTANT: Write naturally and fluently. Do NOT include ugly file paths or inline citations (like "Source Document: C:\...") inside your sentences.

    Context:
    {context}"""
    
    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])

    document_prompt = PromptTemplate(
        input_variables=["page_content", "source"],
        template="Source Document: {source}\nContent: {page_content}\n---"
    )

    question_answer_chain = create_stuff_documents_chain(
        llm=llm, 
        prompt=qa_prompt,
        document_prompt=document_prompt
    )
    
    # 4. Tie it all together
    rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

    return rag_chain