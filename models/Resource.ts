import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  titulo: string;
  tipo: 'articulo' | 'video' | 'pdf' | 'plantilla';
  descripcion: string;
  contenido?: string; // Para artículos
  url?: string; // Para PDFs y plantillas descargables
  videoMux?: string; // Para videos
  imagenes: string[];
  categoria: 'Tutoriales' | 'Plantillas' | 'Noticias' | 'Guias';
  fechaSubida: Date;
  activo: boolean;
  descargas: number;
  vistas: number;
  tags: string[];
}

const ResourceSchema: Schema = new Schema({
  titulo: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['articulo', 'video', 'pdf', 'plantilla'],
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  contenido: String, // HTML content for articles
  url: String, // For downloadable resources
  videoMux: String, // MUX playback ID
  imagenes: [String],
  categoria: {
    type: String,
    enum: ['Tutoriales', 'Plantillas', 'Noticias', 'Guias'],
    required: true
  },
  fechaSubida: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  },
  descargas: {
    type: Number,
    default: 0
  },
  vistas: {
    type: Number,
    default: 0
  },
  tags: [String]
}, {
  timestamps: true
});

export default mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema); 