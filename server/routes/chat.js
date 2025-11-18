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
// Replace your existing router.post('/assistant', ...) with this block
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

    // Helper to normalize/validate roles for Gemini (Gemini only accepts 'user' and 'model')
    const normalizeRole = (role) => {
      if (!role) return 'user';
      const r = String(role).toLowerCase();
      if (r === 'user') return 'user';
      // Map assistant/system/anything else to model
      if (r === 'assistant' || r === 'system' || r === 'model') return 'model';
      // default fallback
      return 'model';
    };

    // Build contents array expected by generateContent
    const contents = messages.map((m) => {
      const role = normalizeRole(m.role);
      return { role, parts: [{ text: String(m.content ?? '') }] };
    });

    // Prepend an instruction/identity as a model role (not 'system')
    contents.unshift({
      role: 'model',
      parts: [{ text: 'You are Akalya Assistant, a helpful AI tutor. Be friendly and concise.' }],
    });

    // Optional: debug log the payload being sent to Gemini (trim large texts)
    console.debug('[assistant] sending contents to Gemini:', contents.map(c => ({
      role: c.role,
      text: (c.parts && c.parts[0] && String(c.parts[0].text || '')).slice(0, 200)
    })));

    // Build request body
    const url = `https://generativelanguage.googleapis.com/v1/${GEMINI_MODEL.startsWith('models/') ? GEMINI_MODEL : `models/${GEMINI_MODEL}`}:generateContent`;
    const body = { contents, generationConfig: { temperature: 0.2, maxOutputTokens: 800 } };

    // helper: fetch with timeout and single retry (keeps your previous logic)
    const fetchWithTimeoutAndRetry = async (url, options, timeoutMs = 20000, retries = 1) => {
      const attempt = async () => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const resp = await fetch(url, { ...options, signal: controller.signal });
          clearTimeout(id);
          return resp;
        } catch (err) {
          clearTimeout(id);
          throw err;
        }
      };

      try {
        return await attempt();
      } catch (err) {
        if (retries > 0) {
          await new Promise((r) => setTimeout(r, 500));
          return await fetchWithTimeoutAndRetry(url, options, timeoutMs, retries - 1);
        }
        throw err;
      }
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify(body),
    };

    let apiResp;
    try {
      apiResp = await fetchWithTimeoutAndRetry(url, options, 20000, 1);
    } catch (err) {
      console.error('[chat assistant] network/gateway error calling Gemini:', err);
      return res.status(502).json({ error: 'Model is under training, we will let you know after integration' });
    }

    const providerText = await apiResp.text().catch(() => '');

    if (!apiResp.ok) {
      // Log provider response (server logs only)
      console.error('[Gemini] non-OK', apiResp.status, providerText.slice(0, 4000));
      // Return a sanitized error to client (avoid leaking providerBody)
      return res.status(502).json({ error: 'AI gateway error', providerStatus: apiResp.status, providerBody: providerText });
    }

    // parse provider JSON (best-effort)
    let providerJson;
    try {
      providerJson = JSON.parse(providerText || '{}');
    } catch (err) {
      providerJson = providerText;
    }

    // Extract assistant text from common shapes
    const assistantText =
      providerJson?.candidates?.[0]?.content?.parts?.[0]?.text ??
      providerJson?.output?.[0]?.content?.[0]?.text ??
      (typeof providerJson === 'string' ? providerJson : JSON.stringify(providerJson));

    const finalText = assistantText && String(assistantText).trim()
      ? String(assistantText)
      : "Sorry — the AI returned no usable response. Please try again later.";

    // Return normalized response (message + raw for logs or client debugging)
    return res.json({ message: finalText, raw: providerJson });
  } catch (error) {
    console.error('Chat assistant error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// DEV ONLY — preview how server will format contents for Gemini
// Add this block to server/routes/chat.js (then deploy/restart server)
router.post('/assistant/preview-contents', async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages must be an array' });

    const normalizeRole = (role) => {
      if (!role) return 'user';
      const r = String(role).toLowerCase();
      if (r === 'user') return 'user';
      if (r === 'assistant' || r === 'system' || r === 'model') return 'model';
      return 'model';
    };

    const contents = messages.map((m) => ({
      role: normalizeRole(m.role),
      parts: [{ text: String(m.content ?? '') }],
    }));

    // Prepend assistant identity/instruction
    contents.unshift({
      role: 'model',
      parts: [{ text: 'You are Akalya Assistant, a helpful AI tutor. Be friendly and concise.' }],
    });

    // For debugging only — remove or restrict later
    return res.json({ ok: true, contents });
  } catch (err) {
    console.error('preview-contents error:', err);
    return res.status(500).json({ error: String(err) });
  }
});



/* -------------------------
   Export router
   ------------------------- */
export default router;
