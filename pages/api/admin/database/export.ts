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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { format = 'csv' } = req.query;

    // Obtener todos los usuarios con la información necesaria
    const users = await User.find({})
      .select('name email role createdAt lastLogin')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Crear CSV
      const csvHeader = 'Nombre,Email,Rol,Fecha de Registro,Último Acceso\n';
      const csvData = users.map(user => {
        const name = `"${user.name || 'Sin nombre'}"`;
        const email = `"${user.email || 'Sin email'}"`;
        const role = user.role === 'admin' ? 'Administrador' : 
                     user.role === 'suscriptor' ? 'Suscriptor' : 'Usuario';
        const createdAt = user.createdAt ? 
          new Date(user.createdAt).toLocaleDateString('es-ES') : 'Sin fecha';
        const lastLogin = user.lastLogin ? 
          new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca';
        
        return `${name},${email},${role},${createdAt},${lastLogin}`;
      }).join('\n');

      const csvContent = csvHeader + csvData;

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="contactos_${new Date().toISOString().split('T')[0]}.csv"`);
      
      // Agregar BOM para que Excel reconozca UTF-8
      const bom = '\uFEFF';
      return res.status(200).send(bom + csvContent);

    } else if (format === 'excel') {
      // Para Excel necesitarías una librería como 'xlsx'
      // Por ahora retornamos CSV con extensión xlsx
      const csvHeader = 'Nombre,Email,Rol,Fecha de Registro,Último Acceso\n';
      const csvData = users.map(user => {
        const name = `"${user.name || 'Sin nombre'}"`;
        const email = `"${user.email || 'Sin email'}"`;
        const role = user.role === 'admin' ? 'Administrador' : 
                     user.role === 'suscriptor' ? 'Suscriptor' : 'Usuario';
        const createdAt = user.createdAt ? 
          new Date(user.createdAt).toLocaleDateString('es-ES') : 'Sin fecha';
        const lastLogin = user.lastLogin ? 
          new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca';
        
        return `${name},${email},${role},${createdAt},${lastLogin}`;
      }).join('\n');

      const csvContent = csvHeader + csvData;

      res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="contactos_${new Date().toISOString().split('T')[0]}.xlsx"`);
      
      const bom = '\uFEFF';
      return res.status(200).send(bom + csvContent);

    } else {
      return res.status(400).json({ error: 'Formato no soportado' });
    }

  } catch (error) {
    console.error('Error al exportar contactos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 