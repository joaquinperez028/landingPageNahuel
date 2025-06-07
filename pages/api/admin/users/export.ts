import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API para exportar usuarios a CSV
 * GET: Genera y descarga archivo CSV con todos los usuarios
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📊 API export usuarios - método:', req.method);
  
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
    // Obtener todos los usuarios
    const users = await User.find({})
      .select('name email role createdAt lastLogin isActive subscriptions')
      .sort({ createdAt: -1 });

    // Generar CSV
    const csvHeaders = [
      'Nombre',
      'Email', 
      'Rol',
      'Estado',
      'Fecha Registro',
      'Último Login',
      'Suscripciones Activas',
      'Ingresos Mensuales ($)',
      'Total Suscripciones'
    ];

    const csvRows = users.map(user => {
      const activeSubs = user.subscriptions?.filter((sub: any) => sub.activa) || [];
      const ingresoMensual = activeSubs.reduce((total: number, sub: any) => total + (sub.precio || 0), 0);
      const subsNames = activeSubs.map((sub: any) => sub.tipo).join(';');

      return [
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.role}"`,
        user.isActive !== false ? 'Activo' : 'Inactivo',
        user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : '',
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca',
        `"${subsNames}"`,
        ingresoMensual,
        activeSubs.length
      ];
    });

    // Combinar headers y rows
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Configurar headers para descarga
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `usuarios-${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Agregar BOM para UTF-8 (para Excel)
    const csvWithBOM = '\uFEFF' + csvContent;

    console.log(`📊 CSV generado: ${users.length} usuarios exportados`);

    return res.status(200).send(csvWithBOM);
  } catch (error) {
    console.error('Error al exportar usuarios:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 