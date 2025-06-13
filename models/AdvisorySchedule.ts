import mongoose, { Document, Schema } from 'mongoose';

export interface IAdvisorySchedule extends Document {
  dayOfWeek: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  hour: number; // 0-23
  minute: number; // 0-59
  duration: number; // en minutos (típicamente 60 para asesorías)
  type: 'ConsultorioFinanciero' | 'CuentaAsesorada'; // Tipo de asesoría
  price: number; // Precio de la asesoría
  maxBookingsPerDay?: number; // Máximo de reservas por día
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdvisoryScheduleSchema: Schema = new Schema({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6
  },
  hour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  minute: {
    type: Number,
    required: true,
    min: 0,
    max: 59,
    default: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 30,
    max: 180,
    default: 60 // 1 hora por defecto para asesorías
  },
  type: {
    type: String,
    enum: ['ConsultorioFinanciero', 'CuentaAsesorada'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  maxBookingsPerDay: {
    type: Number,
    min: 1,
    max: 10,
    default: 3 // Máximo 3 asesorías por día por defecto
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar duplicados
AdvisoryScheduleSchema.index({ dayOfWeek: 1, hour: 1, minute: 1, type: 1 }, { unique: true });

export default mongoose.models.AdvisorySchedule || mongoose.model<IAdvisorySchedule>('AdvisorySchedule', AdvisoryScheduleSchema); 