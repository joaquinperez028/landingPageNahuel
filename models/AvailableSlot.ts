import mongoose from 'mongoose';

export interface IAvailableSlot {
  _id?: string;
  date: string; // Formato DD/MM/YYYY
  time: string; // Formato HH:MM
  serviceType: 'ConsultorioFinanciero' | 'CuentaAsesorada' | 'TradingAvanzado' | 'TradingBasico';
  available: boolean;
  price: number;
  duration: number; // en minutos
  createdAt?: Date;
  updatedAt?: Date;
  // Información adicional para tracking
  reservedBy?: string; // Email del usuario que reservó
  reservedAt?: Date; // Fecha cuando se reservó
  bookingId?: string; // ID de la reserva asociada
}

const availableSlotSchema = new mongoose.Schema<IAvailableSlot>({
  date: {
    type: String,
    required: true,
    match: /^\d{2}\/\d{2}\/\d{4}$/, // Formato DD/MM/YYYY
    index: true
  },
  time: {
    type: String,
    required: true,
    match: /^\d{2}:\d{2}$/, // Formato HH:MM
    index: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['ConsultorioFinanciero', 'CuentaAsesorada', 'TradingAvanzado', 'TradingBasico'],
    index: true
  },
  available: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    default: 60
  },
  reservedBy: {
    type: String,
    required: false
  },
  reservedAt: {
    type: Date,
    required: false
  },
  bookingId: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Crear índices compuestos para búsquedas eficientes
availableSlotSchema.index({ date: 1, time: 1, serviceType: 1 }, { unique: true });
availableSlotSchema.index({ available: 1, serviceType: 1, date: 1 });
availableSlotSchema.index({ reservedBy: 1 });
availableSlotSchema.index({ createdAt: 1 });

// Método para formatear la fecha como Date object
availableSlotSchema.methods.toDateObject = function() {
  const [day, month, year] = this.date.split('/').map(Number);
  const [hour, minute] = this.time.split(':').map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  return date;
};

// Método para verificar si está en el futuro
availableSlotSchema.methods.isInFuture = function() {
  const slotDate = this.toDateObject();
  return slotDate > new Date();
};

// Método para reservar el horario
availableSlotSchema.methods.reserve = function(userEmail: string, bookingId: string) {
  this.available = false;
  this.reservedBy = userEmail;
  this.reservedAt = new Date();
  this.bookingId = bookingId;
  return this.save();
};

// Método para liberar el horario
availableSlotSchema.methods.release = function() {
  this.available = true;
  this.reservedBy = undefined;
  this.reservedAt = undefined;
  this.bookingId = undefined;
  return this.save();
};

// Método estático para obtener horarios disponibles
availableSlotSchema.statics.getAvailableSlots = function(
  serviceType: string, 
  fromDate?: string, 
  limit?: number
) {
  const query: any = {
    serviceType,
    available: true
  };
  
  if (fromDate) {
    // Convertir fecha para comparación
    const [day, month, year] = fromDate.split('/').map(Number);
    const dateForComparison = new Date(year, month - 1, day);
    const today = new Date();
    
    if (dateForComparison >= today) {
      query.date = { $gte: fromDate };
    }
  }
  
  return this.find(query)
    .sort({ date: 1, time: 1 })
    .limit(limit || 50);
};

// Método estático para reservar un horario
availableSlotSchema.statics.reserveSlot = async function(
  date: string, 
  time: string, 
  serviceType: string, 
  userEmail: string, 
  bookingId: string
) {
  const slot = await this.findOne({ date, time, serviceType, available: true });
  
  if (!slot) {
    throw new Error('Horario no disponible');
  }
  
  return slot.reserve(userEmail, bookingId);
};

export default mongoose.models.AvailableSlot || mongoose.model<IAvailableSlot>('AvailableSlot', availableSlotSchema); 