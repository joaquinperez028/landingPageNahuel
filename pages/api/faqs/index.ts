import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import FAQ from '@/models/FAQ';
import { z } from 'zod';

// Schema de validación para FAQs
const faqSchema = z.object({
  question: z.string().min(1).max(200),
  answer: z.string().min(1).max(1000),
  categoria: z.enum(['consultorio', 'entrenamiento', 'general', 'pagos', 'tecnico']).default('general'),
  activo: z.boolean().default(true),
  orden: z.number().default(0)
});

/**
 * API para gestionar FAQs
 * GET: Obtener FAQs (público)
 * POST: Crear FAQ (solo admin)
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { categoria } = req.query;
      
      console.log('❓ Obteniendo FAQs, categoría:', categoria);
      
      const filter: any = { activo: true };
      if (categoria && typeof categoria === 'string') {
        filter.categoria = categoria;
      }

      const faqs = await FAQ.find(filter)
        .sort({ orden: 1, createdAt: -1 })
        .limit(50);

      console.log(`✅ Encontradas ${faqs.length} FAQs`);
      return res.status(200).json({ faqs });

    } catch (error) {
      console.error('❌ Error al obtener FAQs:', error);
      return res.status(500).json({ error: 'Error al obtener FAQs' });
    }
  }

  if (req.method === 'POST') {
    try {
      console.log('📝 Creando nueva FAQ');

      // Validar datos de entrada
      const validationResult = faqSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: validationResult.error.errors 
        });
      }

      const faqData = validationResult.data;

      // Crear la FAQ
      const newFAQ = await FAQ.create(faqData);

      console.log('✅ FAQ creada exitosamente:', newFAQ._id);
      return res.status(201).json({ faq: newFAQ });

    } catch (error) {
      console.error('❌ Error al crear FAQ:', error);
      return res.status(500).json({ error: 'Error al crear la FAQ' });
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