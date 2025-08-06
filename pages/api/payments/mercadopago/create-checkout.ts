import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Payment from '@/models/Payment';
import { 
  createMercadoPagoPreference, 
  createSubscriptionPreference, 
  createTrainingPreference 
} from '@/lib/mercadopago';
import { z } from 'zod';

// Schema de validación
const checkoutSchema = z.object({
  service: z.enum(['TraderCall', 'SmartMoney', 'CashFlow', 'TradingFundamentals', 'DowJones']),
  amount: z.number().positive('El monto debe ser positivo'),
  currency: z.enum(['ARS', 'USD', 'UYU']).default('ARS'),
  type: z.enum(['subscription', 'training']).default('subscription')
});

/**
 * API para crear checkout de MercadoPago
 * POST: Crear preferencia de pago y retornar URL de checkout
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`📡 ${req.method} /api/payments/mercadopago/create-checkout`);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false,
      error: 'Método no permitido' 
    });
  }

  try {
    await dbConnect();

    // Verificar sesión
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ 
        success: false,
        error: 'Debes iniciar sesión para realizar el pago' 
      });
    }

    // Validar datos de entrada
    const validatedData = checkoutSchema.parse(req.body);
    const { service, amount, currency, type } = validatedData;

    // Buscar usuario
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }

    // Verificar si ya tiene suscripción activa (solo para suscripciones)
    if (type === 'subscription') {
      const hasActiveSubscription = user.hasServiceAccess(service);
      if (hasActiveSubscription) {
        return res.status(409).json({ 
          success: false,
          error: `Ya tienes una suscripción activa a ${service}` 
        });
      }
    }

    // Verificar si ya tiene entrenamiento activo (solo para entrenamientos)
    if (type === 'training') {
      const hasTraining = user.entrenamientos.some(
        (entrenamiento: any) => entrenamiento.tipo === service && entrenamiento.activo
      );
      if (hasTraining) {
        return res.status(409).json({ 
          success: false,
          error: `Ya tienes acceso al entrenamiento ${service}` 
        });
      }
    }

    // Crear preferencia según el tipo
    let preferenceData;
    if (type === 'subscription') {
      preferenceData = createSubscriptionPreference(
        service,
        amount,
        user.email,
        user._id.toString(),
        currency
      );
    } else {
      preferenceData = createTrainingPreference(
        service,
        amount,
        user.email,
        user._id.toString(),
        currency
      );
    }

    // Crear preferencia en MercadoPago
    const checkoutUrl = await createMercadoPagoPreference(preferenceData);

    // Calcular fecha de expiración (30 días desde ahora)
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Guardar registro de pago pendiente
    const payment = new Payment({
      userId: user._id,
      userEmail: user.email,
      service,
      amount,
      currency,
      status: 'pending',
      mercadopagoPaymentId: '', // Se actualizará cuando llegue el webhook
      externalReference: preferenceData.external_reference,
      paymentMethodId: '', // Se actualizará cuando llegue el webhook
      paymentTypeId: '', // Se actualizará cuando llegue el webhook
      installments: 1,
      transactionDate: new Date(),
      expiryDate,
      metadata: {
        type,
        preferenceId: preferenceData.external_reference
      }
    });

    await payment.save();

    console.log('✅ Checkout creado exitosamente:', {
      user: user.email,
      service,
      type,
      amount,
      currency,
      externalReference: preferenceData.external_reference
    });

    return res.status(200).json({
      success: true,
      checkoutUrl,
      externalReference: preferenceData.external_reference,
      service,
      type,
      amount,
      currency,
      message: 'Checkout creado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error creando checkout:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor. Inténtalo nuevamente.'
    });
  }
} 