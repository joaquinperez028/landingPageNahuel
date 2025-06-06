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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const user = await User.findById(id)
          .select('name email role createdAt lastLogin isActive');

        if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        return res.status(200).json({
          success: true,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            isActive: user.isActive !== false
          }
        });
      } catch (error) {
        console.error('Error al obtener usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    case 'PATCH':
      try {
        const { name, email, role, isActive } = req.body;

        // Verificar que no se esté intentando modificar al último admin
        const user = await User.findById(id);
        if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Si se está cambiando el rol de admin, verificar que no sea el último
        if (user.role === 'admin' && role !== 'admin') {
          const adminCount = await User.countDocuments({ role: 'admin' });
          if (adminCount <= 1) {
            return res.status(400).json({ 
              error: 'No se puede cambiar el rol del último administrador' 
            });
          }
        }

        // Actualizar solo los campos proporcionados
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedUser = await User.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        ).select('name email role createdAt lastLogin isActive');

        if (!updatedUser) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        return res.status(200).json({
          success: true,
          message: 'Usuario actualizado exitosamente',
          user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
            lastLogin: updatedUser.lastLogin,
            isActive: updatedUser.isActive
          }
        });
      } catch (error: any) {
        console.error('Error al actualizar usuario:', error);
        if (error.code === 11000) {
          return res.status(400).json({ error: 'El email ya está en uso' });
        }
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    case 'DELETE':
      try {
        const user = await User.findById(id);
        if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar que no se esté intentando eliminar al último admin
        if (user.role === 'admin') {
          const adminCount = await User.countDocuments({ role: 'admin' });
          if (adminCount <= 1) {
            return res.status(400).json({ 
              error: 'No se puede eliminar el último administrador' 
            });
          }
        }

        // Verificar que no se esté eliminando a sí mismo
        if (user.email === session.user?.email) {
          return res.status(400).json({ 
            error: 'No puedes eliminar tu propia cuenta' 
          });
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
          success: true,
          message: 'Usuario eliminado exitosamente'
        });
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    default:
      return res.status(405).json({ error: 'Método no permitido' });
  }
} 