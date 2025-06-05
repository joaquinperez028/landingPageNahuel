import mongoose, { Document, Schema } from 'mongoose';

export interface ITraining extends Document {
  nombre: string;
  tipo: 'Trading' | 'Crypto' | 'Forex';
  descripcion: string;
  videoMux: string;
  metricas: {
    porcentajeAcierto?: number;
    numeroAlumnos?: number;
    calificacionPromedio?: number;
    roi?: number;
    numeroSenales?: number;
  };
  precio: number;
  programa: Array<{
    modulo: string;
    lecciones: string[];
  }>;
  testimonios: Array<{
    nombre: string;
    texto: string;
    foto?: string;
    calificacion: number;
  }>;
  suscriptores: string[];
  calendario: Date[];
  activo: boolean;
}

const TrainingSchema: Schema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['Trading', 'Crypto', 'Forex'],
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
  metricas: {
    porcentajeAcierto: Number,
    numeroAlumnos: Number,
    calificacionPromedio: Number,
    roi: Number,
    numeroSenales: Number
  },
  precio: {
    type: Number,
    required: true
  },
  programa: [{
    modulo: String,
    lecciones: [String]
  }],
  testimonios: [{
    nombre: String,
    texto: String,
    foto: String,
    calificacion: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  suscriptores: [String],
  calendario: [Date],
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Training || mongoose.model<ITraining>('Training', TrainingSchema); 