import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['normal', 'subscriber', 'premium', 'admin'],
    default: 'normal'
  },
  message: {
    type: String,
    required: true,
    maxlength: 200
  },
  chatType: {
    type: String,
    required: true,
    enum: ['trader-call', 'smart-money', 'cash-flow']
  },
  type: {
    type: String,
    enum: ['normal', 'highlight'],
    default: 'normal'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índice para optimizar consultas por tipo de chat y fecha
ChatMessageSchema.index({ chatType: 1, timestamp: -1 });

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema); 