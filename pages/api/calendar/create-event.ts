import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { createTrainingEvent, createAdvisoryEvent } from '@/lib/googleCalendar';
import { z } from 'zod';

// Schema de validación para la creación de eventos
const createEventSchema = z.object({
  type: z.enum(['training', 'advisory']),
  name: z.string().min(1),
  startDate: z.string().datetime(),
  duration: z.number().min(15).max(480) // Entre 15 minutos y 8 horas
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Validar datos de entrada
    const validationResult = createEventSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.errors 
      });
    }

    const { type, name, startDate, duration } = validationResult.data;
    const userEmail = session.user.email;

    // Crear evento según el tipo
    let event;
    if (type === 'training') {
      event = await createTrainingEvent(
        userEmail,
        name,
        new Date(startDate),
        duration
      );
    } else {
      event = await createAdvisoryEvent(
        userEmail,
        name,
        new Date(startDate),
        duration
      );
    }

    return res.status(200).json({ 
      success: true,
      event 
    });

  } catch (error) {
    console.error('Error al crear evento:', error);
    return res.status(500).json({ 
      error: 'Error al crear evento en el calendario',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 