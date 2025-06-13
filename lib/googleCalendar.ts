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
    // Configurar tokens del admin
    adminOAuth2Client.setCredentials({
      access_token: process.env.ADMIN_GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.ADMIN_GOOGLE_REFRESH_TOKEN,
    });

    return google.calendar({ version: 'v3', auth: adminOAuth2Client });
  } catch (error) {
    console.error('❌ Error al obtener cliente de Calendar del admin:', error);
    throw error;
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

    const event = {
      summary: `${trainingName} - ${userEmail}`,
      description: `Entrenamiento de trading reservado por: ${userEmail}\n\nTipo: ${trainingName}\nDuración: ${durationMinutes} minutos`,
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
    };

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
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

    const calendar = await getAdminCalendarClient();
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const event = {
      summary: `${advisoryName} - ${userEmail}`,
      description: `Asesoría financiera reservada por: ${userEmail}\n\nTipo: ${advisoryName}\nDuración: ${durationMinutes} minutos\n\nLink de reunión: [Se enviará por email]`,
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
    };

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      requestBody: event,
    });

    console.log('✅ Evento de asesoría creado en calendario del admin:', response.data.id);
    return response.data;

  } catch (error) {
    console.error('❌ Error al crear evento de asesoría:', error);
    throw error;
  }
} 