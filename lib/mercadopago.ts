import mercadopago from 'mercadopago';

// Configuración de MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

export interface MercadoPagoItem {
  title: string;
  unit_price: number;
  quantity: number;
  currency_id: 'ARS' | 'USD' | 'UYU';
  description?: string;
}

export interface MercadoPagoPreference {
  items: MercadoPagoItem[];
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved' | 'all';
  external_reference: string;
  notification_url?: string;
  expires: boolean;
  expiration_date_to?: string;
  payer: {
    name?: string;
    email: string;
  };
  payment_methods: {
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
}

export interface MercadoPagoPayment {
  id: string;
  status: string;
  status_detail: string;
  external_reference: string;
  transaction_amount: number;
  currency_id: string;
  payer: {
    email: string;
  };
  payment_method_id: string;
  payment_type_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Crea una preferencia de pago en MercadoPago
 * @param preferenceData Datos de la preferencia
 * @returns Promise con la URL de checkout
 */
export async function createMercadoPagoPreference(preferenceData: MercadoPagoPreference): Promise<string> {
  try {
    console.log('💳 Creando preferencia de pago MercadoPago:', preferenceData.external_reference);
    
    const preference = await mercadopago.preferences.create(preferenceData);
    
    console.log('✅ Preferencia creada:', preference.id);
    return preference.init_point!;
    
  } catch (error) {
    console.error('❌ Error creando preferencia MercadoPago:', error);
    throw error;
  }
}

/**
 * Obtiene información de un pago por ID
 * @param paymentId ID del pago
 * @returns Promise con los datos del pago
 */
export async function getMercadoPagoPayment(paymentId: string): Promise<MercadoPagoPayment> {
  try {
    console.log('🔍 Obteniendo pago MercadoPago:', paymentId);
    
    const payment = await mercadopago.payment.get(paymentId);
    
    console.log('✅ Pago obtenido:', payment.id, 'Estado:', payment.status);
    return payment;
    
  } catch (error) {
    console.error('❌ Error obteniendo pago MercadoPago:', error);
    throw error;
  }
}

/**
 * Verifica si un pago fue exitoso
 * @param payment Datos del pago
 * @returns boolean
 */
export function isPaymentSuccessful(payment: MercadoPagoPayment): boolean {
  return payment.status === 'approved';
}

/**
 * Verifica si un pago está pendiente
 * @param payment Datos del pago
 * @returns boolean
 */
export function isPaymentPending(payment: MercadoPagoPayment): boolean {
  return payment.status === 'pending' || payment.status === 'in_process';
}

/**
 * Verifica si un pago fue rechazado
 * @param payment Datos del pago
 * @returns boolean
 */
export function isPaymentRejected(payment: MercadoPagoPayment): boolean {
  return payment.status === 'rejected' || payment.status === 'cancelled';
}

/**
 * Crea datos de preferencia para suscripciones
 * @param serviceName Nombre del servicio
 * @param amount Monto en pesos
 * @param userEmail Email del usuario
 * @param userId ID del usuario
 * @param currency Moneda (ARS por defecto)
 * @returns Datos de preferencia
 */
export function createSubscriptionPreference(
  serviceName: string,
  amount: number,
  userEmail: string,
  userId: string,
  currency: 'ARS' | 'USD' | 'UYU' = 'ARS'
): MercadoPagoPreference {
  const externalReference = `${serviceName}_${userId}_${Date.now()}`;
  
  return {
    items: [
      {
        title: `Suscripción ${serviceName}`,
        unit_price: amount,
        quantity: 1,
        currency_id: currency,
        description: `Acceso por 30 días a ${serviceName}`
      }
    ],
    back_urls: {
      success: `${process.env.NEXTAUTH_URL}/payment/success?reference=${externalReference}`,
      failure: `${process.env.NEXTAUTH_URL}/payment/failure?reference=${externalReference}`,
      pending: `${process.env.NEXTAUTH_URL}/payment/pending?reference=${externalReference}`
    },
    auto_return: 'approved',
    external_reference: externalReference,
    notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
    expires: true,
    expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
    payer: {
      email: userEmail
    },
    payment_methods: {
      installments: 1 // Sin cuotas para suscripciones
    }
  };
}

/**
 * Crea datos de preferencia para entrenamientos
 * @param trainingName Nombre del entrenamiento
 * @param amount Monto en pesos
 * @param userEmail Email del usuario
 * @param userId ID del usuario
 * @param currency Moneda (ARS por defecto)
 * @returns Datos de preferencia
 */
export function createTrainingPreference(
  trainingName: string,
  amount: number,
  userEmail: string,
  userId: string,
  currency: 'ARS' | 'USD' | 'UYU' = 'ARS'
): MercadoPagoPreference {
  const externalReference = `${trainingName}_${userId}_${Date.now()}`;
  
  return {
    items: [
      {
        title: `Entrenamiento ${trainingName}`,
        unit_price: amount,
        quantity: 1,
        currency_id: currency,
        description: `Acceso completo al entrenamiento ${trainingName}`
      }
    ],
    back_urls: {
      success: `${process.env.NEXTAUTH_URL}/payment/success?reference=${externalReference}`,
      failure: `${process.env.NEXTAUTH_URL}/payment/failure?reference=${externalReference}`,
      pending: `${process.env.NEXTAUTH_URL}/payment/pending?reference=${externalReference}`
    },
    auto_return: 'approved',
    external_reference: externalReference,
    notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
    expires: true,
    expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
    payer: {
      email: userEmail
    },
    payment_methods: {
      installments: 3 // Permitir hasta 3 cuotas para entrenamientos
    }
  };
}

export { mercadopago }; 