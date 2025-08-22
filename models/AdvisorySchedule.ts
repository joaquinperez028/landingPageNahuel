import mongoose, { Document, Schema } from 'mongoose';

export interface IAdvisorySchedule extends Document {
  date: Date; // Fecha específica (YYYY-MM-DD)
  time: string; // Hora en formato "HH:MM" (ej: "14:00")
  duration: number; // Duración en minutos (por defecto 60)
  isAvailable: boolean; // Si el horario está disponible para reservar
  isBooked: boolean; // Si ya fue reservado por un usuario
  createdAt: Date;
  updatedAt: Date;
}

const AdvisoryScheduleSchema: Schema = new Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // Formato HH:MM
  },
  duration: {
    type: Number,
    required: true,
    default: 60, // 1 hora por defecto
    min: 30,
    max: 180
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isBooked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índice compuesto para asegurar que cada fecha+hora sea única
AdvisoryScheduleSchema.index({ date: 1, time: 1 }, { unique: true });

// Índice para consultas por disponibilidad
AdvisoryScheduleSchema.index({ date: 1, isAvailable: 1, isBooked: 1 });

export default mongoose.models.AdvisorySchedule || mongoose.model<IAdvisorySchedule>('AdvisorySchedule', AdvisoryScheduleSchema); 