// server/routes/chat.js
import express from 'express';
// If your Node version doesn't have global fetch, uncomment the next line and install node-fetch
// import fetch from 'node-fetch';
import ChatConversation from '../models/ChatConversation.js';
import ChatMessage from '../models/ChatMessage.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
console.log('[chat router] loaded');

// Dev-only quick-check route (no auth). Remove after debug.
router.post('/assistant/noauth', (req, res) => {
  return res.json({ ok: true, note: 'assistant/noauth reachable' });
});

/* -------------------------
   Conversations
   ------------------------- */

// Get all conversations for user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await ChatConversation.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create conversation
router.post('/conversations', authenticate, async (req, res) => {
  try {
    const { title } = req.body || {};
    const conversation = new ChatConversation({
      userId: req.user._id,
      title: title || 'New Conversation',
    });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// convenience test route (no auth) - keep or remove
router.post('/conversations/test-noauth', async (req, res) => {
  const { title } = req.body || {};
  return res.status(201).json({ _id: 'mock-id-123', title: title || 'test' });
});

/* -------------------------
   Messages
   ------------------------- */

// Save message to a conversation
router.post('/messages', authenticate, async (req, res) => {
  try {
    const { conversationId, role, content } = req.body || {};
    if (!conversationId || !role || !content) {
      return res.status(400).json({ error: 'Missing required fields: conversationId, role, content' });
    }

    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (conversation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const message = new ChatMessage({
      conversationId,
      userId: req.user._id,
      role,
      content,
    });

    await message.save();
    return res.status(201).json(message);
  } catch (err) {
    console.error('Save message error:', err);
    return res.status(500).json({ error: 'Failed to save message' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    if (conversation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const messages = await ChatMessage.find({ conversationId }).sort({ createdAt: 1 });
    return res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/* -------------------------
   Assistant (calls Gemini)
   ------------------------- */

// server/routes/chat.js  (replace /assistant handler with the snippet below)
router.post('/assistant', authenticate, async (req, res) => {
  try {
    const { messages } = req.body || {};
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    let GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not set');
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid payload: messages must be an array' });
    }

    // ensure model path (no "models/" duplication)
    if (!GEMINI_MODEL.startsWith('models/')) GEMINI_MODEL = `models/${GEMINI_MODEL}`;

    // build contents array expected by generateContent
    const contents = messages.map(m => ({
      role: m.role || 'user',
      parts: [{ text: m.content ?? '' }]
    }));

    // you can prepend a system message if you want:
    contents.unshift({
      role: 'system',
      parts: [{ text: 'You are Akalya Assistant, a helpful AI tutor. Be friendly and concise.' }]
    });

    const url = `https://generativelanguage.googleapis.com/v1/${GEMINI_MODEL}:generateContent`;
    const body = {
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800
      }
    };

    const apiResp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify(body),
    });

    const providerText = await apiResp.text().catch(() => '');

    if (!apiResp.ok) {
      console.error('[Gemini] non-OK', apiResp.status, providerText.slice(0, 2000));
      return res.status(502).json({ error: 'AI gateway error', providerStatus: apiResp.status, providerBody: providerText });
    }

    const providerJson = JSON.parse(providerText || '{}');

    // best-effort extraction of model text
    const assistantText =
      providerJson?.candidates?.[0]?.content ??
      providerJson?.output?.[0]?.content?.[0]?.text ??
      (typeof providerJson === 'string' ? providerJson : JSON.stringify(providerJson));

    return res.json({ message: assistantText, raw: providerJson });
  } catch (error) {
    console.error('Chat assistant error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});


/* -------------------------
   Export router
   ------------------------- */
export default router;
