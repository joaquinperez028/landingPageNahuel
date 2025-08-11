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
  serviciosVideos: {
    alertas: {
      youtubeId: string;
      title: string;
      description: string;
      autoplay: boolean;
      muted: boolean;
      loop: boolean;
    };
    entrenamientos: {
      youtubeId: string;
      title: string;
      description: string;
      autoplay: boolean;
      muted: boolean;
      loop: boolean;
    };
    asesorias: {
      youtubeId: string;
      title: string;
      description: string;
      autoplay: boolean;
      muted: boolean;
      loop: boolean;
    };
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
  // Nueva sección para fechas de inicio de entrenamientos
  trainingStartDates: {
    swingTrading: {
      startDate: Date;
      startTime: string; // formato HH:mm
      enabled: boolean;
    };
    dowJones: {
      startDate: Date;
      startTime: string; // formato HH:mm
      enabled: boolean;
    };
  };
  alertExamples: {
    traderCall: Array<{
      id: string;
      title: string;
      description: string;
      chartImage?: string; // URL de la imagen del gráfico
      entryPrice: string;
      exitPrice: string;
      profit: string;
      profitPercentage: string;
      riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
      status: 'CERRADO TP1' | 'CERRADO TP1 Y SL' | 'CERRADO SL';
      country: string;
      ticker: string;
      order: number;
    }>;
    smartMoney: Array<{
      id: string;
      title: string;
      description: string;
      chartImage?: string; // URL de la imagen del gráfico
      entryPrice: string;
      exitPrice: string;
      profit: string;
      profitPercentage: string;
      riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
      status: 'CERRADO TP1' | 'CERRADO TP1 Y SL' | 'CERRADO SL';
      country: string;
      ticker: string;
      order: number;
    }>;
    cashFlow: Array<{
      id: string;
      title: string;
      description: string;
      chartImage?: string; // URL de la imagen del gráfico
      entryPrice: string;
      exitPrice: string;
      profit: string;
      profitPercentage: string;
      riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
      status: 'CERRADO TP1' | 'CERRADO TP1 Y SL' | 'CERRADO SL';
      country: string;
      ticker: string;
      order: number;
    }>;
  };
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    category: 'trader-call' | 'smart-money' | 'cash-flow' | 'general';
    order: number;
    visible: boolean;
  }>;
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
  serviciosVideos: {
    alertas: {
      youtubeId: { type: String, default: 'dQw4w9WgXcQ' },
      title: { type: String, default: 'Video de Alertas' },
      description: { type: String, default: 'Descubre cómo funcionan nuestras alertas de trading' },
      autoplay: { type: Boolean, default: false },
      muted: { type: Boolean, default: true },
      loop: { type: Boolean, default: false }
    },
    entrenamientos: {
      youtubeId: { type: String, default: 'dQw4w9WgXcQ' },
      title: { type: String, default: 'Video de Entrenamientos' },
      description: { type: String, default: 'Conoce nuestros programas de formación especializados' },
      autoplay: { type: Boolean, default: false },
      muted: { type: Boolean, default: true },
      loop: { type: Boolean, default: false }
    },
    asesorias: {
      youtubeId: { type: String, default: 'dQw4w9WgXcQ' },
      title: { type: String, default: 'Video de Asesorías' },
      description: { type: String, default: 'Asesorías personalizadas para optimizar tu portafolio' },
      autoplay: { type: Boolean, default: false },
      muted: { type: Boolean, default: true },
      loop: { type: Boolean, default: false }
    }
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
  },
  // Nueva sección para fechas de inicio de entrenamientos
  trainingStartDates: {
    swingTrading: {
      startDate: { type: Date, default: new Date('2024-10-11T13:00:00.000Z') },
      startTime: { type: String, default: '13:00' },
      enabled: { type: Boolean, default: true }
    },
    dowJones: {
      startDate: { type: Date, default: new Date('2024-11-01T14:00:00.000Z') },
      startTime: { type: String, default: '14:00' },
      enabled: { type: Boolean, default: true }
    }
  },
  alertExamples: {
    traderCall: [{
      id: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      chartImage: { type: String }, // URL de la imagen del gráfico
      entryPrice: { type: String, required: true },
      exitPrice: { type: String, required: true },
      profit: { type: String, required: true },
      profitPercentage: { type: String, required: true },
      riskLevel: { type: String, enum: ['BAJO', 'MEDIO', 'ALTO'], required: true },
      status: { type: String, enum: ['CERRADO TP1', 'CERRADO TP1 Y SL', 'CERRADO SL'], required: true },
      country: { type: String, required: true },
      ticker: { type: String, required: true },
      order: { type: Number, default: 0 }
    }],
    smartMoney: [{
      id: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      chartImage: { type: String }, // URL de la imagen del gráfico
      entryPrice: { type: String, required: true },
      exitPrice: { type: String, required: true },
      profit: { type: String, required: true },
      profitPercentage: { type: String, required: true },
      riskLevel: { type: String, enum: ['BAJO', 'MEDIO', 'ALTO'], required: true },
      status: { type: String, enum: ['CERRADO TP1', 'CERRADO TP1 Y SL', 'CERRADO SL'], required: true },
      country: { type: String, required: true },
      ticker: { type: String, required: true },
      order: { type: Number, default: 0 }
    }],
    cashFlow: [{
      id: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      chartImage: { type: String }, // URL de la imagen del gráfico
      entryPrice: { type: String, required: true },
      exitPrice: { type: String, required: true },
      profit: { type: String, required: true },
      profitPercentage: { type: String, required: true },
      riskLevel: { type: String, enum: ['BAJO', 'MEDIO', 'ALTO'], required: true },
      status: { type: String, enum: ['CERRADO TP1', 'CERRADO TP1 Y SL', 'CERRADO SL'], required: true },
      country: { type: String, required: true },
      ticker: { type: String, required: true },
      order: { type: Number, default: 0 }
    }]
  },
  faqs: [{
    id: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, enum: ['trader-call', 'smart-money', 'cash-flow', 'general'], required: true },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true }
  }]
}, {
  timestamps: true,
  collection: 'siteconfig'
});

export default mongoose.models.SiteConfig || mongoose.model<SiteConfigDocument>('SiteConfig', siteConfigSchema); 