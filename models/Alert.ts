import mongoose, { Document, Schema } from 'mongoose';

export interface IAlert extends Document {
  tipo: 'TraderCall' | 'SmartMoney' | 'CashFlow';
  titulo: string;
  descripcion: string;
  datos: {
    rendimiento?: number;
    usuariosActivos?: number;
    alertasEnviadas?: number;
    precio?: number;
    objetivo?: number;
    stopLoss?: number;
    entrada?: number;
    instrumento?: string;
    mercado?: string;
  };
  fechaCreacion: Date;
  fechaVencimiento?: Date;
  activa: boolean;
  imagenes: string[];
  videoMux?: string;
  suscriptores: string[];
}

const AlertSchema: Schema = new Schema({
  tipo: {
    type: String,
    enum: ['TraderCall', 'SmartMoney', 'CashFlow'],
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  datos: {
    rendimiento: Number,
    usuariosActivos: Number,
    alertasEnviadas: Number,
    precio: Number,
    objetivo: Number,
    stopLoss: Number,
    entrada: Number,
    instrumento: String,
    mercado: String
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaVencimiento: Date,
  activa: {
    type: Boolean,
    default: true
  },
  imagenes: [String],
  videoMux: String,
  suscriptores: [String]
}, {
  timestamps: true
});

export default mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema); 