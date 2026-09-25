# =============================================================================
# GridSense AI - Python RAG Document Retriever
# Indexes power systems knowledge base and calculates semantic relevance.
# =============================================================================

import os
import re
from typing import List, Dict, Any

DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "documents"))

class PowerSystemsRetriever:
    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self._load_corpus()

    def _load_corpus(self):
        if not os.path.exists(DOCS_DIR):
            return

        for fname in sorted(os.listdir(DOCS_DIR)):
            if not fname.endswith(".md"):
                continue

            fpath = os.path.join(DOCS_DIR, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()

            doc_title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
            doc_title = doc_title_match.group(1).strip() if doc_title_match else fname

            # Split on markdown section headers
            sections = re.split(r"\n(?=##\s)", content)
            for idx, section in enumerate(sections):
                header_match = re.search(r"^##\s+(.+)$", section, re.MULTILINE)
                section_title = header_match.group(1).strip() if header_match else f"Section {idx+1}"
                clean_text = re.sub(r"^##\s+.+$", "", section, flags=re.MULTILINE).strip()

                if len(clean_text) > 40:
                    keywords = set(re.findall(r"\b[a-zA-Z]{4,}\b", (clean_text + " " + section_title).lower()))
                    self.chunks.append({
                        "id": f"{fname}#{idx}",
                        "filename": fname,
                        "document_title": doc_title,
                        "section_title": section_title,
                        "text": clean_text,
                        "keywords": keywords
                    })

    def query(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", query_text.lower()))
        if not query_words:
            return []

        scored = []
        for chunk in self.chunks:
            overlap = len(query_words.intersection(chunk["keywords"]))
            # Bonus points for title matching
            title_overlap = sum(1 for w in query_words if w in chunk["section_title"].lower() or w in chunk["document_title"].lower())
            total_score = (overlap * 2 + title_overlap * 3) / (len(query_words) * 3)
            
            if total_score > 0.08:
                scored.append({
                    "id": chunk["id"],
                    "document_title": chunk["document_title"],
                    "section_title": chunk["section_title"],
                    "snippet": chunk["text"][:220] + "...",
                    "full_text": chunk["text"],
                    "score": round(min(0.99, total_score), 3)
                })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]
