import mongoose from 'mongoose';

export interface ICourseCard {
  _id?: string;
  titulo: string;
  descripcion: string;
  precio: string;
  urlDestino: string;
  imagen?: string;
  destacado: boolean;
  activo: boolean;
  orden: number;
  categoria?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const CourseCardSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  precio: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  urlDestino: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL destino debe ser una URL válida'
    }
  },
  imagen: {
    type: String,
    trim: true,
    default: null
  },
  destacado: {
    type: Boolean,
    default: false
  },
  activo: {
    type: Boolean,
    default: true
  },
  orden: {
    type: Number,
    default: 0
  },
  categoria: {
    type: String,
    trim: true,
    default: null
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' }
});

// Índices para mejorar el rendimiento
CourseCardSchema.index({ destacado: 1, activo: 1, orden: 1 });
CourseCardSchema.index({ activo: 1, orden: 1 });

export default mongoose.models.CourseCard || mongoose.model('CourseCard', CourseCardSchema); 