import mongoose, { Document, Schema } from 'mongoose';

export interface IBilling extends Document {
  userId: string;
  nombre: string;
  apellido: string;
  email: string;
  cuitCuil?: string;
  monto: number;
  moneda: 'ARS';
  metodoPago: 'stripe' | 'mobbex' | 'crypto';
  transactionId: string;
  servicio: string; // 'TraderCall', 'Entrenamiento Trading', etc.
  estado: 'pendiente' | 'completado' | 'fallido' | 'reembolsado';
  fechaPago: Date;
  fechaVencimiento?: Date;
  factura: {
    numero?: string;
    pdf?: string;
    emitida: boolean;
  };
  webhookData?: any;
}

const BillingSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cuitCuil: String,
  monto: {
    type: Number,
    required: true
  },
  moneda: {
    type: String,
    enum: ['ARS'],
    default: 'ARS'
  },
  metodoPago: {
    type: String,
    enum: ['stripe', 'mobbex', 'crypto'],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  servicio: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'completado', 'fallido', 'reembolsado'],
    default: 'pendiente'
  },
  fechaPago: {
    type: Date,
    default: Date.now
  },
  fechaVencimiento: Date,
  factura: {
    numero: String,
    pdf: String,
    emitida: {
      type: Boolean,
      default: false
    }
  },
  webhookData: Schema.Types.Mixed
}, {
  timestamps: true
});

export default mongoose.models.Billing || mongoose.model<IBilling>('Billing', BillingSchema); 