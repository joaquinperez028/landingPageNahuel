import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  name: string;
  email: string;
  picture?: string;
  role: 'normal' | 'suscriptor' | 'admin';
  phone?: string;
  address?: string;
  tarjetas: Array<{
    numero: string;
    nombre: string;
    vencimiento: string;
    tipo: string;
  }>;
  compras: Array<{
    fecha: Date;
    monto: number;
    concepto: string;
    estado: 'pendiente' | 'completada' | 'cancelada';
  }>;
  suscripciones: Array<{
    servicio: 'TraderCall' | 'SmartMoney' | 'CashFlow';
    fechaInicio: Date;
    fechaVencimiento: Date;
    activa: boolean;
  }>;
  subscriptions: Array<{
    tipo: 'TraderCall' | 'SmartMoney' | 'CashFlow';
    precio: number;
    fechaInicio: Date;
    fechaFin?: Date;
    activa: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive?: boolean;
  fullName?: string;
  cuitCuil?: string;
  educacionFinanciera?: string;
  brokerPreferencia?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleTokenExpiry?: number;
}

const UserSchema: Schema = new Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  picture: {
    type: String
  },
  role: {
    type: String,
    enum: ['normal', 'suscriptor', 'admin'],
    default: 'normal'
  },
  phone: String,
  address: String,
  tarjetas: [{
    numero: String,
    nombre: String,
    vencimiento: String,
    tipo: String
  }],
  compras: [{
    fecha: Date,
    monto: Number,
    concepto: String,
    estado: {
      type: String,
      enum: ['pendiente', 'completada', 'cancelada'],
      default: 'pendiente'
    }
  }],
  suscripciones: [{
    servicio: {
      type: String,
      enum: ['TraderCall', 'SmartMoney', 'CashFlow']
    },
    fechaInicio: Date,
    fechaVencimiento: Date,
    activa: {
      type: Boolean,
      default: true
    }
  }],
  subscriptions: [{
    tipo: {
      type: String,
      enum: ['TraderCall', 'SmartMoney', 'CashFlow'],
      required: true
    },
    precio: {
      type: Number,
      required: true,
      default: 99
    },
    fechaInicio: {
      type: Date,
      required: true,
      default: Date.now
    },
    fechaFin: {
      type: Date
    },
    activa: {
      type: Boolean,
      default: true
    }
  }],
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  fullName: {
    type: String,
    default: null,
  },
  cuitCuil: {
    type: String,
    default: null,
  },
  educacionFinanciera: {
    type: String,
    enum: ['principiante', 'intermedio', 'avanzado', 'experto'],
    default: null,
  },
  brokerPreferencia: {
    type: String,
    enum: ['bull-market', 'iol', 'portfolio-personal', 'cocos-capital', 'eco-valores', 'otros'],
    default: null,
  },
  googleAccessToken: { type: String },
  googleRefreshToken: { type: String },
  googleTokenExpiry: { type: Number }
}, {
  timestamps: true
});

// Middleware para actualizar updatedAt antes de guardar
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

UserSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Índices para optimizar búsquedas (sin duplicar los unique: true)
UserSchema.index({ role: 1 });
UserSchema.index({ 'subscriptions.tipo': 1, 'subscriptions.activa': 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLogin: -1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 