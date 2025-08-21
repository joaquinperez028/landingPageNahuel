import mongoose, { Schema, Document } from 'mongoose';

export interface PricingDocument extends Document {
  _id: string;
  
  // Precios de Alertas
  alertas: {
    traderCall: {
      monthly: number;
      yearly: number;
      currency: string;
      description: string;
    };
    smartMoney: {
      monthly: number;
      yearly: number;
      currency: string;
      description: string;
    };
  };
  
  // Precios de Entrenamientos
  entrenamientos: {
    swingTrading: {
      price: number;
      currency: string;
      description: string;
      originalPrice?: number;
      discount?: number;
    };
    dayTrading: {
      price: number;
      currency: string;
      description: string;
      originalPrice?: number;
      discount?: number;
    };
    advanced: {
      price: number;
      currency: string;
      description: string;
      originalPrice?: number;
      discount?: number;
    };
  };
  
  // Precios de Asesorías
  asesorias: {
    consultorioFinanciero: {
      price: number;
      currency: string;
      description: string;
      duration: string;
      originalPrice?: number;
      discount?: number;
    };
  };
  
  // Configuración general
  currency: string;
  showDiscounts: boolean;
  lastUpdated: Date;
  updatedBy: string;
}

const PricingSchema = new Schema({
  alertas: {
    traderCall: {
      monthly: { type: Number, required: true, default: 29.99 },
      yearly: { type: Number, required: true, default: 299.99 },
      currency: { type: String, required: true, default: 'USD' },
      description: { type: String, default: 'Alertas de Trader Call' }
    },
    smartMoney: {
      monthly: { type: Number, required: true, default: 39.99 },
      yearly: { type: Number, required: true, default: 399.99 },
      currency: { type: String, required: true, default: 'USD' },
      description: { type: String, default: 'Alertas de Smart Money' }
    }
  },
  
  entrenamientos: {
    swingTrading: {
      price: { type: Number, required: true, default: 199.99 },
      currency: { type: String, required: true, default: 'USD' },
      description: { type: String, default: 'Entrenamiento de Swing Trading' },
      originalPrice: { type: Number },
      discount: { type: Number, min: 0, max: 100 }
    },
    dayTrading: {
      price: { type: Number, required: true, default: 299.99 },
      currency: { type: String, required: true, default: 'USD' },
      description: { type: String, default: 'Entrenamiento de Day Trading' },
      originalPrice: { type: Number },
      discount: { type: Number, min: 0, max: 100 }
    },
    advanced: {
      price: { type: Number, required: true, default: 399.99 },
      currency: { type: String, required: true, default: 'USD' },
      description: { type: String, default: 'Entrenamiento Avanzado' },
      originalPrice: { type: Number },
      discount: { type: Number, min: 0, max: 100 }
    }
  },
  
  asesorias: {
    consultorioFinanciero: {
      price: { type: Number, required: true, default: 199.99 },
      currency: { type: String, required: true, default: 'USD' },
      description: { type: String, default: 'Consultorio Financiero Individual' },
      duration: { type: String, default: '60 minutos' },
      originalPrice: { type: Number },
      discount: { type: Number, min: 0, max: 100 }
    }
  },
  
  currency: { type: String, required: true, default: 'USD' },
  showDiscounts: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: String, required: true }
}, {
  timestamps: true,
  collection: 'pricing'
});

// Índices para optimizar consultas
PricingSchema.index({ currency: 1 });
PricingSchema.index({ lastUpdated: -1 });

export default mongoose.models.Pricing || mongoose.model<PricingDocument>('Pricing', PricingSchema); 