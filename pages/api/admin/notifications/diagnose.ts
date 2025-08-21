import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { 
  diagnoseNotificationSystem, 
  ensureUserSubscriptions,
  createDefaultTemplates 
} from '@/lib/notificationUtils';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

/**
 * API para diagnosticar y corregir el sistema de notificaciones (solo admin)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación de admin
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    await dbConnect();

    // Verificar que el usuario sea admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }

    console.log('🔍 [DIAGNOSE] Iniciando diagnóstico del sistema de notificaciones...');

    // 1. Diagnóstico inicial
    const initialDiagnosis = await diagnoseNotificationSystem();
    console.log('📊 [DIAGNOSE] Diagnóstico inicial:', initialDiagnosis);

    // 2. Crear plantillas por defecto si no existen
    console.log('🎨 [DIAGNOSE] Creando plantillas por defecto...');
    await createDefaultTemplates();

    // 3. Asegurar suscripciones para todos los usuarios
    console.log('🔔 [DIAGNOSE] Verificando suscripciones de usuarios...');
    await ensureUserSubscriptions();

    // 4. Diagnóstico final
    const finalDiagnosis = await diagnoseNotificationSystem();
    console.log('📊 [DIAGNOSE] Diagnóstico final:', finalDiagnosis);

    // 5. Determinar estado del sistema
    const systemStatus = {
      isHealthy: finalDiagnosis.subscriptions > 0 && finalDiagnosis.templates > 0,
      hasSubscribers: finalDiagnosis.alertSubscribers.trader > 0 || 
                     finalDiagnosis.alertSubscribers.smart > 0,
      improvements: {
        templatesCreated: finalDiagnosis.templates > initialDiagnosis.templates,
        subscriptionsCreated: finalDiagnosis.subscriptions > initialDiagnosis.subscriptions
      }
    };

    console.log('✅ [DIAGNOSE] Diagnóstico completado. Estado del sistema:', systemStatus);

    return res.status(200).json({
      success: true,
      message: 'Diagnóstico y corrección del sistema completados',
      initialDiagnosis,
      finalDiagnosis,
      systemStatus,
      recommendations: [
        systemStatus.isHealthy ? '✅ Sistema funcionando correctamente' : '❌ Sistema requiere atención',
        systemStatus.hasSubscribers ? '✅ Hay usuarios suscritos a alertas' : '⚠️ No hay usuarios suscritos - las notificaciones no se enviarán',
        finalDiagnosis.templates > 0 ? '✅ Plantillas configuradas' : '❌ Falta configurar plantillas',
        'ℹ️ Para recibir notificaciones de alertas, los usuarios deben activar sus suscripciones en /perfil'
      ]
    });

  } catch (error) {
    console.error('❌ [DIAGNOSE] Error en diagnóstico:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 