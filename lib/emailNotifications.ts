import { sendEmail, createTrainingConfirmationTemplate, createAdvisoryConfirmationTemplate, createAdminNotificationTemplate, createAdminContactNotificationTemplate } from '@/lib/emailService';

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
    meetLink?: string;
  }
) {
  try {
    console.log('📧 Enviando email de confirmación de entrenamiento a:', userEmail);

    const html = createTrainingConfirmationTemplate(userEmail, userName, trainingDetails);
    
    await sendEmail({
      to: userEmail,
      subject: '✅ Confirmación de Entrenamiento - Nahuel Lozano Trading',
      html
    });

    console.log('✅ Email de confirmación de entrenamiento enviado exitosamente');

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
    meetLink?: string;
  }
) {
  try {
    console.log('📧 Enviando email de confirmación de asesoría a:', userEmail);

    const html = createAdvisoryConfirmationTemplate(userEmail, userName, advisoryDetails);
    
    await sendEmail({
      to: userEmail,
      subject: '✅ Confirmación de Asesoría - Consultorio Financiero',
      html
    });

    console.log('✅ Email de confirmación de asesoría enviado exitosamente');

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
    meetLink?: string;
  }
) {
  try {
    console.log('📧 Enviando notificación al admin sobre nueva reserva');

    const html = createAdminNotificationTemplate(bookingDetails);
    
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    
    if (!adminEmail) {
      console.error('❌ No se encontró email válido para el administrador');
      console.error('📧 Variables disponibles:', {
        ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
        SMTP_USER: !!process.env.SMTP_USER,
        EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS
      });
      throw new Error('Email del administrador no configurado');
    }
    
    console.log('📧 Enviando notificación al admin:', adminEmail);
    
    await sendEmail({
      to: adminEmail,
      subject: `🔔 Nueva Reserva: ${bookingDetails.type === 'training' ? 'Entrenamiento' : 'Asesoría'} - ${bookingDetails.userName}`,
      html
    });

    console.log('✅ Email de notificación al admin enviado exitosamente');

  } catch (error) {
    console.error('❌ Error al enviar notificación al admin:', error);
    throw error;
  }
}

/**
 * Envía notificación al admin sobre nuevo mensaje de contacto
 */
export async function sendAdminContactNotificationEmail(
  contactDetails: {
    userEmail: string;
    userName: string;
    userLastName: string;
    message: string;
    timestamp: number;
  }
) {
  try {
    console.log('📧 Enviando notificación al admin sobre nuevo mensaje de contacto');

    const html = createAdminContactNotificationTemplate(contactDetails);
    
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    
    if (!adminEmail) {
      console.error('❌ No se encontró email válido para el administrador');
      console.error('📧 Variables disponibles:', {
        ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
        SMTP_USER: !!process.env.SMTP_USER,
        EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS
      });
      throw new Error('Email del administrador no configurado');
    }
    
    console.log('📧 Enviando notificación al admin:', adminEmail);
    
    await sendEmail({
      to: adminEmail,
      subject: `📧 Nuevo Mensaje de Contacto: ${contactDetails.userName} ${contactDetails.userLastName}`,
      html
    });

    console.log('✅ Email de notificación de contacto al admin enviado exitosamente');

  } catch (error) {
    console.error('❌ Error al enviar notificación de contacto al admin:', error);
    throw error;
  }
}