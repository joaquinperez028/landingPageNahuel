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

    // Verificar sesión y permisos de admin
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Verificar si es admin
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser || adminUser.role !== 'admin') {
      console.log('❌ [SUBSCRIPTIONS] Acceso denegado:', {
        email: session.user.email,
        userFound: !!adminUser,
        userRole: adminUser?.role,
        isAdmin: adminUser?.role === 'admin'
      });
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    console.log('✅ [SUBSCRIPTIONS] Acceso de admin confirmado:', session.user.email);

    // Obtener todos los pagos aprobados
    const payments = await Payment.find({ 
      status: 'approved'
    })
    .populate('userId', 'name email')
    .sort({ transactionDate: -1 });

    // Procesar suscripciones activas
    const subscriptions = [];
    const now = new Date();
    const services = ['TraderCall', 'SmartMoney', 'CashFlow', 'SwingTrading', 'DowJones'];

    for (const payment of payments) {
      if (payment.expiryDate > now) {
        const daysUntilExpiry = Math.ceil((payment.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        subscriptions.push({
          id: payment._id.toString(),
          userEmail: payment.userEmail,
          userName: payment.userId?.name || 'Usuario',
          service: payment.service,
          status: 'active' as const,
          startDate: payment.transactionDate,
          expiryDate: payment.expiryDate,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: 'MercadoPago',
          transactionId: payment.mercadopagoPaymentId,
          daysUntilExpiry
        });
      }
    }

    // Obtener suscripciones expiradas recientemente (últimos 30 días)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const expiredPayments = await Payment.find({
      status: 'approved',
      expiryDate: { $lt: now, $gt: thirtyDaysAgo }
    })
    .populate('userId', 'name email')
    .sort({ expiryDate: -1 });

    for (const payment of expiredPayments) {
      const daysSinceExpiry = Math.ceil((now.getTime() - payment.expiryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      subscriptions.push({
        id: payment._id.toString(),
        userEmail: payment.userEmail,
        userName: payment.userId?.name || 'Usuario',
        service: payment.service,
        status: 'expired' as const,
        startDate: payment.transactionDate,
        expiryDate: payment.expiryDate,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: 'MercadoPago',
        transactionId: payment.mercadopagoPaymentId,
        daysUntilExpiry: -daysSinceExpiry
      });
    }

    // Calcular estadísticas
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const expiringSoon = activeSubscriptions.filter(sub => sub.daysUntilExpiry <= 7).length;
    
    const totalRevenue = payments.reduce((total, payment) => total + payment.amount, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.transactionDate);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
    const monthlyRevenue = monthlyPayments.reduce((total, payment) => total + payment.amount, 0);

    const pendingPayments = await Payment.countDocuments({ status: 'pending' });

    const stats = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      expiringSoon,
      totalRevenue,
      monthlyRevenue,
      pendingPayments
    };

    return res.status(200).json({
      success: true,
      subscriptions,
      stats
    });

  } catch (error) {
    console.error('Error obteniendo suscripciones:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
}
