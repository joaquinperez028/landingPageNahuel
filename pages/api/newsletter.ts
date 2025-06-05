import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API endpoint para suscripción al newsletter
 * POST /api/newsletter
 * 
 * Funcionalidad según spreadsheet:
 * - Recibe email del popup
 * - Envía confirmación 
 * - Incluye enlace a curso gratuito
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectDB();
    console.log('📧 Procesando suscripción al newsletter');

    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email válido requerido' });
    }

    // Verificar si el email ya está registrado como usuario
    let existingUser = await User.findOne({ email });
    
    if (!existingUser) {
      // Crear registro temporal para newsletter (sin Google ID)
      const newsletterUser = new User({
        email,
        name: email.split('@')[0], // Usar parte del email como nombre temporal
        role: 'normal',
        googleId: `newsletter_${Date.now()}`, // ID temporal único
        suscripciones: [],
        compras: [{
          itemId: 'curso-gratuito-intro',
          tipo: 'curso-gratuito',
          fecha: new Date(),
          estado: 'completado',
          monto: 0
        }]
      });

      await newsletterUser.save();
      console.log('✅ Nuevo suscriptor de newsletter registrado:', email);
    } else {
      // Si ya existe, agregamos el curso gratuito si no lo tiene
      const tieneCarsoGratuito = existingUser.compras.some(
        (compra: any) => compra.itemId === 'curso-gratuito-intro'
      );

      if (!tieneCarsoGratuito) {
        existingUser.compras.push({
          itemId: 'curso-gratuito-intro',
          tipo: 'curso-gratuito',
          fecha: new Date(),
          estado: 'completado',
          monto: 0
        });
        await existingUser.save();
      }
      console.log('✅ Usuario existente actualizado con curso gratuito:', email);
    }

    // TODO: Aquí se integraría con servicio de email (SendGrid, Mailchimp, etc.)
    // Por ahora simulamos el envío
    const emailData = {
      to: email,
      subject: '🎁 ¡Bienvenido! Tu curso gratuito te está esperando',
      content: `
        Hola!
        
        ¡Gracias por suscribirte a nuestras alertas y descuentos!
        
        Como prometimos, aquí tienes tu curso gratuito de introducción al trading:
        👉 https://lozanonahuel.com/curso-gratuito-intro
        
        También recibirás:
        ✅ Códigos de descuento exclusivos
        ✅ Alertas de lanzamiento de nuevos productos  
        ✅ Tips y estrategias de trading gratuitas
        
        ¡Bienvenido a la comunidad!
        
        Saludos,
        Nahuel Lozano
      `
    };

    // Simular envío de email (en producción usar SendGrid, etc.)
    console.log('📬 Email de confirmación "enviado" a:', email);
    console.log('📄 Contenido del email:', emailData);

    return res.status(200).json({
      success: true,
      message: 'Suscripción exitosa. Revisa tu email para acceder al curso gratuito.',
      data: {
        email,
        cursoGratuito: 'curso-gratuito-intro',
        fechaSuscripcion: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error en suscripción al newsletter:', error);
    return res.status(500).json({ 
      error: 'Error procesando suscripción',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 