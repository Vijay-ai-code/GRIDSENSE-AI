# =============================================================================
# GridSense AI - Python RAG Assistant Service (FastAPI)
# Exposes context retrieval and explanation generation endpoints.
# =============================================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional

from app.retriever import PowerSystemsRetriever

app = FastAPI(
    title="GridSense RAG Assistant Service",
    version="0.1.0-prototype",
    description="Domain retrieval and explanation microservice for power systems and renewable grid stability."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

retriever = PowerSystemsRetriever()

class QueryRequest(BaseModel):
    query: str = Field(min_length=3, description="Technical power system inquiry")

@app.get("/health")
def health():
    return {
        "status": "ONLINE",
        "service": "GridSense RAG Assistant",
        "documents_indexed": len(retriever.chunks),
        "version": "0.1.0-prototype"
    }

@app.post("/query")
def query_rag(request: QueryRequest):
    try:
        chunks = retriever.query(request.query, top_k=3)
        if not chunks:
            return {
                "answer": "No direct matches found in the loaded technical grid standards. Please inquire about frequency inertia, reactive voltage control, the Duck curve, or BESS mitigation.",
                "sources": [],
                "mode": "rag_service_no_match"
            }

        primary = chunks[0]
        answer = f"According to {primary['document_title']} ({primary['section_title']}):\n\n{primary['full_text'].splitlines()[0]}"
        if len(chunks) > 1:
            secondary = chunks[1]
            answer += f"\n\nAdditional perspective from {secondary['document_title']}:\n{secondary['full_text'].splitlines()[0]}"

        sources = [
            {
                "id": c["id"],
                "documentTitle": c["document_title"],
                "sectionTitle": c["section_title"],
                "snippet": c["snippet"],
                "fullText": c["full_text"],
                "relevanceScore": int(c["score"] * 100)
            }
            for c in chunks
        ]

        return {
            "answer": answer,
            "sources": sources,
            "mode": "rag_service_active"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
