import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  _id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  status: 'ACTIVE' | 'CLOSED' | 'STOPPED';
  profit: number; // Porcentaje de ganancia/pérdida
  analysis: string;
  date: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  tipo: 'TraderCall' | 'SmartMoney' | 'CashFlow';
  exitPrice?: number;
  exitDate?: Date;
  exitReason?: 'TAKE_PROFIT' | 'STOP_LOSS' | 'MANUAL';
}

const AlertSchema: Schema = new Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  action: {
    type: String,
    required: true,
    enum: ['BUY', 'SELL']
  },
  entryPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  stopLoss: {
    type: Number,
    required: true,
    min: 0
  },
  takeProfit: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'CLOSED', 'STOPPED'],
    default: 'ACTIVE'
  },
  profit: {
    type: Number,
    default: 0
  },
  analysis: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    required: true,
    enum: ['TraderCall', 'SmartMoney', 'CashFlow'],
    default: 'TraderCall'
  },
  exitPrice: {
    type: Number,
    min: 0
  },
  exitDate: {
    type: Date
  },
  exitReason: {
    type: String,
    enum: ['TAKE_PROFIT', 'STOP_LOSS', 'MANUAL']
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
AlertSchema.index({ createdBy: 1, status: 1 });
AlertSchema.index({ symbol: 1, status: 1 });
AlertSchema.index({ tipo: 1, status: 1 });
AlertSchema.index({ date: -1 });

// Método para calcular el profit automáticamente
AlertSchema.methods.calculateProfit = function(this: IAlert) {
  const currentPrice = this.currentPrice;
  const entryPrice = this.entryPrice;
  
  if (this.action === 'BUY') {
    this.profit = ((currentPrice - entryPrice) / entryPrice) * 100;
  } else { // SELL
    this.profit = ((entryPrice - currentPrice) / entryPrice) * 100;
  }
  
  return this.profit;
};

// Middleware para calcular profit antes de guardar
AlertSchema.pre('save', function(this: IAlert, next) {
  if (this.isModified('currentPrice') || this.isModified('entryPrice')) {
    (this as any).calculateProfit();
  }
  next();
});

export default mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema); 