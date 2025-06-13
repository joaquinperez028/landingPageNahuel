import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import User from '@/models/User';
import dbConnect from './mongodb';

// Configuración del cliente OAuth2
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL + '/api/auth/callback/google'
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
 * Obtiene el cliente de Calendar configurado con el token de acceso del usuario
 * @param userEmail Email del usuario
 * @returns Cliente de Calendar configurado
 */
async function getCalendarClient(userEmail: string) {
  try {
    await dbConnect();
    const user = await User.findOne({ email: userEmail });
    
    if (!user?.googleAccessToken) {
      throw new Error('No se encontró token de acceso para el usuario');
    }

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
      expiry_date: user.googleTokenExpiry
    });

    return google.calendar({ version: 'v3', auth: oauth2Client });
  } catch (error) {
    console.error('Error al obtener cliente de Calendar:', error);
    throw error;
  }
}

/**
 * Crea un evento en Google Calendar
 * @param userEmail Email del usuario
 * @param event Datos del evento a crear
 * @returns El evento creado
 */
export async function createCalendarEvent(userEmail: string, event: CalendarEvent) {
  try {
    const calendar = await getCalendarClient(userEmail);
    
    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      requestBody: {
        ...event,
        reminders: {
          useDefault: true
        }
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error al crear evento en Google Calendar:', error);
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

    // Usar las credenciales del admin para crear el evento
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Configurar tokens del admin (estos deberían estar en variables de entorno)
    auth.setCredentials({
      access_token: process.env.ADMIN_GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.ADMIN_GOOGLE_REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: 'v3', auth });
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const event = {
      summary: `${trainingName} - ${userEmail}`,
      description: `Entrenamiento de trading reservado por: ${userEmail}\n\nTipo: ${trainingName}\nDuración: ${durationMinutes} minutos`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'America/Montevideo',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'America/Montevideo',
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
      calendarId: 'primary',
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

    // Usar las credenciales del admin para crear el evento
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Configurar tokens del admin
    auth.setCredentials({
      access_token: process.env.ADMIN_GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.ADMIN_GOOGLE_REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: 'v3', auth });
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const event = {
      summary: `${advisoryName} - ${userEmail}`,
      description: `Asesoría financiera reservada por: ${userEmail}\n\nTipo: ${advisoryName}\nDuración: ${durationMinutes} minutos\n\nLink de reunión: [Se enviará por email]`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'America/Montevideo',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'America/Montevideo',
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
      calendarId: 'primary',
      requestBody: event,
    });

    console.log('✅ Evento de asesoría creado en calendario del admin:', response.data.id);
    return response.data;

  } catch (error) {
    console.error('❌ Error al crear evento de asesoría:', error);
    throw error;
  }
} 