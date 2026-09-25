# RAG service integration point

Planned pipeline:

Documents -> loading -> chunking -> embeddings -> vector retrieval -> relevant context -> LLM -> answer

LangChain can be used to orchestrate the workflow. This prototype intentionally does not pretend a live LLM or retrieval index exists yet.

Suggested future endpoints:
- POST /query
- POST /documents/index
- GET /sources/:id
