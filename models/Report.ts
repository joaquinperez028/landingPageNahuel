import mongoose from 'mongoose';

export interface IReport {
  _id?: string;
  id?: string;
  title: string;
  type: 'informe' | 'video' | 'analisis';
  content: string;
  summary: string;
  videoMuxId?: string; // Para videos con MUX
  pdfUrl?: string; // Para PDFs
  imageUrl?: string; // Imagen de portada
  author: string;
  authorId: string; // ID del admin que lo creó
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  readTime?: number; // Tiempo estimado de lectura en minutos
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  views: number;
  isFeature: boolean; // Si es destacado
}

const reportSchema = new mongoose.Schema<IReport>({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  type: {
    type: String,
    enum: ['informe', 'video', 'analisis'],
    required: [true, 'El tipo es requerido'],
    default: 'informe'
  },
  content: {
    type: String,
    required: [true, 'El contenido es requerido']
  },
  summary: {
    type: String,
    required: [true, 'El resumen es requerido'],
    maxlength: [500, 'El resumen no puede exceder 500 caracteres']
  },
  videoMuxId: {
    type: String,
    sparse: true // Permite que sea único pero opcional
  },
  pdfUrl: {
    type: String,
    sparse: true
  },
  imageUrl: {
    type: String,
    sparse: true
  },
  author: {
    type: String,
    required: [true, 'El autor es requerido']
  },
  authorId: {
    type: String,
    required: [true, 'El ID del autor es requerido']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true
  }],
  readTime: {
    type: Number,
    min: 1,
    max: 180 // Máximo 3 horas
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  isFeature: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Índices para optimizar consultas
reportSchema.index({ status: 1, publishedAt: -1 });
reportSchema.index({ authorId: 1, createdAt: -1 });
reportSchema.index({ type: 1, status: 1 });
reportSchema.index({ tags: 1 });
reportSchema.index({ isFeature: 1, publishedAt: -1 });

// Middleware para establecer publishedAt cuando se publica
reportSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Método para calcular tiempo de lectura estimado basado en contenido
reportSchema.methods.calculateReadTime = function() {
  const wordsPerMinute = 200; // Promedio de lectura
  const wordCount = this.content.split(/\s+/).length;
  this.readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return this.readTime;
};

export default mongoose.models.Report || mongoose.model<IReport>('Report', reportSchema); 