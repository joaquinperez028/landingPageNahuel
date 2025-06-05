import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Alert from '@/models/Alert';
import { createStripeCheckout, createMobbexCheckout } from '@/lib/payments';

/**
 * API endpoint para suscribirse a alertas
 * POST: Procesar suscripción y crear sesión de pago
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`📡 ${req.method} /api/subscribe`);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await dbConnect();

    const session = await getSession({ req });
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Debes iniciar sesión para suscribirte' });
    }

    const { servicio, metodoPago = 'stripe' } = req.body;

    // Validar servicio
    const serviciosValidos = ['TraderCall', 'SmartMoney', 'CashFlow'];
    if (!serviciosValidos.includes(servicio)) {
      return res.status(400).json({ error: 'Servicio inválido' });
    }

    // Buscar usuario en la base de datos
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si ya está suscrito al servicio
    const suscripcionExistente = user.suscripciones.find(
      (sub: any) => sub.servicio === servicio && sub.activa
    );

    if (suscripcionExistente) {
      return res.status(409).json({ 
        error: `Ya tienes una suscripción activa a ${servicio}` 
      });
    }

    // Definir precios por servicio (en centavos para Stripe)
    const precios = {
      TraderCall: { usd: 99, ars: 15000, description: 'Suscripción mensual a Trader Call' },
      SmartMoney: { usd: 149, ars: 22000, description: 'Suscripción mensual a Smart Money' },
      CashFlow: { usd: 79, ars: 12000, description: 'Suscripción mensual a CashFlow' },
    };

    const precioInfo = precios[servicio as keyof typeof precios];
    
    if (!precioInfo) {
      return res.status(400).json({ error: 'Servicio no disponible' });
    }

    let checkoutUrl: string;

    if (metodoPago === 'stripe') {
      // Crear sesión de pago con Stripe (USD)
      console.log('💳 Creando sesión de pago Stripe para:', servicio);
      
      const paymentData = {
        amount: precioInfo.usd,
        currency: 'usd' as const,
        description: precioInfo.description,
        userId: user._id.toString(),
        userEmail: user.email,
        servicio: servicio,
      };

      checkoutUrl = await createStripeCheckout(paymentData);

    } else if (metodoPago === 'mobbex') {
      // Crear checkout con Mobbex (ARS)
      console.log('💰 Creando checkout Mobbex para:', servicio);
      
      const paymentData = {
        total: precioInfo.ars,
        currency: 'ARS',
        description: precioInfo.description,
        reference: `${servicio}-${user._id}-${Date.now()}`,
        email: user.email,
        name: user.name,
      };

      checkoutUrl = await createMobbexCheckout(paymentData);

    } else {
      return res.status(400).json({ error: 'Método de pago no soportado' });
    }

    // Guardar intento de suscripción temporal (se completará con el webhook)
    await User.findByIdAndUpdate(user._id, {
      $push: {
        compras: {
          itemId: servicio,
          tipo: 'suscripcion',
          fecha: new Date(),
          estado: 'pendiente',
          monto: metodoPago === 'stripe' ? precioInfo.usd : precioInfo.ars,
        }
      }
    });

    console.log('✅ Sesión de pago creada para:', session.user.email, 'Servicio:', servicio);

    return res.status(200).json({
      success: true,
      checkoutUrl,
      servicio,
      metodoPago,
      monto: metodoPago === 'stripe' ? precioInfo.usd : precioInfo.ars,
      moneda: metodoPago === 'stripe' ? 'USD' : 'ARS',
      message: 'Sesión de pago creada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en suscripción:', error);
    return res.status(500).json({ 
      error: 'Error procesando suscripción',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 