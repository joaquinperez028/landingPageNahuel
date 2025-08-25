import { NextApiRequest, NextApiResponse } from 'next';
import { createBookingPreference } from '@/lib/mercadopago';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Probando configuración de Mercado Pago...');

    // Verificar variables de entorno
    const config = {
      accessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      publicKey: !!process.env.MERCADOPAGO_PUBLIC_KEY,
      isTest: process.env.MERCADOPAGO_ACCESS_TOKEN?.includes('TEST') || false
    };

    console.log('📋 Configuración:', config);

    // Crear una preferencia de prueba
    const testPreference = await createBookingPreference(
      'ConsultorioFinanciero',
      1, // $1 de prueba
      'ARS',
      `test_${Date.now()}`,
      'https://lozanonahuel.vercel.app/payment/success',
      'https://lozanonahuel.vercel.app/payment/failure',
      'https://lozanonahuel.vercel.app/payment/pending'
    );

    console.log('📊 Resultado de preferencia de prueba:', testPreference);

    return res.status(200).json({
      status: '✅ Configuración verificada',
      config,
      testPreference: testPreference.success ? {
        preferenceId: testPreference.preferenceId,
        hasInitPoint: !!testPreference.initPoint,
        hasSandboxInitPoint: !!testPreference.sandboxInitPoint
      } : {
        error: testPreference.error
      },
      recommendations: [
        config.accessToken ? '✅ Access Token configurado' : '❌ Falta MERCADOPAGO_ACCESS_TOKEN',
        config.publicKey ? '✅ Public Key configurado' : '❌ Falta MERCADOPAGO_PUBLIC_KEY',
        config.isTest ? '⚠️ Usando credenciales de TEST' : '✅ Usando credenciales de PRODUCCIÓN',
        testPreference.success ? '✅ Preferencia creada correctamente' : '❌ Error creando preferencia'
      ]
    });

  } catch (error) {
    console.error('❌ Error en prueba de Mercado Pago:', error);
    return res.status(500).json({
      status: '❌ Error en la configuración',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
