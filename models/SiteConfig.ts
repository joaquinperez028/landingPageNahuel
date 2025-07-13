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
  statistics: {
    visible: boolean;
    backgroundColor: string;
    textColor: string;
    stats: Array<{
      id: string;
      number: string;
      label: string;
      color: string;
      icon?: string;
      order: number;
    }>;
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
    youtubeId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    autoplay: { type: Boolean, default: true },
    muted: { type: Boolean, default: true },
    loop: { type: Boolean, default: true }
  },
  learningVideo: {
    youtubeId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    autoplay: { type: Boolean, default: false },
    muted: { type: Boolean, default: true },
    loop: { type: Boolean, default: false }
  },
  statistics: {
    visible: { type: Boolean, default: true },
    backgroundColor: { type: String, default: '#7c3aed' },
    textColor: { type: String, default: '#ffffff' },
    stats: [{
      id: { type: String, required: true },
      number: { type: String, required: true },
      label: { type: String, required: true },
      color: { type: String, default: '#ffffff' },
      icon: { type: String },
      order: { type: Number, default: 0 }
    }]
  },
  servicios: {
    orden: { type: Number, default: 1 },
    visible: { type: Boolean, default: true }
  },
  cursos: {
    orden: { type: Number, default: 2 },
    visible: { type: Boolean, default: true },
    destacados: [{ type: String }]
  }
}, {
  timestamps: true,
  collection: 'siteconfig'
});

export default mongoose.models.SiteConfig || mongoose.model<SiteConfigDocument>('SiteConfig', siteConfigSchema); 