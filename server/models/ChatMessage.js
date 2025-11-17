// server/models/ChatMessage.js
import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'ChatConversation' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, {
  timestamps: true, // createdAt, updatedAt
});

export default mongoose.model('ChatMessage', ChatMessageSchema);
