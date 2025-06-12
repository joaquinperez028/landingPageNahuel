import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API endpoint para probar y actualizar estado de suscripción
 * GET: Verificar estado actual
 * POST: Simular activación de suscripción (solo para testing)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`📡 ${req.method} /api/test-subscription`);

  try {
    await dbConnect();

    const session = await getSession({ req });
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Debes iniciar sesión' });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (req.method === 'GET') {
      // Verificar estado actual de suscripción
      const suscripcionTraderCall = user.suscripciones?.find(
        (sub: any) => 
          sub.servicio === 'TraderCall' && 
          sub.activa === true && 
          new Date(sub.fechaVencimiento) > new Date()
      );

      const subscriptionTraderCall = user.subscriptions?.find(
        (sub: any) => 
          sub.tipo === 'TraderCall' && 
          sub.activa === true &&
          (!sub.fechaFin || new Date(sub.fechaFin) > new Date())
      );

      const isSubscribed = !!(suscripcionTraderCall || subscriptionTraderCall);

      return res.status(200).json({
        isSubscribed,
        user: {
          name: user.name,
          email: user.email,
          role: user.role
        },
        suscripciones: user.suscripciones || [],
        subscriptions: user.subscriptions || []
      });

    } else if (req.method === 'POST') {
      // Simular activación de suscripción (solo para testing)
      const { action } = req.body;

      if (action === 'activate') {
        // Agregar suscripción a TraderCall
        const nuevaSuscripcion = {
          servicio: 'TraderCall',
          fechaInicio: new Date(),
          fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          activa: true
        };

        // Solo cambiar a 'suscriptor' si el usuario no es admin
        const updateData: any = {
          $push: { suscripciones: nuevaSuscripcion }
        };

        if (user.role !== 'admin') {
          updateData.$set = { role: 'suscriptor' };
        }

        await User.findByIdAndUpdate(user._id, updateData);

        return res.status(200).json({
          success: true,
          message: 'Suscripción a TraderCall activada exitosamente',
          suscripcion: nuevaSuscripcion
        });

      } else if (action === 'deactivate') {
        // Desactivar suscripción
        const updateDeactivate: any = {
          $set: { 
            'suscripciones.$[elem].activa': false
          }
        };

        // Solo cambiar a 'normal' si el usuario no es admin
        if (user.role !== 'admin') {
          updateDeactivate.$set.role = 'normal';
        }

        await User.findByIdAndUpdate(user._id, updateDeactivate, {
          arrayFilters: [{ 'elem.servicio': 'TraderCall' }]
        });

        return res.status(200).json({
          success: true,
          message: 'Suscripción a TraderCall desactivada'
        });

      } else {
        return res.status(400).json({ error: 'Acción inválida. Usa "activate" o "deactivate"' });
      }

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error) {
    console.error('❌ Error en test-subscription:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 