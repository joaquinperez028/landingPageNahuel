import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './googleAuth';
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
 * Crea un evento para un entrenamiento
 * @param userEmail Email del usuario
 * @param trainingName Nombre del entrenamiento
 * @param startDate Fecha y hora de inicio
 * @param duration Duración en minutos
 * @returns El evento creado
 */
export async function createTrainingEvent(
  userEmail: string,
  trainingName: string,
  startDate: Date,
  duration: number
) {
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const event: CalendarEvent = {
    summary: `Entrenamiento: ${trainingName}`,
    description: `Entrenamiento de ${trainingName} con ${userEmail}`,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Montevideo'
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Montevideo'
    },
    attendees: [
      { email: userEmail },
      { email: process.env.ADMIN_EMAIL || '' }
    ]
  };

  return createCalendarEvent(userEmail, event);
}

/**
 * Crea un evento para una asesoría
 * @param userEmail Email del usuario
 * @param advisoryType Tipo de asesoría
 * @param startDate Fecha y hora de inicio
 * @param duration Duración en minutos
 * @returns El evento creado
 */
export async function createAdvisoryEvent(
  userEmail: string,
  advisoryType: string,
  startDate: Date,
  duration: number
) {
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const event: CalendarEvent = {
    summary: `Asesoría: ${advisoryType}`,
    description: `Asesoría de ${advisoryType} con ${userEmail}`,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Montevideo'
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Montevideo'
    },
    attendees: [
      { email: userEmail },
      { email: process.env.ADMIN_EMAIL || '' }
    ]
  };

  return createCalendarEvent(userEmail, event);
} 