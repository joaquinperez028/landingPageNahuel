import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API para exportar datos de facturación en formato Excel/CSV
 * GET: Genera archivo de facturación con datos de usuarios y pagos
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📊 API billing export - método:', req.method);
  
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
    const { from, to } = req.query;

    // Validar fechas
    const fromDate = from ? new Date(from as string) : new Date(new Date().getFullYear(), 0, 1);
    const toDate = to ? new Date(to as string) : new Date();

    console.log(`📅 Exportando datos desde ${fromDate.toISOString()} hasta ${toDate.toISOString()}`);

    // Obtener usuarios con suscripciones activas en el rango de fechas
    const users = await User.find({
      subscriptions: { 
        $elemMatch: { 
          activa: true,
          fechaInicio: { $gte: fromDate, $lte: toDate }
        } 
      }
    }).select('name email fullName cuitCuil subscriptions createdAt');

    // Generar datos para el CSV
    const csvHeaders = [
      'Nombre Completo',
      'Nombre Usuario', 
      'Email',
      'CUIT/CUIL',
      'Tipo Suscripción',
      'Monto Mensual',
      'Fecha Inicio',
      'Estado',
      'Fecha Registro'
    ];

    const csvRows: string[] = [];

    users.forEach(user => {
      if (user.subscriptions && user.subscriptions.length > 0) {
        user.subscriptions
          .filter((sub: any) => sub.activa)
          .forEach((subscription: any) => {
            const subDate = new Date(subscription.fechaInicio);
            if (subDate >= fromDate && subDate <= toDate) {
              csvRows.push([
                `"${user.fullName || user.name || ''}"`,
                `"${user.name || ''}"`,
                `"${user.email || ''}"`,
                `"${user.cuitCuil || 'N/A'}"`,
                `"${subscription.tipo || 'N/A'}"`,
                `${subscription.precio || 0}`,
                subDate.toLocaleDateString('es-ES'),
                subscription.activa ? 'Activa' : 'Inactiva',
                user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'
              ].join(','));
            }
          });
      }
    });

    // Si no hay suscripciones, incluir al menos usuarios registrados en el período
    if (csvRows.length === 0) {
      const allUsers = await User.find({
        createdAt: { $gte: fromDate, $lte: toDate }
      }).select('name email fullName cuitCuil createdAt');

      allUsers.forEach(user => {
        csvRows.push([
          `"${user.fullName || user.name || ''}"`,
          `"${user.name || ''}"`,
          `"${user.email || ''}"`,
          `"${user.cuitCuil || 'N/A'}"`,
          '"Sin suscripción"',
          '0',
          'N/A',
          'Sin suscripción',
          user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'
        ].join(','));
      });
    }

    // Combinar headers y rows
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows
    ].join('\n');

    // Configurar headers para descarga
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `facturacion-${fromDate.toISOString().split('T')[0]}-${toDate.toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Agregar BOM para UTF-8 (para Excel)
    const csvWithBOM = '\uFEFF' + csvContent;

    console.log(`📊 CSV generado: ${csvRows.length} registros exportados`);

    return res.status(200).send(csvWithBOM);
  } catch (error) {
    console.error('Error al exportar facturación:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 