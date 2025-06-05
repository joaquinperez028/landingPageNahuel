import Stripe from 'stripe';

// Configuración de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_development_key', {
  apiVersion: '2023-10-16',
});

export interface PaymentData {
  amount: number;
  currency: 'usd' | 'ars' | 'uyu';
  description: string;
  userId: string;
  userEmail: string;
  servicio: string;
}

/**
 * Crea una sesión de pago con Stripe
 * @param paymentData Datos del pago
 * @returns Promise con la URL de checkout
 */
export async function createStripeCheckout(paymentData: PaymentData): Promise<string> {
  console.log('💳 Creando sesión de pago Stripe para:', paymentData.userEmail);
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: paymentData.currency,
            product_data: {
              name: paymentData.servicio,
              description: paymentData.description,
            },
            unit_amount: paymentData.amount * 100, // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/payment/cancel`,
      metadata: {
        userId: paymentData.userId,
        servicio: paymentData.servicio,
      },
      customer_email: paymentData.userEmail,
    });

    console.log('✅ Sesión de pago Stripe creada:', session.id);
    return session.url!;
    
  } catch (error) {
    console.error('❌ Error creando sesión de pago Stripe:', error);
    throw error;
  }
}

/**
 * Verifica el estado de una sesión de pago de Stripe
 * @param sessionId ID de la sesión de checkout
 * @returns Promise con los datos de la sesión
 */
export async function verifyStripePayment(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('🔍 Verificando pago Stripe:', sessionId, 'Estado:', session.payment_status);
    
    return {
      success: session.payment_status === 'paid',
      sessionId: session.id,
      userId: session.metadata?.userId,
      servicio: session.metadata?.servicio,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
      customerEmail: session.customer_email,
    };
  } catch (error) {
    console.error('❌ Error verificando pago Stripe:', error);
    throw error;
  }
}

// Configuración de Mobbex (para pagos en Argentina/Uruguay)
interface MobbexPaymentData {
  total: number;
  currency: string;
  description: string;
  reference: string;
  email: string;
  name: string;
}

/**
 * Crea un checkout con Mobbex
 * @param paymentData Datos del pago
 * @returns Promise con la URL de checkout
 */
export async function createMobbexCheckout(paymentData: MobbexPaymentData): Promise<string> {
  console.log('💰 Creando checkout Mobbex para:', paymentData.email);
  
  try {
    const response = await fetch('https://api.mobbex.com/p/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.MOBBEX_API_KEY!,
        'x-access-token': process.env.MOBBEX_ACCESS_TOKEN!,
      },
      body: JSON.stringify({
        total: paymentData.total,
        currency: paymentData.currency,
        description: paymentData.description,
        reference: paymentData.reference,
        customer: {
          email: paymentData.email,
          name: paymentData.name,
        },
        return_url: `${process.env.NEXTAUTH_URL}/payment/success`,
        webhook: `${process.env.NEXTAUTH_URL}/api/webhooks/mobbex`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en Mobbex API: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Checkout Mobbex creado:', data.data.id);
    
    return data.data.url;
    
  } catch (error) {
    console.error('❌ Error creando checkout Mobbex:', error);
    throw error;
  }
}

/**
 * Verifica el webhook de Mobbex
 * @param webhookData Datos del webhook
 * @returns boolean
 */
export function verifyMobbexWebhook(webhookData: any): boolean {
  console.log('🔍 Verificando webhook Mobbex:', webhookData);
  
  // Verificar que el pago fue exitoso
  return webhookData.payment && webhookData.payment.status?.code === 200;
}

export { stripe }; 