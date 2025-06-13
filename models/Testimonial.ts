import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  nombre: string;
  foto: string;
  comentario: string;
  resultado: string;
  rating: number;
  servicio: 'consultorio' | 'entrenamiento' | 'general';
  activo: boolean;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema: Schema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  foto: {
    type: String,
    required: true,
    trim: true
  },
  comentario: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  resultado: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  },
  servicio: {
    type: String,
    enum: ['consultorio', 'entrenamiento', 'general'],
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
TestimonialSchema.index({ servicio: 1, activo: 1, orden: 1 });

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema); 