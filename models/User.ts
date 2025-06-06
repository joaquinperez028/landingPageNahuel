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
    numeroEnmascarado: string;
    tipo: string;
    expiracion: Date;
  }>;
  compras: Array<{
    itemId: string;
    tipo: string;
    fecha: Date;
    estado: string;
    monto: number;
  }>;
  suscripciones: Array<{
    servicio: 'TraderCall' | 'SmartMoney' | 'CashFlow';
    fechaInicio: Date;
    fechaVencimiento: Date;
    activa: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
  fullName?: string;
  cuitCuil?: string;
  educacionFinanciera?: string;
  brokerPreferencia?: string;
  avatarUrl?: string;
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
    numeroEnmascarado: String,
    tipo: String,
    expiracion: Date
  }],
  compras: [{
    itemId: String,
    tipo: String,
    fecha: Date,
    estado: String,
    monto: Number
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
  avatarUrl: {
    type: String,
    default: null,
  },
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

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 