import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Alert from '@/models/Alert';

/**
 * API para gestionar suscripciones de usuarios a alertas
 * GET: Obtener usuarios suscritos por tipo de alerta
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔔 API suscripciones - método:', req.method);
  
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
        const { tipo, limit = 50, page = 1 } = req.query;

        // Si se especifica un tipo de alerta, filtrar por ese tipo
        let query: any = {};
        if (tipo && tipo !== 'all') {
          query.subscriptions = { $elemMatch: { tipo: tipo, activa: true } };
        } else {
          // Solo usuarios con suscripciones activas
          query.subscriptions = { $exists: true, $not: { $size: 0 } };
        }

        const skip = (Number(page) - 1) * Number(limit);
        
        const users = await User.find(query)
          .select('name email role subscriptions createdAt lastLogin')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit));

        const totalUsers = await User.countDocuments(query);

        // Obtener estadísticas por tipo de alerta
        const alertStats = await User.aggregate([
          { $match: { subscriptions: { $exists: true, $not: { $size: 0 } } } },
          { $unwind: '$subscriptions' },
          { $match: { 'subscriptions.activa': true } },
          { 
            $group: { 
              _id: '$subscriptions.tipo', 
              count: { $sum: 1 },
              ingresosMensuales: { $sum: '$subscriptions.precio' }
            } 
          },
          { $sort: { count: -1 } }
        ]);

        return res.status(200).json({
          success: true,
          users: users.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            subscriptions: user.subscriptions || [],
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            // Calcular ingresos totales del usuario
            ingresoMensual: (user.subscriptions || [])
              .filter((sub: any) => sub.activa)
              .reduce((total: number, sub: any) => total + (sub.precio || 0), 0)
          })),
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalUsers / Number(limit)),
            totalUsers,
            hasNext: skip + Number(limit) < totalUsers,
            hasPrev: Number(page) > 1
          },
          estadisticas: {
            totalSuscriptores: totalUsers,
            alertStats: alertStats.map(stat => ({
              tipo: stat._id,
              suscriptores: stat.count,
              ingresosMensuales: stat.ingresosMensuales
            })),
            ingresosTotales: alertStats.reduce((total, stat) => total + stat.ingresosMensuales, 0)
          }
        });
      } catch (error) {
        console.error('Error al obtener suscripciones:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    case 'POST':
      try {
        const { userId, tipo, precio } = req.body;

        if (!userId || !tipo) {
          return res.status(400).json({ error: 'userId y tipo son requeridos' });
        }

        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar si ya tiene esta suscripción
        const existingSub = user.subscriptions?.find(
          (sub: any) => sub.tipo === tipo && sub.activa
        );

        if (existingSub) {
          return res.status(400).json({ 
            error: 'El usuario ya tiene una suscripción activa para este tipo de alerta' 
          });
        }

        // Agregar nueva suscripción
        const newSubscription = {
          tipo,
          precio: precio || 99,
          fechaInicio: new Date(),
          activa: true
        };

        await User.findByIdAndUpdate(userId, {
          $push: { subscriptions: newSubscription },
          role: 'suscriptor' // Actualizar rol automáticamente
        });

        console.log(`✅ Suscripción ${tipo} agregada para usuario ${user.email}`);

        return res.status(200).json({
          success: true,
          message: 'Suscripción agregada exitosamente'
        });
      } catch (error) {
        console.error('Error al agregar suscripción:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    case 'DELETE':
      try {
        const { userId, tipo } = req.body;

        if (!userId || !tipo) {
          return res.status(400).json({ error: 'userId y tipo son requeridos' });
        }

        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Desactivar suscripción
        await User.findByIdAndUpdate(userId, {
          $set: { 
            'subscriptions.$[elem].activa': false,
            'subscriptions.$[elem].fechaFin': new Date()
          }
        }, {
          arrayFilters: [{ 
            'elem.tipo': tipo, 
            'elem.activa': true 
          }]
        });

        // Verificar si quedan suscripciones activas
        const updatedUser = await User.findById(userId);
        const hasActiveSubscriptions = updatedUser?.subscriptions?.some(
          (sub: any) => sub.activa
        );

        // Si no tiene más suscripciones activas, cambiar rol a normal
        if (!hasActiveSubscriptions) {
          await User.findByIdAndUpdate(userId, { role: 'normal' });
        }

        console.log(`❌ Suscripción ${tipo} desactivada para usuario ${user.email}`);

        return res.status(200).json({
          success: true,
          message: 'Suscripción desactivada exitosamente'
        });
      } catch (error) {
        console.error('Error al desactivar suscripción:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    default:
      return res.status(405).json({ error: 'Método no permitido' });
  }
} 