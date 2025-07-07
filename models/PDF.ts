import mongoose, { Schema, Document } from 'mongoose';

interface PDFDocument extends Document {
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  data: Buffer; // Datos binarios del PDF
  uploadDate: Date;
  uploadedBy: string; // Email del usuario que subió el archivo
  metadata?: {
    pages?: number;
    version?: string;
    creator?: string;
    producer?: string;
  };
}

const pdfSchema = new Schema<PDFDocument>({
  fileName: { 
    type: String, 
    required: true,
    trim: true 
  },
  originalName: { 
    type: String, 
    required: true,
    trim: true 
  },
  mimeType: { 
    type: String, 
    required: true,
    default: 'application/pdf'
  },
  fileSize: { 
    type: Number, 
    required: true,
    min: 0 
  },
  data: { 
    type: Buffer, 
    required: true 
  },
  uploadDate: { 
    type: Date, 
    default: Date.now 
  },
  uploadedBy: { 
    type: String, 
    required: true,
    trim: true 
  },
  metadata: {
    pages: { type: Number },
    version: { type: String },
    creator: { type: String },
    producer: { type: String }
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
pdfSchema.index({ fileName: 1 });
pdfSchema.index({ uploadedBy: 1 });
pdfSchema.index({ uploadDate: -1 });

// Método virtual para obtener el tamaño en MB
pdfSchema.virtual('fileSizeMB').get(function() {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

// Método estático para limpiar PDFs huérfanos (no referenciados en lecciones)
pdfSchema.statics.cleanOrphanedPDFs = async function() {
  const Lesson = mongoose.model('Lesson');
  
  // Obtener todos los IDs de PDFs referenciados en lecciones
  const referencedPDFs = await Lesson.aggregate([
    { $unwind: '$contenido' },
    { $match: { 'contenido.content.databasePdf.pdfId': { $exists: true } } },
    { $group: { _id: '$contenido.content.databasePdf.pdfId' } }
  ]);
  
  const referencedIds = referencedPDFs.map(doc => doc._id);
  
  // Eliminar PDFs no referenciados
  const result = await this.deleteMany({
    _id: { $nin: referencedIds }
  });
  
  return result.deletedCount;
};

const PDF = mongoose.models.PDF || mongoose.model<PDFDocument>('PDF', pdfSchema);

export default PDF;
export type { PDFDocument }; 