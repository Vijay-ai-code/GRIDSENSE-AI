// =============================================================================
// GridSense AI - RAG Knowledge Client Service
// Implements the RAG architecture with grounded power-system document retrieval.
// =============================================================================

const fs = require('fs');
const path = require('path');

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://127.0.0.1:8001';
const DOCS_DIR = path.resolve(__dirname, '../../../rag-service/documents');

// In-memory cache of chunked power systems knowledge documents
let documentChunks = [];

function loadDocumentCorpus() {
  try {
    if (!fs.existsSync(DOCS_DIR)) {
      console.warn(`[RAG] Documents directory not found at ${DOCS_DIR}.`);
      return;
    }

    const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'));
    documentChunks = [];

    files.forEach(filename => {
      const filepath = path.join(DOCS_DIR, filename);
      const content = fs.readFileSync(filepath, 'utf8');
      
      // Parse markdown sections based on headers
      const sections = content.split(/\n(?=##\s)/g);
      const docTitleMatch = content.match(/^#\s+(.+)$/m);
      const docTitle = docTitleMatch ? docTitleMatch[1].trim() : filename;

      sections.forEach((section, index) => {
        const headerMatch = section.match(/^##\s+(.+)$/m);
        const sectionTitle = headerMatch ? headerMatch[1].trim() : `Overview Part ${index + 1}`;
        const cleanText = section.replace(/^##\s+.+$/m, '').trim();

        if (cleanText.length > 50) {
          documentChunks.push({
            id: `${filename}#${index}`,
            filename,
            documentTitle: docTitle,
            sectionTitle,
            text: cleanText,
            keywords: extractKeywords(cleanText + ' ' + sectionTitle + ' ' + docTitle)
          });
        }
      });
    });

    console.log(`[RAG] Indexed ${documentChunks.length} document chunks from ${files.length} power system standards.`);
  } catch (err) {
    console.warn('[RAG] Error indexing knowledge documents:', err.message);
  }
}

function extractKeywords(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);
}

/**
 * Calculates keyword relevance match score between query and document chunk.
 */
function retrieveContext(query, topK = 3) {
  if (documentChunks.length === 0) {
    loadDocumentCorpus();
  }

  const queryWords = extractKeywords(query);
  if (queryWords.length === 0) return [];

  const scored = documentChunks.map(chunk => {
    let matches = 0;
    queryWords.forEach(word => {
      if (chunk.keywords.includes(word)) matches += 2;
      if (chunk.sectionTitle.toLowerCase().includes(word)) matches += 3;
      if (chunk.documentTitle.toLowerCase().includes(word)) matches += 2;
    });

    const score = Number((matches / (queryWords.length * 4)).toFixed(3));
    return { ...chunk, score: Math.min(0.99, score) };
  });

  return scored
    .filter(c => c.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Synthesizes grounded explanation using the retrieved context.
 */
function synthesizeResponse(query, contextChunks) {
  if (contextChunks.length === 0) {
    return {
      answer: "I couldn't find specific passages in the loaded power-system knowledge base addressing this exact question. GridSense AI RAG includes documentation on frequency stability, rotational inertia, voltage stability, reactive power, the Duck Curve, and BESS mitigation.",
      sources: []
    };
  }

  const primary = contextChunks[0];
  const secondary = contextChunks[1];

  let answerText = `Based on retrieved grid engineering literature (${primary.documentTitle} - ${primary.sectionTitle}):\n\n`;
  answerText += primary.text.split('\n\n')[0] + '\n\n';

  if (secondary && secondary.score > 0.25) {
    answerText += `Furthermore, according to ${secondary.documentTitle}:\n`;
    answerText += secondary.text.split('\n\n')[0];
  }

  const sources = contextChunks.map(c => ({
    id: c.id,
    documentTitle: c.documentTitle,
    sectionTitle: c.sectionTitle,
    snippet: c.text.slice(0, 200) + '...',
    fullText: c.text,
    relevanceScore: Math.round(c.score * 100)
  }));

  return {
    answer: answerText,
    sources
  };
}

async function queryAssistant(userQuery) {
  // 1. Try external Python LangChain / RAG service if active
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${RAG_SERVICE_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userQuery }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        answer: data.answer,
        sources: data.sources || [],
        mode: 'external_rag_service'
      };
    }
  } catch (err) {
    // Fall back to local grounded knowledge retriever
  }

  // 2. Grounded local document retrieval
  const chunks = retrieveContext(userQuery, 3);
  const result = synthesizeResponse(userQuery, chunks);

  return {
    answer: result.answer,
    sources: result.sources,
    mode: 'grounded_rag_prototype'
  };
}

function getAvailableDocuments() {
  if (documentChunks.length === 0) loadDocumentCorpus();
  
  const uniqueDocs = {};
  documentChunks.forEach(c => {
    if (!uniqueDocs[c.filename]) {
      uniqueDocs[c.filename] = {
        filename: c.filename,
        title: c.documentTitle,
        sectionsCount: 0,
        sections: []
      };
    }
    uniqueDocs[c.filename].sectionsCount++;
    uniqueDocs[c.filename].sections.push(c.sectionTitle);
  });

  return Object.values(uniqueDocs);
}

// Initial index on load
loadDocumentCorpus();

module.exports = {
  queryAssistant,
  getAvailableDocuments,
  retrieveContext
};
