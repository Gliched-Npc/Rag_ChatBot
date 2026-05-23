from core.retriever import get_rag_chain
from memory.chat_history import chat_memory

def main():
    print("Loading RAG Database & AI Models...")
    try:
        chain = get_rag_chain()
        print("Ready! Ask questions about your PDFs (type 'exit' to quit).\n")
    except Exception as e:
        print(f"Failed to load the RAG chain: {e}")
        return

    while True:
        query = input("You: ")
        
        if query.lower() in ['quit', 'exit', 'q']:
            print("Goodbye!")
            break
            
        if not query.strip():
            continue

        print("Thinking...")
        
        try:
            # Pass the current chat history into the chain
            response = chain.invoke({
                "input": query,
                "chat_history": chat_memory.messages
            })
            
            answer = response["answer"]
            print("\nAI:", answer)
            
            # Print sources
            print("\n[Sources Used]:")
            sources = set(doc.metadata.get('source', 'Unknown') for doc in response.get("context", []))
            for source in sources:
                print(f"- {source}")
                
            print("-" * 50 + "\n")
            
            # Save this interaction to memory for the next turn
            chat_memory.add_user_message(query)
            chat_memory.add_ai_message(answer)
            
        except Exception as e:
            print(f"\nAn error occurred: {e}\n")

if __name__ == "__main__":
    main()