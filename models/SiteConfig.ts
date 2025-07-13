import mongoose, { Schema, Document } from 'mongoose';

interface SiteConfigDocument extends Document {
  _id: string;
  heroVideo: {
    youtubeId: string;
    title: string;
    description: string;
    thumbnail?: string;
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
  };
  learningVideo: {
    youtubeId: string;
    title: string;
    description: string;
    thumbnail?: string;
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
  };
  servicios: {
    orden: number;
    visible: boolean;
  };
  cursos: {
    orden: number;
    visible: boolean;
    destacados: string[]; // IDs de entrenamientos destacados
  };
  createdAt: Date;
  updatedAt: Date;
}

const siteConfigSchema = new Schema<SiteConfigDocument>({
  heroVideo: {
    youtubeId: { type: String, required: true, default: 'dQw4w9WgXcQ' },
    title: { type: String, required: true, default: 'Video de Presentación' },
    description: { type: String, default: 'Conoce más sobre nuestros servicios de trading' },
    thumbnail: { type: String },
    autoplay: { type: Boolean, default: true },
    muted: { type: Boolean, default: true },
    loop: { type: Boolean, default: true }
  },
  learningVideo: {
    youtubeId: { type: String, required: true, default: 'dQw4w9WgXcQ' },
    title: { type: String, required: true, default: 'Cursos de Inversión' },
    description: { type: String, default: 'Aprende a invertir desde cero con nuestros cursos especializados' },
    thumbnail: { type: String },
    autoplay: { type: Boolean, default: false },
    muted: { type: Boolean, default: true },
    loop: { type: Boolean, default: false }
  },
  servicios: {
    orden: { type: Number, default: 1 },
    visible: { type: Boolean, default: true }
  },
  cursos: {
    orden: { type: Number, default: 2 },
    visible: { type: Boolean, default: true },
    destacados: [{ type: Schema.Types.ObjectId, ref: 'Training' }]
  }
}, {
  timestamps: true
});

// Asegurar que solo existe una configuración
// siteConfigSchema.index({ _id: 1 }, { unique: true }); // ELIMINADO - redundante, MongoDB ya indexa _id automáticamente

export default mongoose.models.SiteConfig || mongoose.model<SiteConfigDocument>('SiteConfig', siteConfigSchema); 