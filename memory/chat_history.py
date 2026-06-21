from langchain_google_firestore import FirestoreChatMessageHistory


def get_chat_history(session_id: str) -> FirestoreChatMessageHistory:
    return FirestoreChatMessageHistory(
        session_id=session_id,
        collection="chat_history",
    )
