import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
import { z } from 'zod';

// Schema de validación para testimonios
const testimonialSchema = z.object({
  nombre: z.string().min(1).max(100),
  foto: z.string().url(),
  comentario: z.string().min(1).max(500),
  resultado: z.string().min(1).max(100),
  rating: z.number().min(1).max(5).default(5),
  servicio: z.enum(['consultorio', 'entrenamiento', 'general']).default('general'),
  activo: z.boolean().default(true),
  orden: z.number().default(0)
});

/**
 * API para gestionar testimonios
 * GET: Obtener testimonios (público)
 * POST: Crear testimonio (solo admin)
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { servicio } = req.query;
      
      console.log('📝 Obteniendo testimonios, servicio:', servicio);
      
      const filter: any = { activo: true };
      if (servicio && typeof servicio === 'string') {
        filter.servicio = servicio;
      }

      const testimonials = await Testimonial.find(filter)
        .sort({ orden: 1, createdAt: -1 })
        .limit(20);

      console.log(`✅ Encontrados ${testimonials.length} testimonios`);
      return res.status(200).json({ testimonials });

    } catch (error) {
      console.error('❌ Error al obtener testimonios:', error);
      return res.status(500).json({ error: 'Error al obtener testimonios' });
    }
  }

  if (req.method === 'POST') {
    try {
      console.log('📝 Creando nuevo testimonio');

      // Validar datos de entrada
      const validationResult = testimonialSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: validationResult.error.errors 
        });
      }

      const testimonialData = validationResult.data;

      // Crear el testimonio
      const newTestimonial = await Testimonial.create(testimonialData);

      console.log('✅ Testimonio creado exitosamente:', newTestimonial._id);
      return res.status(201).json({ testimonial: newTestimonial });

    } catch (error) {
      console.error('❌ Error al crear testimonio:', error);
      return res.status(500).json({ error: 'Error al crear el testimonio' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}

// Aplicar middleware de admin solo para POST
export default function protectedHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return requireAdmin(handler)(req, res);
  }
  return handler(req, res);
} 