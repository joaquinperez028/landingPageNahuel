import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import AvailableSlot from '@/models/AvailableSlot';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Método no permitido',
      message: 'Este endpoint solo acepta peticiones POST' 
    });
  }

  try {
    // Verificar que sea un admin
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Verificar que el usuario sea admin
    const user = await dbConnect().then(() => 
      require('@/models/User').default.findOne({ email: session.user.email })
    );

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    await dbConnect();

    // Contar documentos antes de limpiar
    const countBefore = await AvailableSlot.countDocuments();
    console.log(`📊 Documentos encontrados antes de limpiar: ${countBefore}`);

    if (countBefore === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No hay documentos para limpiar',
        deletedCount: 0 
      });
    }

    // Mostrar algunos ejemplos de los datos que se van a eliminar
    const sampleDocs = await AvailableSlot.find({}).limit(5).lean();
    console.log('📋 Ejemplos de datos que se van a eliminar:');
    sampleDocs.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.date} ${doc.time} - ${doc.serviceType} (${doc.available ? 'Disponible' : 'Reservado'})`);
    });

    // Eliminar todos los documentos
    const result = await AvailableSlot.deleteMany({});

    console.log(`🗑️  Eliminados ${result.deletedCount} documentos`);

    // Verificar que se eliminaron todos
    const countAfter = await AvailableSlot.countDocuments();
    console.log(`📊 Documentos restantes después de limpiar: ${countAfter}`);

    return res.status(200).json({
      success: true,
      message: 'Base de datos limpiada completamente',
      deletedCount: result.deletedCount,
      remainingCount: countAfter,
      sampleDeleted: sampleDocs
    });

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 