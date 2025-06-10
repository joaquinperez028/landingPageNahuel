import mongoose from 'mongoose';

const ReportCommentSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userImage: {
    type: String,
    required: false
  },
  userType: {
    type: String,
    enum: ['normal', 'subscriber', 'premium', 'admin'],
    default: 'normal'
  },
  comment: {
    type: String,
    required: true,
    maxlength: 500 // Un poco más largo que los mensajes de chat
  },
  // Referencia a comentario que se está respondiendo (para anidados)
  replyTo: {
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReportComment'
    },
    userName: String,
    comment: String
  },
  // Estado del comentario
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted'],
    default: 'active'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
ReportCommentSchema.index({ reportId: 1, timestamp: -1 });
ReportCommentSchema.index({ status: 1 });

export default mongoose.models.ReportComment || mongoose.model('ReportComment', ReportCommentSchema); 