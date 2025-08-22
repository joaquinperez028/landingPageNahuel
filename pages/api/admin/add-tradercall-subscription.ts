import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { adminAuth } from '@/lib/adminAuth';

/**
 * Endpoint para agregar una membresía de TraderCall por 2 días a un usuario
 * Solo accesible por administradores
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación y permisos de administrador
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const isAdmin = await adminAuth(session.user?.email);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    // Conectar a la base de datos
    await connectToDatabase();

    const { userEmail, durationDays = 2 } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'Email de usuario requerido' });
    }

    // Buscar el usuario
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Calcular fechas
    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Verificar si ya tiene una suscripción activa de TraderCall
    const existingSubscription = user.activeSubscriptions.find(
      (sub: any) => sub.service === 'TraderCall' && sub.isActive && new Date() < sub.expiryDate
    );

    if (existingSubscription) {
      // Extender la suscripción existente
      existingSubscription.expiryDate = new Date(existingSubscription.expiryDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      existingSubscription.isActive = true;
    } else {
      // Agregar nueva suscripción
      user.activeSubscriptions.push({
        service: 'TraderCall',
        startDate,
        expiryDate,
        isActive: true,
        amount: 0, // Gratis por 2 días
        currency: 'ARS'
      });
    }

    // Actualizar fecha de expiración general si es necesario
    if (!user.subscriptionExpiry || user.subscriptionExpiry < expiryDate) {
      user.subscriptionExpiry = expiryDate;
    }

    // Actualizar rol si es necesario
    if (user.role === 'normal') {
      user.role = 'suscriptor';
    }

    // Guardar cambios
    await user.save();

    console.log(`✅ Membresía TraderCall agregada por ${durationDays} días a ${userEmail}`);

    return res.status(200).json({
      success: true,
      message: `Membresía TraderCall agregada exitosamente por ${durationDays} días`,
      user: {
        email: user.email,
        name: user.name,
        subscriptionExpiry: user.subscriptionExpiry,
        activeSubscriptions: user.activeSubscriptions.filter((sub: any) => sub.service === 'TraderCall')
      }
    });

  } catch (error) {
    console.error('❌ Error al agregar membresía TraderCall:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
