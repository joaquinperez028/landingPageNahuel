import nodemailer from 'nodemailer';

// Configurar el transportador de email
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // o el servicio que uses
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD, // App password para Gmail
    },
  });
};

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

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: '✅ Confirmación de Entrenamiento - Nahuel Lozano Trading',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #1a1a1a; color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #00ff88; margin-bottom: 10px;">🎯 Entrenamiento Confirmado</h1>
            <p style="font-size: 18px; margin: 0;">¡Tu reserva ha sido confirmada exitosamente!</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Detalles de tu Entrenamiento</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 8px 0;"><strong>👤 Participante:</strong> ${userName}</p>
              <p style="margin: 8px 0;"><strong>📚 Tipo:</strong> ${trainingDetails.type}</p>
              <p style="margin: 8px 0;"><strong>📅 Fecha:</strong> ${trainingDetails.date}</p>
              <p style="margin: 8px 0;"><strong>⏰ Hora:</strong> ${trainingDetails.time}</p>
              <p style="margin: 8px 0;"><strong>⏱️ Duración:</strong> ${trainingDetails.duration} minutos</p>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #00ff88;">
              <h3 style="color: #1a1a1a; margin-top: 0;">📋 Próximos Pasos:</h3>
              <ul style="color: #333; line-height: 1.6;">
                <li>Recibirás el link de la reunión por email 24 horas antes</li>
                <li>Asegúrate de tener una conexión estable a internet</li>
                <li>Prepara tus preguntas específicas sobre trading</li>
                <li>Ten a mano tu plataforma de trading si quieres revisarla</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">
                Si necesitas reprogramar o cancelar, contáctanos con al menos 24 horas de anticipación.
              </p>
              <p style="color: #666; font-size: 14px;">
                📧 Email: ${process.env.SMTP_USER}<br>
                🌐 Web: ${process.env.NEXTAUTH_URL}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Nahuel Lozano Trading. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
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
  }
) {
  try {
    console.log('📧 Enviando email de confirmación de asesoría a:', userEmail);

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: '✅ Confirmación de Asesoría - Consultorio Financiero',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #1a1a1a; color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #00ff88; margin-bottom: 10px;">🩺 Asesoría Confirmada</h1>
            <p style="font-size: 18px; margin: 0;">¡Tu consulta ha sido agendada exitosamente!</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Detalles de tu Asesoría</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 8px 0;"><strong>👤 Cliente:</strong> ${userName}</p>
              <p style="margin: 8px 0;"><strong>🩺 Servicio:</strong> ${advisoryDetails.type}</p>
              <p style="margin: 8px 0;"><strong>📅 Fecha:</strong> ${advisoryDetails.date}</p>
              <p style="margin: 8px 0;"><strong>⏰ Hora:</strong> ${advisoryDetails.time}</p>
              <p style="margin: 8px 0;"><strong>⏱️ Duración:</strong> ${advisoryDetails.duration} minutos</p>
              ${advisoryDetails.price ? `<p style="margin: 8px 0;"><strong>💰 Precio:</strong> $${advisoryDetails.price} USD</p>` : ''}
            </div>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #00ff88;">
              <h3 style="color: #1a1a1a; margin-top: 0;">📋 Qué Incluye tu Asesoría:</h3>
              <ul style="color: #333; line-height: 1.6;">
                <li>Análisis completo de tu situación financiera actual</li>
                <li>Evaluación de tu perfil de riesgo</li>
                <li>Recomendaciones específicas de inversión</li>
                <li>Plan de acción detallado y personalizado</li>
                <li>Seguimiento por email durante 30 días</li>
                <li>Grabación de la sesión para tu referencia</li>
              </ul>
            </div>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-top: 20px;">
              <h3 style="color: #1a1a1a; margin-top: 0;">📝 Preparación para la Sesión:</h3>
              <ul style="color: #333; line-height: 1.6;">
                <li>Ten a mano información sobre tus inversiones actuales</li>
                <li>Prepara datos sobre tus ingresos y gastos mensuales</li>
                <li>Define tus objetivos financieros a corto y largo plazo</li>
                <li>Anota las preguntas específicas que quieras hacer</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">
                Recibirás el link de Google Meet 24 horas antes de la sesión.
              </p>
              <p style="color: #666; font-size: 14px;">
                📧 Email: ${process.env.SMTP_USER}<br>
                🌐 Web: ${process.env.NEXTAUTH_URL}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Nahuel Lozano Trading. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
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
  }
) {
  try {
    console.log('📧 Enviando notificación al admin sobre nueva reserva');

    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: adminEmail,
      subject: `🔔 Nueva Reserva: ${bookingDetails.type === 'training' ? 'Entrenamiento' : 'Asesoría'} - ${bookingDetails.userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #1a1a1a; color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #00ff88; margin-bottom: 10px;">🔔 Nueva Reserva</h1>
            <p style="font-size: 18px; margin: 0;">Se ha registrado una nueva reserva en tu calendario</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Detalles de la Reserva</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 8px 0;"><strong>👤 Cliente:</strong> ${bookingDetails.userName}</p>
              <p style="margin: 8px 0;"><strong>📧 Email:</strong> ${bookingDetails.userEmail}</p>
              <p style="margin: 8px 0;"><strong>🎯 Tipo:</strong> ${bookingDetails.type === 'training' ? 'Entrenamiento' : 'Asesoría'}</p>
              <p style="margin: 8px 0;"><strong>📚 Servicio:</strong> ${bookingDetails.serviceType}</p>
              <p style="margin: 8px 0;"><strong>📅 Fecha:</strong> ${bookingDetails.date}</p>
              <p style="margin: 8px 0;"><strong>⏰ Hora:</strong> ${bookingDetails.time}</p>
              <p style="margin: 8px 0;"><strong>⏱️ Duración:</strong> ${bookingDetails.duration} minutos</p>
              ${bookingDetails.price ? `<p style="margin: 8px 0;"><strong>💰 Precio:</strong> $${bookingDetails.price} USD</p>` : ''}
            </div>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #00ff88;">
              <h3 style="color: #1a1a1a; margin-top: 0;">📋 Acciones Requeridas:</h3>
              <ul style="color: #333; line-height: 1.6;">
                <li>El evento ya fue agregado a tu calendario de Google</li>
                <li>Envía el link de Google Meet 24 horas antes</li>
                <li>Prepara el material específico para la sesión</li>
                <li>Confirma la asistencia del cliente si es necesario</li>
              </ul>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Notificación al admin enviada exitosamente');

  } catch (error) {
    console.error('❌ Error al enviar notificación al admin:', error);
    throw error;
  }
}