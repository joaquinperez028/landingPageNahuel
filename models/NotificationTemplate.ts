import mongoose from 'mongoose';

export interface INotificationTemplate extends mongoose.Document {
  name: string;
  description: string;
  type: 'novedad' | 'actualizacion' | 'sistema' | 'promocion' | 'alerta';
  priority: 'alta' | 'media' | 'baja';
  titleTemplate: string; // Plantilla del título con variables {variable}
  messageTemplate: string; // Plantilla del mensaje con variables {variable}
  icon: string;
  actionUrlTemplate?: string; // Plantilla para URL de acción
  actionTextTemplate?: string; // Plantilla para texto del botón
  targetUsers: 'todos' | 'suscriptores' | 'admin' | 'alertas_trader' | 'alertas_smart' | 'alertas_cashflow';
  variables: Array<{
    name: string;
    description: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    required: boolean;
    defaultValue?: any;
  }>;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxLength: 50
  },
  description: {
    type: String,
    required: true,
    maxLength: 200
  },
  type: {
    type: String,
    enum: ['novedad', 'actualizacion', 'sistema', 'promocion', 'alerta'],
    required: true,
    default: 'novedad'
  },
  priority: {
    type: String,
    enum: ['alta', 'media', 'baja'],
    required: true,
    default: 'media'
  },
  titleTemplate: {
    type: String,
    required: true,
    maxLength: 100
  },
  messageTemplate: {
    type: String,
    required: true,
    maxLength: 500
  },
  icon: {
    type: String,
    default: '📢'
  },
  actionUrlTemplate: {
    type: String,
    default: null
  },
  actionTextTemplate: {
    type: String,
    default: null
  },
  targetUsers: {
    type: String,
    enum: ['todos', 'suscriptores', 'admin', 'alertas_trader', 'alertas_smart', 'alertas_cashflow'],
    required: true,
    default: 'todos'
  },
  variables: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['string', 'number', 'date', 'boolean'],
      required: true
    },
    required: {
      type: Boolean,
      default: true
    },
    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Índices
// NotificationTemplateSchema.index({ name: 1 }); // ELIMINADO - ya existe con unique: true
NotificationTemplateSchema.index({ type: 1, isActive: 1 });
NotificationTemplateSchema.index({ createdBy: 1 });

// Método para renderizar plantilla con variables
NotificationTemplateSchema.methods.render = function(variables: Record<string, any>) {
  let title = this.titleTemplate;
  let message = this.messageTemplate;
  let actionUrl = this.actionUrlTemplate;
  let actionText = this.actionTextTemplate;

  // Reemplazar variables en las plantillas
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    title = title.replace(regex, String(value));
    message = message.replace(regex, String(value));
    if (actionUrl) actionUrl = actionUrl.replace(regex, String(value));
    if (actionText) actionText = actionText.replace(regex, String(value));
  }

  return {
    title,
    message,
    actionUrl,
    actionText,
    type: this.type,
    priority: this.priority,
    icon: this.icon,
    targetUsers: this.targetUsers
  };
};

export default mongoose.models.NotificationTemplate || 
  mongoose.model<INotificationTemplate>('NotificationTemplate', NotificationTemplateSchema); 