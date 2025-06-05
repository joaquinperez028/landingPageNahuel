import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Advisory from '@/models/Advisory';

/**
 * API endpoint para solicitar asesorías
 * POST /api/asesorias/solicitar
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectDB();
    console.log('🏢 Procesando solicitud de asesoría');

    const {
      tipo,
      nombre,
      email,
      telefono,
      patrimonioActual,
      objetivos,
      experiencia,
      consulta,
      fechaPreferida,
      montoInversion,
      tipoCuenta
    } = req.body;

    // Validaciones básicas
    if (!tipo || !nombre || !email || !objetivos) {
      return res.status(400).json({ 
        error: 'Datos requeridos: tipo, nombre, email, objetivos' 
      });
    }

    if (!['ConsultorioFinanciero', 'CuentaAsesorada'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de asesoría inválido' });
    }

    // Buscar el servicio de asesoría correspondiente
    let advisory = await Advisory.findOne({ tipo });

    if (!advisory) {
      // Crear el servicio si no existe
      advisory = new Advisory({
        tipo,
        nombre: tipo === 'ConsultorioFinanciero' 
          ? 'Consultorio Financiero' 
          : 'Cuenta Asesorada',
        descripcion: tipo === 'ConsultorioFinanciero'
          ? 'Sesiones individuales de consultoría personalizada'
          : 'Gestión profesional de portafolio con reportes mensuales',
        videoMux: tipo === 'ConsultorioFinanciero'
          ? 'consultorio-financiero-intro'
          : 'cuenta-asesorada-intro',
        precio: tipo === 'ConsultorioFinanciero' ? 199 : 999,
        metricas: {
          rentabilidad: tipo === 'ConsultorioFinanciero' ? 120 : 150,
          clientesActivos: tipo === 'ConsultorioFinanciero' ? 50 : 25,
          consultasRealizadas: tipo === 'ConsultorioFinanciero' ? 200 : 100
        },
        solicitudes: [],
        disponibilidad: [],
        activo: true
      });
    }

    // Agregar la nueva solicitud
    const nuevaSolicitud = {
      userId: '', // Se llenará cuando implemente autenticación completa
      nombre,
      email,
      telefono: telefono || '',
      consulta: consulta || '',
      fecha: new Date(),
      estado: 'pendiente' as const,
      fechaCita: fechaPreferida ? new Date(fechaPreferida) : undefined,
      montoInversion: montoInversion ? parseFloat(montoInversion) : undefined,
      tipoCuenta: tipoCuenta || undefined
    };

    advisory.solicitudes.push(nuevaSolicitud);
    await advisory.save();

    console.log('✅ Solicitud de asesoría registrada:', email, 'Tipo:', tipo);

    // TODO: Aquí se integraría con servicio de email para notificar
    console.log('📧 Enviando notificación de nueva solicitud:', {
      tipo,
      nombre,
      email,
      patrimonioActual,
      experiencia
    });

    return res.status(200).json({
      success: true,
      message: 'Solicitud enviada exitosamente. Te contactaremos dentro de 24 horas.',
      data: {
        tipo,
        nombre,
        email,
        fechaSolicitud: nuevaSolicitud.fecha
      }
    });

  } catch (error) {
    console.error('❌ Error procesando solicitud de asesoría:', error);
    return res.status(500).json({ 
      error: 'Error procesando solicitud',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 