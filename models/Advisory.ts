import mongoose, { Document, Schema } from 'mongoose';

export interface IAdvisory extends Document {
  tipo: 'ConsultorioFinanciero' | 'CuentaAsesorada';
  nombre: string;
  descripcion: string;
  videoMux: string;
  precio?: number;
  metricas?: {
    rentabilidad?: number;
    clientesActivos?: number;
    consultasRealizadas?: number;
  };
  solicitudes: Array<{
    userId: string;
    nombre: string;
    email: string;
    telefono?: string;
    consulta: string;
    fecha: Date;
    estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
    fechaCita?: Date;
    montoInversion?: number;
    tipoCuenta?: 'Basica' | 'Premium';
  }>;
  disponibilidad: Array<{
    fecha: Date;
    hora: string;
    disponible: boolean;
  }>;
  activo: boolean;
}

const AdvisorySchema: Schema = new Schema({
  tipo: {
    type: String,
    enum: ['ConsultorioFinanciero', 'CuentaAsesorada'],
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  videoMux: {
    type: String,
    required: true
  },
  precio: Number,
  metricas: {
    rentabilidad: Number,
    clientesActivos: Number,
    consultasRealizadas: Number
  },
  solicitudes: [{
    userId: String,
    nombre: String,
    email: String,
    telefono: String,
    consulta: String,
    fecha: {
      type: Date,
      default: Date.now
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'completada', 'cancelada'],
      default: 'pendiente'
    },
    fechaCita: Date,
    montoInversion: Number,
    tipoCuenta: {
      type: String,
      enum: ['Basica', 'Premium']
    }
  }],
  disponibilidad: [{
    fecha: Date,
    hora: String,
    disponible: {
      type: Boolean,
      default: true
    }
  }],
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Advisory || mongoose.model<IAdvisory>('Advisory', AdvisorySchema); 