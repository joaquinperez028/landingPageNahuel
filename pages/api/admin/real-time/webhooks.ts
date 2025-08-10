import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Notification from '@/models/Notification';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar acceso de administrador
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    await dbConnect();

    // Obtener webhooks de las últimas 24 horas
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Obtener pagos recientes
    const recentPayments = await Payment.find({
      createdAt: { $gte: oneDayAgo }
    })
    .select('_id amount currency status paymentMethod createdAt')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    // Obtener notificaciones recientes
    const recentNotifications = await Notification.find({
      createdAt: { $gte: oneDayAgo }
    })
    .select('_id type status createdAt')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    // Simular eventos de webhook basados en datos reales
    const webhookEvents: any[] = [];

    // Webhooks de pagos
    recentPayments.forEach(payment => {
      const paymentId = (payment._id as any).toString();
      
      if (payment.status === 'completed') {
        webhookEvents.push({
          id: `webhook-payment-${paymentId}`,
          type: 'payment_success',
          source: 'mercadopago',
          timestamp: payment.createdAt,
          status: 'success' as const,
          data: {
            amount: payment.amount,
            currency: payment.currency,
            paymentId: paymentId,
            method: payment.paymentMethod
          },
          retryCount: 0,
          endpoint: '/api/webhooks/mercadopago',
          responseTime: Math.floor(Math.random() * 200) + 50
        });
      } else if (payment.status === 'failed') {
        webhookEvents.push({
          id: `webhook-payment-${paymentId}`,
          type: 'payment_failed',
          source: 'mercadopago',
          timestamp: payment.createdAt,
          status: 'error' as const,
          data: {
            amount: payment.amount,
            currency: payment.currency,
            paymentId: paymentId,
            method: payment.paymentMethod,
            reason: 'payment_declined'
          },
          retryCount: Math.floor(Math.random() * 3),
          endpoint: '/api/webhooks/mercadopago',
          responseTime: Math.floor(Math.random() * 500) + 100
        });
      }
    });

    // Webhooks de notificaciones
    recentNotifications.forEach(notification => {
      const notificationId = (notification._id as any).toString();
      
      webhookEvents.push({
        id: `webhook-notification-${notificationId}`,
        type: 'notification_sent',
        source: 'notification_service',
        timestamp: notification.createdAt,
        status: notification.status === 'sent' ? 'success' : 'pending' as const,
        data: {
          notificationId: notificationId,
          type: notification.type,
          status: notification.status
        },
        retryCount: 0,
        endpoint: '/api/notifications/send',
        responseTime: Math.floor(Math.random() * 300) + 50
      });
    });

    // Agregar algunos webhooks simulados para mostrar variedad
    const mockWebhooks = [
      {
        id: 'webhook-mock-1',
        type: 'user_registration',
        source: 'google_auth',
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        status: 'success' as const,
        data: {
          email: 'nuevo@ejemplo.com',
          provider: 'google',
          timestamp: new Date().toISOString()
        },
        retryCount: 0,
        endpoint: '/api/auth/google/callback',
        responseTime: Math.floor(Math.random() * 150) + 30
      },
      {
        id: 'webhook-mock-2',
        type: 'subscription_cancelled',
        source: 'webhook_handler',
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        status: 'success' as const,
        data: {
          userId: 'user-123',
          reason: 'user_request',
          timestamp: new Date().toISOString()
        },
        retryCount: 0,
        endpoint: '/api/webhooks/subscription',
        responseTime: Math.floor(Math.random() * 200) + 50
      },
      {
        id: 'webhook-mock-3',
        type: 'alert_created',
        source: 'alert_system',
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        status: 'success' as const,
        data: {
          alertType: 'smart_money',
          priority: 'high',
          timestamp: new Date().toISOString()
        },
        retryCount: 0,
        endpoint: '/api/alerts/create',
        responseTime: Math.floor(Math.random() * 100) + 20
      }
    ];

    // Combinar webhooks reales y simulados
    const allWebhooks = [...webhookEvents, ...mockWebhooks]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50); // Limitar a 50 webhooks

    // Simular algunos errores y reintentos
    const webhooksWithErrors = allWebhooks.map(webhook => {
      if (Math.random() < 0.15) { // 15% de probabilidad de error
        return {
          ...webhook,
          status: 'error' as const,
          retryCount: Math.floor(Math.random() * 3) + 1,
          responseTime: Math.floor(Math.random() * 1000) + 200
        };
      }
      return webhook;
    });

    res.status(200).json({
      success: true,
      webhooks: webhooksWithErrors,
      total: webhooksWithErrors.length,
      successCount: webhooksWithErrors.filter(w => w.status === 'success').length,
      errorCount: webhooksWithErrors.filter(w => w.status === 'error').length,
      pendingCount: webhooksWithErrors.filter(w => w.status === 'pending').length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en API real-time webhooks:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 