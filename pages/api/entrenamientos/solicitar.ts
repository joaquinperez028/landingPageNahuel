import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Training from '@/models/Training';

/**
 * API endpoint para solicitar entrenamientos
 * POST /api/entrenamientos/solicitar
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectDB();
    console.log('🎓 Procesando solicitud de entrenamiento');

    const {
      tipo,
      nombre,
      email,
      telefono,
      experienciaTrading,
      objetivos,
      horariosDisponibles,
      consulta,
      fechaPreferida,
      nivelExperiencia
    } = req.body;

    // Validaciones básicas
    if (!tipo || !nombre || !email || !objetivos) {
      return res.status(400).json({ 
        error: 'Datos requeridos: tipo, nombre, email, objetivos' 
      });
    }

    if (!['TradingFundamentals', 'DowJones'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de entrenamiento inválido' });
    }

    // Buscar el servicio de entrenamiento correspondiente
    let training = await Training.findOne({ tipo });

    if (!training) {
      // Crear el servicio si no existe
      training = new Training({
        tipo,
        nombre: tipo === 'TradingFundamentals' 
          ? 'Trading Fundamentals' 
          : 'Dow Jones',
        descripcion: tipo === 'TradingFundamentals'
          ? 'Programa completo de trading desde cero hasta nivel intermedio'
          : 'Estrategias avanzadas y técnicas institucionales de trading',
        videoMux: tipo === 'TradingFundamentals'
          ? 'trading-fundamentals-intro'
          : 'dow-jones-intro',
        precio: tipo === 'TradingFundamentals' ? 497 : 997,
        duracion: tipo === 'TradingFundamentals' ? 40 : 60,
        metricas: {
          rentabilidad: tipo === 'TradingFundamentals' ? 120 : 180,
          estudiantesActivos: tipo === 'TradingFundamentals' ? 850 : 320,
          entrenamientosRealizados: tipo === 'TradingFundamentals' ? 150 : 80,
          satisfaccion: 4.8
        },
        contenido: {
          modulos: tipo === 'TradingFundamentals' ? 12 : 16,
          lecciones: tipo === 'TradingFundamentals' ? 85 : 120,
          certificacion: true,
          nivelAcceso: tipo === 'TradingFundamentals' ? 'Básico a Intermedio' : 'Avanzado'
        },
        solicitudes: [],
        horarios: [],
        activo: true
      });
    }

    // Agregar la nueva solicitud
    const nuevaSolicitud = {
      userId: '', // Se llenará cuando implemente autenticación completa
      nombre,
      email,
      telefono: telefono || '',
      experienciaTrading: experienciaTrading || '',
      objetivos,
      horariosDisponibles: horariosDisponibles || [],
      consulta: consulta || '',
      fecha: new Date(),
      estado: 'pendiente' as const,
      fechaEntrenamiento: fechaPreferida ? new Date(fechaPreferida) : undefined,
      nivelExperiencia: nivelExperiencia || 'principiante'
    };

    training.solicitudes.push(nuevaSolicitud);
    await training.save();

    console.log('✅ Solicitud de entrenamiento registrada:', email, 'Tipo:', tipo);

    // TODO: Aquí se integraría con servicio de email para notificar
    console.log('📧 Enviando notificación de nueva solicitud:', {
      tipo,
      nombre,
      email,
      experienciaTrading,
      nivelExperiencia
    });

    return res.status(200).json({
      success: true,
      message: 'Solicitud enviada exitosamente. Te contactaremos dentro de 24 horas para coordinar el inicio del entrenamiento.',
      data: {
        tipo,
        nombre,
        email,
        fechaSolicitud: nuevaSolicitud.fecha,
        precio: training.precio,
        duracion: training.duracion
      }
    });

  } catch (error) {
    console.error('❌ Error procesando solicitud de entrenamiento:', error);
    return res.status(500).json({ 
      error: 'Error procesando solicitud',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 