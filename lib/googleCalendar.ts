import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Configuración del cliente OAuth2 para el admin
const adminOAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
  }>;
}

/**
 * Obtiene el cliente de Calendar configurado con tokens de administrador
 * @returns Cliente de Calendar configurado para el admin
 */
async function getAdminCalendarClient() {
  try {
    console.log('🔑 Configurando cliente de Google Calendar...');
    console.log('📊 Tokens disponibles:', {
      hasAccessToken: !!process.env.ADMIN_GOOGLE_ACCESS_TOKEN,
      hasRefreshToken: !!process.env.ADMIN_GOOGLE_REFRESH_TOKEN,
      accessTokenLength: process.env.ADMIN_GOOGLE_ACCESS_TOKEN?.length || 0,
      refreshTokenLength: process.env.ADMIN_GOOGLE_REFRESH_TOKEN?.length || 0
    });

    // Configurar tokens del admin
    adminOAuth2Client.setCredentials({
      access_token: process.env.ADMIN_GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.ADMIN_GOOGLE_REFRESH_TOKEN,
    });

    // Intentar refrescar el token si es necesario
    try {
      console.log('🔄 Verificando y refrescando tokens si es necesario...');
      await adminOAuth2Client.getAccessToken();
      console.log('✅ Tokens verificados y actualizados');
    } catch (tokenError) {
      console.error('⚠️ Error al refrescar tokens:', tokenError);
      // Continuar con los tokens existentes
    }

    console.log('✅ Tokens configurados correctamente');
    return google.calendar({ version: 'v3', auth: adminOAuth2Client });
  } catch (error) {
    console.error('❌ Error al obtener cliente de Calendar del admin:', error);
    throw error;
  }
}

/**
 * Obtiene el ID de calendario correcto, probando primero el configurado y luego 'primary'
 */
async function getCorrectCalendarId(calendar: any): Promise<string> {
  const configuredId = process.env.GOOGLE_CALENDAR_ID;
  
  // Si no hay ID configurado, usar primary directamente
  if (!configuredId || configuredId === 'primary') {
    console.log('🎯 Usando calendario principal (primary)');
    return 'primary';
  }
  
  // Probar acceso al calendario configurado
  try {
    console.log(`🧪 Probando acceso al calendario: ${configuredId}`);
    await calendar.calendars.get({ calendarId: configuredId });
    console.log(`✅ Calendario ${configuredId} accesible`);
    return configuredId;
  } catch (error: any) {
    console.log(`⚠️ No se puede acceder a ${configuredId}:`, error.message);
    console.log('🔄 Fallback a calendario principal (primary)');
    return 'primary';
  }
}

/**
 * Crea un evento en el calendario del administrador para un entrenamiento
 */
export async function createTrainingEvent(
  userEmail: string,
  trainingName: string,
  startDate: Date,
  durationMinutes: number = 180
) {
  try {
    console.log('📅 Creando evento de entrenamiento en calendario del admin');

    const calendar = await getAdminCalendarClient();
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    // Crear ID único para evitar conflictos con eventos existentes
    const uniqueId = Date.now().toString();
    const formattedDate = startDate.toLocaleDateString('es-ES');

    const event = {
      summary: `${trainingName} - ${userEmail} - ${formattedDate} (${uniqueId})`,
      description: `Entrenamiento de trading reservado por: ${userEmail}\n\nTipo: ${trainingName}\nDuración: ${durationMinutes} minutos\n\nID único: ${uniqueId}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Montevideo',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Montevideo',
      },
      attendees: [
        {
          email: userEmail,
          responseStatus: 'needsAction'
        }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 horas antes
          { method: 'popup', minutes: 30 }, // 30 minutos antes
        ],
      },
      extendedProperties: {
        private: {
          bookingType: 'training',
          uniqueId: uniqueId,
          userEmail: userEmail,
          createdAt: new Date().toISOString()
        }
      }
    };

    console.log('📤 Enviando evento de entrenamiento a Google Calendar API...');
    console.log('🎯 Calendar ID:', await getCorrectCalendarId(calendar));
    console.log('📋 Resumen del evento:', event.summary);

    const response = await calendar.events.insert({
      calendarId: await getCorrectCalendarId(calendar),
      requestBody: event,
    });

    console.log('✅ Evento de entrenamiento creado en calendario del admin:', response.data.id);
    return response.data;

  } catch (error) {
    console.error('❌ Error al crear evento de entrenamiento:', error);
    throw error;
  }
}

/**
 * Crea un evento en el calendario del administrador para una asesoría
 */
export async function createAdvisoryEvent(
  userEmail: string,
  advisoryName: string,
  startDate: Date,
  durationMinutes: number = 60
) {
  try {
    console.log('📅 Creando evento de asesoría en calendario del admin');
    console.log('📋 Datos del evento:', {
      userEmail,
      advisoryName,
      startDate: startDate.toISOString(),
      durationMinutes,
      timezone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Montevideo'
    });

    const calendar = await getAdminCalendarClient();
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    // Crear ID único para evitar conflictos con eventos existentes
    const uniqueId = Date.now().toString();
    const formattedDate = startDate.toLocaleDateString('es-ES');
    const formattedTime = startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const event = {
      summary: `${advisoryName} - ${userEmail} - ${formattedDate} ${formattedTime} (${uniqueId})`,
      description: `Asesoría financiera reservada por: ${userEmail}\n\nTipo: ${advisoryName}\nDuración: ${durationMinutes} minutos\n\nFecha: ${formattedDate} a las ${formattedTime}\nID único: ${uniqueId}\n\nLink de reunión: [Se enviará por email]`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Montevideo',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Montevideo',
      },
      attendees: [
        {
          email: userEmail,
          responseStatus: 'needsAction'
        }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 horas antes
          { method: 'popup', minutes: 30 }, // 30 minutos antes
        ],
      },
      extendedProperties: {
        private: {
          bookingType: 'advisory',
          uniqueId: uniqueId,
          userEmail: userEmail,
          createdAt: new Date().toISOString()
        }
      }
    };

    console.log('📤 Enviando evento a Google Calendar API...');
    console.log('🎯 Calendar ID:', await getCorrectCalendarId(calendar));
    console.log('📋 Resumen del evento:', event.summary);

    const response = await calendar.events.insert({
      calendarId: await getCorrectCalendarId(calendar),
      requestBody: event,
    });

    console.log('✅ Evento de asesoría creado en calendario del admin:', response.data.id);
    console.log('🔗 Link del evento:', response.data.htmlLink);
    return response.data;

  } catch (error: any) {
    console.error('❌ Error detallado al crear evento de asesoría:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      errors: error?.errors,
      response: error?.response?.data
    });
    throw error;
  }
} 