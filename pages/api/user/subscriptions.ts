import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Payment from '@/models/Payment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await dbConnect();

    // Verificar sesión
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Buscar usuario
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener historial de pagos
    const payments = await Payment.find({ 
      userId: user._id,
      status: { $in: ['approved', 'pending', 'rejected', 'cancelled'] }
    })
    .sort({ transactionDate: -1 })
    .limit(50);

    // Procesar suscripciones activas
    const activeSubscriptions = [];
    const now = new Date();

    // Verificar suscripciones por servicio
    const services = ['TraderCall', 'SmartMoney', 'CashFlow', 'SwingTrading', 'DowJones'];
    
    for (const service of services) {
      if (user.hasServiceAccess(service)) {
        // Buscar el último pago aprobado para este servicio
        const lastPayment = payments.find(p => 
          p.service === service && 
          p.status === 'approved' &&
          p.expiryDate > now
        );

        if (lastPayment) {
          activeSubscriptions.push({
            service,
            status: 'active' as const,
            startDate: lastPayment.transactionDate,
            expiryDate: lastPayment.expiryDate,
            amount: lastPayment.amount,
            currency: lastPayment.currency,
            paymentMethod: 'MercadoPago',
            transactionId: lastPayment.mercadopagoPaymentId
          });
        }
      }
    }

    // Procesar historial de pagos
    const paymentHistory = payments.map(payment => ({
      id: payment._id.toString(),
      service: payment.service,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status as 'approved' | 'pending' | 'rejected' | 'cancelled',
      transactionDate: payment.transactionDate,
      expiryDate: payment.expiryDate,
      paymentMethod: 'MercadoPago',
      mercadopagoPaymentId: payment.mercadopagoPaymentId
    }));

    // Obtener suscripciones expiradas recientemente
    const expiredSubscriptions = payments
      .filter(payment => 
        payment.status === 'approved' && 
        payment.expiryDate < now &&
        payment.expiryDate > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
      )
      .map(payment => ({
        service: payment.service,
        status: 'expired' as const,
        startDate: payment.transactionDate,
        expiryDate: payment.expiryDate,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: 'MercadoPago',
        transactionId: payment.mercadopagoPaymentId
      }));

    const allSubscriptions = [...activeSubscriptions, ...expiredSubscriptions];

    return res.status(200).json({
      success: true,
      subscriptions: allSubscriptions,
      paymentHistory,
      stats: {
        activeCount: activeSubscriptions.length,
        totalPayments: paymentHistory.length,
        totalSpent: paymentHistory
          .filter(p => p.status === 'approved')
          .reduce((total, p) => total + p.amount, 0)
      }
    });

  } catch (error) {
    console.error('Error obteniendo suscripciones:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
}
