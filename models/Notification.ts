import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
  title: string;
  message: string;
  type: 'novedad' | 'actualizacion' | 'sistema' | 'promocion';
  priority: 'alta' | 'media' | 'baja';
  targetUsers: 'todos' | 'suscriptores' | 'admin';
  isActive: boolean;
  createdBy: string; // Email del admin que creó la notificación
  createdAt: Date;
  expiresAt?: Date;
  icon?: string; // Emoji o ícono para la notificación
  actionUrl?: string; // URL a la que redirige si es necesario
  actionText?: string; // Texto del botón de acción
}

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100
  },
  message: {
    type: String,
    required: true,
    maxLength: 500
  },
  type: {
    type: String,
    enum: ['novedad', 'actualizacion', 'sistema', 'promocion'],
    required: true,
    default: 'novedad'
  },
  priority: {
    type: String,
    enum: ['alta', 'media', 'baja'],
    required: true,
    default: 'media'
  },
  targetUsers: {
    type: String,
    enum: ['todos', 'suscriptores', 'admin'],
    required: true,
    default: 'todos'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  icon: {
    type: String,
    default: '📢'
  },
  actionUrl: {
    type: String,
    default: null
  },
  actionText: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Índice para mejorar consultas
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ isActive: 1 });
NotificationSchema.index({ targetUsers: 1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema); 