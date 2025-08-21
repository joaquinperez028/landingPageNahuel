import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/googleAuth';
import dbConnect from '../../../../lib/mongodb';
import Report from '../../../../models/Report';
import User from '../../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    await dbConnect();

    // Verificar que el usuario es admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Solo los administradores pueden ejecutar migraciones' 
      });
    }

    console.log('🔄 Iniciando migración de categorías de informes...');

    // Obtener todos los informes que no tienen categoría
    const reports = await Report.find({ 
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: '' }
      ]
    });

    console.log(`📊 Encontrados ${reports.length} informes para migrar`);

    let migratedCount = 0;
    const results = [];

    for (const report of reports) {
      try {
        // Determinar categoría basándose en el título o contenido
        let category = 'general'; // categoría por defecto
        
        const titleLower = report.title.toLowerCase();
        const contentLower = report.content.toLowerCase();
        
        // Reglas para asignar categorías
        if (titleLower.includes('smart money') || 
            titleLower.includes('flujo') || 
            titleLower.includes('institucional') ||
            contentLower.includes('smart money') ||
            contentLower.includes('flujos institucionales')) {
          category = 'smart-money';
        } else if (titleLower.includes('trader call') || 
                   titleLower.includes('señal') ||
                   titleLower.includes('trade') ||
                   contentLower.includes('trader call')) {
          category = 'trader-call';
        }

        // Actualizar el informe
        await Report.findByIdAndUpdate(report._id, { 
          category: category 
        });

        results.push({
          id: report._id,
          title: report.title,
          oldCategory: report.category || 'none',
          newCategory: category
        });

        migratedCount++;
        console.log(`✅ Migrado: "${report.title}" → ${category}`);

      } catch (error) {
        console.error(`❌ Error migrando informe ${report._id}:`, error);
        results.push({
          id: report._id,
          title: report.title,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }

    console.log(`🎉 Migración completada: ${migratedCount} informes actualizados`);

    return res.status(200).json({
      success: true,
      message: `Migración completada exitosamente`,
      data: {
        totalFound: reports.length,
        totalMigrated: migratedCount,
        results: results
      }
    });

  } catch (error) {
    console.error('❌ Error en migración:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 