import mongoose from 'mongoose';

// Esquema para imágenes de Cloudinary
const CloudinaryImageSchema = new mongoose.Schema({
  public_id: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  secure_url: {
    type: String,
    required: true
  },
  width: Number,
  height: Number,
  format: String,
  bytes: Number,
  caption: String,
  order: {
    type: Number,
    default: 0
  }
});

const ReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'video', 'mixed'],
    default: 'text'
  },
  muxAssetId: String,
  playbackId: String,
  thumbnailUrl: String,
  // Imagen de portada usando Cloudinary
  coverImage: CloudinaryImageSchema,
  // Imágenes adicionales usando Cloudinary
  images: [CloudinaryImageSchema],
  // Campos legacy de Mux (mantener para compatibilidad)
  imageMuxId: String,
  imageUrl: String,
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema); 