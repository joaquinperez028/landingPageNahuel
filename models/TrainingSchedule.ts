import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainingSchedule extends Document {
  dayOfWeek: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  hour: number; // 0-23
  minute: number; // 0-59
  duration: number; // en minutos
  type?: string; // opcional, para distinguir tipos de entrenamientos
  activo: boolean;
}

const TrainingScheduleSchema: Schema = new Schema({
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
    max: 59
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  type: {
    type: String,
    default: 'intensivo'
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.TrainingSchedule || mongoose.model<ITrainingSchedule>('TrainingSchedule', TrainingScheduleSchema); 