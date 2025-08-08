import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/googleAuth';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { 
  processSubscriptionNotifications, 
  cleanupOldNotifications,
  getSubscriptionsForNotifications 
} from '../../../lib/subscriptionNotifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Verificar si es admin
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser || adminUser.role !== 'admin') {
      console.log('❌ [SUBSCRIPTION NOTIFICATIONS] Acceso denegado:', {
        email: session.user.email,
        userFound: !!adminUser,
        userRole: adminUser?.role,
        isAdmin: adminUser?.role === 'admin'
      });
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    console.log('✅ [SUBSCRIPTION NOTIFICATIONS] Acceso de admin confirmado:', session.user.email);

    if (req.method === 'GET') {
      // Obtener suscripciones que necesitan notificación
      const subscriptions = await getSubscriptionsForNotifications();
      
      const now = new Date();
      const subscriptionsWithDetails = subscriptions.map((sub: any) => {
        const daysUntilExpiry = Math.ceil(
          (sub.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return {
          id: sub._id,
          userEmail: sub.userEmail,
          service: sub.service,
          expiryDate: sub.expiryDate,
          daysUntilExpiry,
          needsWarning: daysUntilExpiry === 1,
          needsExpired: daysUntilExpiry <= 0
        };
      });

      return res.status(200).json({
        success: true,
        subscriptions: subscriptionsWithDetails,
        total: subscriptionsWithDetails.length
      });
    }

    if (req.method === 'POST') {
      const { action } = req.body;

      switch (action) {
        case 'process':
          // Procesar notificaciones
          const result = await processSubscriptionNotifications();
          
          return res.status(200).json({
            success: true,
            message: 'Notificaciones procesadas correctamente',
            result
          });

        case 'cleanup':
          // Limpiar notificaciones antiguas
          const deletedCount = await cleanupOldNotifications();
          
          return res.status(200).json({
            success: true,
            message: 'Notificaciones antiguas limpiadas',
            deletedCount
          });

        default:
          return res.status(400).json({ 
            error: 'Acción no válida. Use "process" o "cleanup"' 
          });
      }
    }

  } catch (error) {
    console.error('❌ [SUBSCRIPTION NOTIFICATIONS] Error:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
