import mongoose from 'mongoose';

export interface IUserSubscription extends mongoose.Document {
  userEmail: string;
  subscriptions: {
    alertas_trader: boolean;
    alertas_smart: boolean;
    alertas_cashflow: boolean;
    notificaciones_sistema: boolean;
    notificaciones_promociones: boolean;
    notificaciones_actualizaciones: boolean;
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    browserNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSubscriptionSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subscriptions: {
    alertas_trader: {
      type: Boolean,
      default: false
    },
    alertas_smart: {
      type: Boolean,
      default: false
    },
    alertas_cashflow: {
      type: Boolean,
      default: false
    },
    notificaciones_sistema: {
      type: Boolean,
      default: true
    },
    notificaciones_promociones: {
      type: Boolean,
      default: true
    },
    notificaciones_actualizaciones: {
      type: Boolean,
      default: true
    }
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    browserNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Índices
// UserSubscriptionSchema.index({ userEmail: 1 }); // ELIMINADO - ya existe con unique: true
UserSubscriptionSchema.index({ 
  'subscriptions.alertas_trader': 1,
  'subscriptions.alertas_smart': 1,
  'subscriptions.alertas_cashflow': 1
});

// Método para verificar si un usuario está suscrito a un tipo específico
UserSubscriptionSchema.methods.isSubscribedTo = function(type: string): boolean {
  switch (type) {
    case 'alertas_trader':
      return this.subscriptions.alertas_trader;
    case 'alertas_smart':
      return this.subscriptions.alertas_smart;
    case 'alertas_cashflow':
      return this.subscriptions.alertas_cashflow;
    case 'sistema':
      return this.subscriptions.notificaciones_sistema;
    case 'promocion':
      return this.subscriptions.notificaciones_promociones;
    case 'actualizacion':
      return this.subscriptions.notificaciones_actualizaciones;
    default:
      return false;
  }
};

// Método para obtener usuarios suscritos a un tipo específico
UserSubscriptionSchema.statics.getSubscribedUsers = async function(type: string) {
  const query: any = {};
  
  switch (type) {
    case 'alertas_trader':
      query['subscriptions.alertas_trader'] = true;
      break;
    case 'alertas_smart':
      query['subscriptions.alertas_smart'] = true;
      break;
    case 'alertas_cashflow':
      query['subscriptions.alertas_cashflow'] = true;
      break;
    case 'sistema':
      query['subscriptions.notificaciones_sistema'] = true;
      break;
    case 'promocion':
      query['subscriptions.notificaciones_promociones'] = true;
      break;
    case 'actualizacion':
      query['subscriptions.notificaciones_actualizaciones'] = true;
      break;
    default:
      return [];
  }
  
  return await this.find(query).select('userEmail preferences');
};

export default mongoose.models.UserSubscription || 
  mongoose.model<IUserSubscription>('UserSubscription', UserSubscriptionSchema); 