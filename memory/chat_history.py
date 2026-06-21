import os ,json , tempfile
from langchain_google_firestore import FirestoreChatMessageHistory


def get_chat_history(session_id: str) -> FirestoreChatMessageHistory:
    creds_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
    if creds_json:
        tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False)
        tmp.write(creds_json)
        tmp.close()
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = tmp.name
    return FirestoreChatMessageHistory(
        session_id=session_id,
        collection="chat_history",
    )
