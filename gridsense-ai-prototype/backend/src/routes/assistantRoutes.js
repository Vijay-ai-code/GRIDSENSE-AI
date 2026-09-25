// =============================================================================
// GridSense AI - AI Knowledge & Explanation (RAG) Routes
// Connects operator queries with domain retrieval and power systems literature.
// =============================================================================

const express = require('express');
const { z } = require('zod');
const { getDb } = require('../db');
const { validateBody } = require('../middleware/validate');
const { queryAssistant, getAvailableDocuments } = require('../services/ragClient');

const router = express.Router();

const querySchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters long').max(500),
  sessionId: z.string().optional().default('default_session')
});

// POST /api/assistant/query - Ask technical power-system question
router.post('/query', validateBody(querySchema), async (req, res, next) => {
  try {
    const db = getDb();
    const { query, sessionId } = req.validatedBody;

    // Persist user question
    await db.addChatMessage({
      sessionId,
      role: 'user',
      content: query
    });

    // Query RAG knowledge engine
    const ragResult = await queryAssistant(query);

    // Persist assistant explanation with source citations
    const assistantMessage = await db.addChatMessage({
      sessionId,
      role: 'assistant',
      content: ragResult.answer,
      sources: ragResult.sources
    });

    res.json({
      success: true,
      data: {
        answer: ragResult.answer,
        sources: ragResult.sources,
        mode: ragResult.mode,
        messageId: assistantMessage.id,
        sessionId
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/assistant/documents - List available knowledge base standards and documents
router.get('/documents', (req, res) => {
  const docs = getAvailableDocuments();
  res.json({
    success: true,
    count: docs.length,
    data: docs
  });
});

// GET /api/assistant/history - Retrieve conversation history for a session
router.get('/history', async (req, res, next) => {
  try {
    const db = getDb();
    const sessionId = req.query.sessionId || 'default_session';
    const history = await db.getChatHistory(sessionId);

    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
