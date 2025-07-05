import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import UserSubscription from '@/models/UserSubscription';
import { initializeUserSubscriptions } from '@/lib/notificationUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticación
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  await dbConnect();

  switch (req.method) {
    case 'GET':
      return handleGetSubscriptions(req, res, session);
    case 'PUT':
      return handleUpdateSubscriptions(req, res, session);
    default:
      return res.status(405).json({ message: 'Método no permitido' });
  }
}

async function handleGetSubscriptions(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const userEmail = session.user.email;

    // Obtener suscripciones del usuario
    let subscription = await UserSubscription.findOne({ userEmail });

    // Si no existe, crear suscripciones por defecto
    if (!subscription) {
      await initializeUserSubscriptions(userEmail);
      subscription = await UserSubscription.findOne({ userEmail });
    }

    return res.status(200).json({
      subscriptions: subscription?.subscriptions || {},
      preferences: subscription?.preferences || {}
    });

  } catch (error) {
    console.error('❌ Error al obtener suscripciones:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}

async function handleUpdateSubscriptions(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const userEmail = session.user.email;
    const { subscriptions, preferences } = req.body;

    // Validar que se envíen datos
    if (!subscriptions && !preferences) {
      return res.status(400).json({ 
        message: 'Debe enviar subscriptions o preferences para actualizar' 
      });
    }

    // Preparar datos de actualización
    const updateData: any = {};
    
    if (subscriptions) {
      // Validar tipos de suscripciones
      const validSubscriptions = [
        'alertas_trader',
        'alertas_smart', 
        'alertas_cashflow',
        'notificaciones_sistema',
        'notificaciones_promociones',
        'notificaciones_actualizaciones'
      ];

      const subscriptionKeys = Object.keys(subscriptions);
      const invalidKeys = subscriptionKeys.filter(key => !validSubscriptions.includes(key));
      
      if (invalidKeys.length > 0) {
        return res.status(400).json({ 
          message: `Tipos de suscripción inválidos: ${invalidKeys.join(', ')}` 
        });
      }

      // Actualizar suscripciones
      for (const [key, value] of Object.entries(subscriptions)) {
        if (typeof value === 'boolean') {
          updateData[`subscriptions.${key}`] = value;
        }
      }
    }

    if (preferences) {
      // Validar tipos de preferencias
      const validPreferences = [
        'emailNotifications',
        'pushNotifications',
        'browserNotifications'
      ];

      const preferenceKeys = Object.keys(preferences);
      const invalidKeys = preferenceKeys.filter(key => !validPreferences.includes(key));
      
      if (invalidKeys.length > 0) {
        return res.status(400).json({ 
          message: `Tipos de preferencia inválidos: ${invalidKeys.join(', ')}` 
        });
      }

      // Actualizar preferencias
      for (const [key, value] of Object.entries(preferences)) {
        if (typeof value === 'boolean') {
          updateData[`preferences.${key}`] = value;
        }
      }
    }

    // Actualizar o crear suscripciones
    const updatedSubscription = await UserSubscription.findOneAndUpdate(
      { userEmail },
      updateData,
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    console.log(`✅ Suscripciones actualizadas para: ${userEmail}`);

    return res.status(200).json({
      message: 'Suscripciones actualizadas exitosamente',
      subscriptions: updatedSubscription.subscriptions,
      preferences: updatedSubscription.preferences
    });

  } catch (error) {
    console.error('❌ Error al actualizar suscripciones:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 