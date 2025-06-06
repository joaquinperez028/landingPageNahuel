import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar que el usuario esté autenticado
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado. Debes estar logueado.' });
    }

    // Conectar a la base de datos
    await dbConnect();

    // Verificar que no haya administradores existentes (solo para el primer admin)
    const existingAdmins = await User.countDocuments({ role: 'admin' });
    
    if (existingAdmins > 0) {
      return res.status(403).json({ 
        message: 'Ya existen administradores en el sistema. Esta API solo funciona para el primer administrador.',
        existingAdmins 
      });
    }

    // Código de seguridad (configurable en variables de entorno)
    const { securityCode, targetEmail } = req.body;
    const SETUP_CODE = process.env.ADMIN_SETUP_CODE || 'SETUP_FIRST_ADMIN_2024';
    
    if (securityCode !== SETUP_CODE) {
      console.log(`❌ Intento de setup admin fallido. Código incorrecto desde: ${session.user.email}`);
      return res.status(403).json({ message: 'Código de seguridad incorrecto' });
    }

    // Determinar qué usuario promover
    const emailToPromote = targetEmail || session.user.email;

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToPromote)) {
      return res.status(400).json({ message: 'Formato de email inválido' });
    }

    // Buscar y promover usuario
    const userToPromote = await User.findOne({ email: emailToPromote });
    
    if (!userToPromote) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado. El usuario debe registrarse primero en la aplicación.' 
      });
    }

    if (userToPromote.role === 'admin') {
      return res.status(200).json({ 
        message: 'El usuario ya es administrador',
        user: {
          name: userToPromote.name,
          email: userToPromote.email,
          role: userToPromote.role
        }
      });
    }

    // Promover a administrador
    const updatedUser = await User.findByIdAndUpdate(
      userToPromote._id, 
      { 
        role: 'admin',
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log(`🎉 Primer administrador configurado: ${emailToPromote} por ${session.user.email}`);

    // Respuesta exitosa
    return res.status(200).json({
      message: '¡Primer administrador configurado exitosamente!',
      admin: {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        promotedBy: session.user.email,
        promotedAt: new Date().toISOString()
      },
      instructions: [
        'El usuario ahora tiene acceso al panel de administración',
        'Puede acceder a /admin/notifications para gestionar notificaciones',
        'Esta API se deshabilitará automáticamente ahora que hay un administrador'
      ]
    });

  } catch (error) {
    console.error('❌ Error configurando primer administrador:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 