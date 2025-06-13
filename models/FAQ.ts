import mongoose, { Document, Schema } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  categoria: 'consultorio' | 'entrenamiento' | 'general' | 'pagos' | 'tecnico';
  activo: boolean;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema: Schema = new Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  answer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  categoria: {
    type: String,
    enum: ['consultorio', 'entrenamiento', 'general', 'pagos', 'tecnico'],
    default: 'general',
    index: true
  },
  activo: {
    type: Boolean,
    default: true,
    index: true
  },
  orden: {
    type: Number,
    default: 0,
    index: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
FAQSchema.index({ categoria: 1, activo: 1, orden: 1 });

export default mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema); 