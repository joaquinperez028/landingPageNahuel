import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  // Verificar autenticación y permisos de admin
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const currentUser = await User.findOne({ email: session.user?.email });
  if (!currentUser || currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Permisos insuficientes' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const users = await User.find({})
          .select('name email role createdAt lastLogin isActive')
          .sort({ createdAt: -1 });

        return res.status(200).json({ 
          success: true, 
          users: users.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            isActive: user.isActive !== false // Por defecto true si no existe
          }))
        });
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    case 'POST':
      try {
        const { name, email, role = 'normal' } = req.body;

        if (!name || !email) {
          return res.status(400).json({ error: 'Nombre y email son requeridos' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'El usuario ya existe' });
        }

        const newUser = new User({
          name,
          email,
          role,
          isActive: true,
          createdAt: new Date()
        });

        await newUser.save();

        return res.status(201).json({
          success: true,
          message: 'Usuario creado exitosamente',
          user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt,
            isActive: newUser.isActive
          }
        });
      } catch (error) {
        console.error('Error al crear usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    default:
      return res.status(405).json({ error: 'Método no permitido' });
  }
} 