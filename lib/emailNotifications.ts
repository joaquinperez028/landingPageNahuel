import { sendEmail, createTrainingConfirmationTemplate, createAdvisoryConfirmationTemplate, createAdminNotificationTemplate } from '@/lib/emailService';

/**
 * Envía email de confirmación para entrenamiento
 */
export async function sendTrainingConfirmationEmail(
  userEmail: string,
  userName: string,
  trainingDetails: {
    type: string;
    date: string;
    time: string;
    duration: number;
  }
) {
  try {
    console.log('📧 Enviando email de confirmación de entrenamiento a:', userEmail);

    const html = createTrainingConfirmationTemplate(userEmail, userName, trainingDetails);
    
    const success = await sendEmail({
      to: userEmail,
      subject: '✅ Confirmación de Entrenamiento - Nahuel Lozano Trading',
      html
    });

    if (success) {
      console.log('✅ Email de confirmación de entrenamiento enviado exitosamente');
    } else {
      throw new Error('Error al enviar email de confirmación de entrenamiento');
    }

  } catch (error) {
    console.error('❌ Error al enviar email de confirmación de entrenamiento:', error);
    throw error;
  }
}

/**
 * Envía email de confirmación para asesoría
 */
export async function sendAdvisoryConfirmationEmail(
  userEmail: string,
  userName: string,
  advisoryDetails: {
    type: string;
    date: string;
    time: string;
    duration: number;
    price?: number;
  }
) {
  try {
    console.log('📧 Enviando email de confirmación de asesoría a:', userEmail);

    const html = createAdvisoryConfirmationTemplate(userEmail, userName, advisoryDetails);
    
    const success = await sendEmail({
      to: userEmail,
      subject: '✅ Confirmación de Asesoría - Consultorio Financiero',
      html
    });

    if (success) {
      console.log('✅ Email de confirmación de asesoría enviado exitosamente');
    } else {
      throw new Error('Error al enviar email de confirmación de asesoría');
    }

  } catch (error) {
    console.error('❌ Error al enviar email de confirmación de asesoría:', error);
    throw error;
  }
}

/**
 * Envía notificación al admin sobre nueva reserva
 */
export async function sendAdminNotificationEmail(
  bookingDetails: {
    userEmail: string;
    userName: string;
    type: 'training' | 'advisory';
    serviceType: string;
    date: string;
    time: string;
    duration: number;
    price?: number;
  }
) {
  try {
    console.log('📧 Enviando notificación al admin sobre nueva reserva');

    const html = createAdminNotificationTemplate(bookingDetails);
    
    const adminEmail = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'admin@lozanonahuel.com';
    
    const success = await sendEmail({
      to: adminEmail,
      subject: `🔔 Nueva Reserva: ${bookingDetails.type === 'training' ? 'Entrenamiento' : 'Asesoría'} - ${bookingDetails.userName}`,
      html
    });

    if (success) {
      console.log('✅ Email de notificación al admin enviado exitosamente');
    } else {
      throw new Error('Error al enviar notificación al admin');
    }

  } catch (error) {
    console.error('❌ Error al enviar notificación al admin:', error);
    throw error;
  }
}