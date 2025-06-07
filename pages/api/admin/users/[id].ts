import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAPI } from '@/lib/adminAuth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API para operaciones en usuarios individuales
 * PATCH: Actualizar rol o información del usuario
 * DELETE: Eliminar usuario
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  console.log(`👤 [API] Usuario ${id} - método:`, req.method);
  
  await connectDB();

  // Verificar autenticación y permisos de admin
  const adminCheck = await verifyAdminAPI(req, res);
  if (!adminCheck.isAdmin) {
    return res.status(401).json({ error: adminCheck.error || 'No autorizado' });
  }

  console.log(`✅ [API] Admin verificado: ${adminCheck.user?.email}`);

  switch (req.method) {
    case 'PATCH':
      try {
        const { role, ...otherUpdates } = req.body;

        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'ID de usuario inválido' });
        }

        const user = await User.findById(id);
        if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Prevenir que se elimine el último admin
        if (role && user.role === 'admin' && role !== 'admin') {
          const adminCount = await User.countDocuments({ role: 'admin' });
          if (adminCount <= 1) {
            return res.status(400).json({ 
              error: 'No se puede cambiar el rol del último administrador' 
            });
          }
        }

        // Actualizar usuario
        const updateData: any = { ...otherUpdates };
        if (role) updateData.role = role;

        const updatedUser = await User.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        ).select('name email role createdAt lastLogin isActive');

        console.log(`✅ [API] Usuario ${user.email} actualizado - rol: ${role || 'sin cambio'}`);

        return res.status(200).json({
          success: true,
          message: 'Usuario actualizado correctamente',
          user: updatedUser
        });
      } catch (error) {
        console.error('💥 [API] Error al actualizar usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    case 'DELETE':
      try {
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'ID de usuario inválido' });
        }

        const user = await User.findById(id);
        if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Prevenir eliminar administradores
        if (user.role === 'admin') {
          const adminCount = await User.countDocuments({ role: 'admin' });
          if (adminCount <= 1) {
            return res.status(400).json({ 
              error: 'No se puede eliminar el último administrador' 
            });
          }
        }

        await User.findByIdAndDelete(id);

        console.log(`🗑️ [API] Usuario ${user.email} eliminado`);

        return res.status(200).json({
          success: true,
          message: 'Usuario eliminado correctamente'
        });
      } catch (error) {
        console.error('💥 [API] Error al eliminar usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    default:
      return res.status(405).json({ error: 'Método no permitido' });
  }
} 