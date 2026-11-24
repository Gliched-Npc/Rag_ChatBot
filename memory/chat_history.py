import os, json, tempfile
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_google_firestore import FirestoreChatMessageHistory

_in_memory_histories: dict[str, InMemoryChatMessageHistory] = {}

def get_chat_history(session_id: str):
    creds_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
    creds_file = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    
    if creds_json:
        try:
            tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False)
            tmp.write(creds_json)
            tmp.close()
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = tmp.name
            creds_file = tmp.name
        except Exception:
            pass

    if creds_file and os.path.exists(creds_file):
        try:
            return FirestoreChatMessageHistory(
                session_id=session_id,
                collection="chat_history",
            )
        except Exception as e:
            print(f"Firestore unavailable: {e}. Falling back to in-memory history.")

    # In-memory session store fallback (works with zero GCP credentials)
    if session_id not in _in_memory_histories:
        _in_memory_histories[session_id] = InMemoryChatMessageHistory()
    return _in_memory_histories[session_id]