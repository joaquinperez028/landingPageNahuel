import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAPI } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

/**
 * API para limpiar índices problemáticos de AdvisorySchedule
 * POST: Elimina índices obsoletos y crea los correctos
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔧 [FIX] Iniciando limpieza de índices de AdvisorySchedule...');
    
    // Verificar permisos de admin
    const adminCheck = await verifyAdminAPI(req, res);
    if (!adminCheck.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    await dbConnect();

    // Obtener la colección directamente
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('No se pudo obtener la conexión a la base de datos');
    }
    
    const collection = db.collection('advisoryschedules');
    
    console.log('📋 [FIX] Obteniendo índices actuales...');
    const indexes = await collection.indexes();
    
    console.log('📊 [FIX] Índices encontrados:');
    const indexInfo = indexes.map(index => ({
      name: index.name,
      key: index.key,
      unique: index.unique || false
    }));
    
    // Buscar y eliminar índices problemáticos
    const problematicIndexes = [
      'dayOfWeek_1_hour_1_minute_1_type_1',
      'dayOfWeek_1_hour_1_minute_1',
      'hour_1_minute_1_type_1'
    ];
    
    const droppedIndexes = [];
    
    for (const problematicIndex of problematicIndexes) {
      const hasIndex = indexes.some(index => index.name === problematicIndex);
      
      if (hasIndex) {
        console.log(`❌ [FIX] Eliminando índice problemático: ${problematicIndex}`);
        try {
          await collection.dropIndex(problematicIndex);
          droppedIndexes.push(problematicIndex);
          console.log(`✅ [FIX] Índice eliminado: ${problematicIndex}`);
        } catch (dropError) {
          console.error(`❌ [FIX] Error al eliminar índice ${problematicIndex}:`, dropError);
        }
      }
    }
    
    // Verificar y crear índices correctos
    const createdIndexes = [];
    
    // 1. Índice único para date + time
    const hasDateTimeIndex = indexes.some(index => 
      index.name === 'date_1_time_1' || 
      (index.key.date === 1 && index.key.time === 1 && index.unique)
    );
    
    if (!hasDateTimeIndex) {
      console.log('🔨 [FIX] Creando índice único para date + time...');
      try {
        await collection.createIndex(
          { date: 1, time: 1 }, 
          { unique: true, name: 'date_1_time_1' }
        );
        createdIndexes.push('date_1_time_1 (unique)');
        console.log('✅ [FIX] Índice único date + time creado');
      } catch (createError) {
        console.error('❌ [FIX] Error al crear índice date + time:', createError);
      }
    }
    
    // 2. Índice para consultas por disponibilidad
    const hasAvailabilityIndex = indexes.some(index => 
      index.name === 'date_1_isAvailable_1_isBooked_1' ||
      (index.key.date === 1 && index.key.isAvailable === 1 && index.key.isBooked === 1)
    );
    
    if (!hasAvailabilityIndex) {
      console.log('🔨 [FIX] Creando índice para consultas de disponibilidad...');
      try {
        await collection.createIndex(
          { date: 1, isAvailable: 1, isBooked: 1 }, 
          { name: 'date_1_isAvailable_1_isBooked_1' }
        );
        createdIndexes.push('date_1_isAvailable_1_isBooked_1');
        console.log('✅ [FIX] Índice de disponibilidad creado');
      } catch (createError) {
        console.error('❌ [FIX] Error al crear índice de disponibilidad:', createError);
      }
    }
    
    // Obtener índices finales
    const finalIndexes = await collection.indexes();
    const finalIndexInfo = finalIndexes.map(index => ({
      name: index.name,
      key: index.key,
      unique: index.unique || false
    }));
    
    console.log('✅ [FIX] Limpieza de índices completada');
    
    return res.status(200).json({
      success: true,
      message: 'Índices de AdvisorySchedule limpiados exitosamente',
      details: {
        initialIndexes: indexInfo,
        droppedIndexes,
        createdIndexes,
        finalIndexes: finalIndexInfo
      }
    });

  } catch (error) {
    console.error('❌ [FIX] Error en limpieza de índices:', error);
    return res.status(500).json({ 
      error: 'Error al limpiar índices',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 