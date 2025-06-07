import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API para gestión de usuarios con filtros avanzados y paginación
 * GET: Obtener lista de usuarios con filtros
 * POST: Crear nuevo usuario
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('👥 API usuarios - método:', req.method);
  
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
        const { 
          page = 1, 
          limit = 20, 
          search = '', 
          role = 'all', 
          status = 'all',
          subscription = 'all'
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        
        // Construir query de filtros
        let query: any = {};
        
        // Filtro por búsqueda (nombre o email)
        if (search && search !== '') {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ];
        }
        
        // Filtro por rol
        if (role && role !== 'all') {
          query.role = role;
        }
        
        // Filtro por estado
        if (status && status !== 'all') {
          query.isActive = status === 'active';
        }
        
        // Filtro por suscripción
        if (subscription && subscription !== 'all') {
          query.subscriptions = { 
            $elemMatch: { 
              tipo: subscription, 
              activa: true 
            } 
          };
        }

        console.log('🔍 Query de filtros:', JSON.stringify(query, null, 2));

        // Obtener usuarios con paginación
        const users = await User.find(query)
          .select('name email role createdAt lastLogin isActive subscriptions')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit));

        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / Number(limit));

        // Procesar usuarios para calcular ingresos mensuales
        const processedUsers = users.map(user => {
          const ingresoMensual = user.subscriptions?.reduce((total: number, sub: any) => {
            return sub.activa ? total + (sub.precio || 0) : total;
          }, 0) || 0;

          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            isActive: user.isActive !== false, // Por defecto true si no existe
            subscriptions: user.subscriptions || [],
            ingresoMensual
          };
        });

        return res.status(200).json({ 
          success: true, 
          users: processedUsers,
          pagination: {
            currentPage: Number(page),
            totalPages,
            totalUsers,
            hasNext: skip + Number(limit) < totalUsers,
            hasPrev: Number(page) > 1
          }
        });
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    case 'POST':
      try {
        const { name, email, role = 'normal', googleId } = req.body;

        if (!name || !email) {
          return res.status(400).json({ error: 'Nombre y email son requeridos' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Para usuarios creados manualmente, generar un googleId temporal
        const tempGoogleId = googleId || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newUser = new User({
          googleId: tempGoogleId,
          name,
          email,
          role,
          isActive: true,
          subscriptions: [],
          createdAt: new Date(),
          // Marcar como usuario creado manualmente
          manuallyCreated: true
        });

        await newUser.save();

        console.log(`✅ Usuario creado: ${email} con rol ${role}`);

        return res.status(201).json({
          success: true,
          message: 'Usuario creado exitosamente',
          user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt,
            isActive: newUser.isActive,
            subscriptions: [],
            ingresoMensual: 0
          }
        });
      } catch (error: any) {
        console.error('Error al crear usuario:', error);
        if (error.code === 11000) {
          return res.status(400).json({ error: 'El email ya está en uso' });
        }
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    default:
      return res.status(405).json({ error: 'Método no permitido' });
  }
} 