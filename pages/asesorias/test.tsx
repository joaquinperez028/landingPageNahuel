import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DateTimePicker from '@/components/DateTimePicker';
import styles from '@/styles/AsesoriasTest.module.css';

// Genera todos los slots posibles de asesoría (cada 30 minutos de 8:00 a 22:00)
const asesoriasSlots: string[] = Array.from({ length: (22 - 8) * 2 + 1 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

type TrainingSchedule = {
  dayOfWeek: number;
  hour: number;
  minute: number;
  duration: number;
  type?: string;
  activo: boolean;
};

function getFreeAdvisorySlots(
  entrenamientos: TrainingSchedule[],
  selectedDate: Date | null,
  asesoriasSlots: string[]
): string[] {
  if (!selectedDate) return asesoriasSlots;
  const dayOfWeek = selectedDate.getDay();
  const entrenamientosHoy = entrenamientos.filter((e) => e.dayOfWeek === dayOfWeek);
  return asesoriasSlots.filter((slot) => {
    const [slotHour, slotMinute] = slot.split(':').map(Number);
    return !entrenamientosHoy.some((e) => {
      const entrenamientoStart = e.hour * 60 + e.minute;
      const entrenamientoEnd = entrenamientoStart + e.duration;
      const slotTime = slotHour * 60 + slotMinute;
      return slotTime >= entrenamientoStart && slotTime < entrenamientoEnd;
    });
  });
}

const AsesoriasTestPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [trainingSchedules, setTrainingSchedules] = useState<TrainingSchedule[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>(asesoriasSlots);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Obtener horarios de entrenamiento al cargar
  useEffect(() => {
    fetch('/api/trainings/schedule')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener los horarios de entrenamiento');
        return res.json();
      })
      .then(data => {
        setTrainingSchedules(data.schedules || []);
        setFetchError(null);
      })
      .catch(err => {
        setFetchError('No se pudieron cargar los horarios de entrenamiento. Intenta recargar la página.');
        toast.error('Error al cargar horarios de entrenamiento');
        console.error('Error al cargar horarios de entrenamiento:', err);
      });
  }, []);

  // Actualizar horarios disponibles cuando cambia la fecha
  const handleDateTimeSelect = (date: Date) => {
    setSelectedDateTime(date);
    setSelectedDate(date);
  };

  useEffect(() => {
    if (selectedDate) {
      const libres = getFreeAdvisorySlots(trainingSchedules, selectedDate, asesoriasSlots);
      setAvailableTimes(libres);
      if (libres.length === 0) {
        toast.error('No hay horarios disponibles para asesoría en la fecha seleccionada');
      }
    } else {
      setAvailableTimes(asesoriasSlots);
    }
  }, [selectedDate, trainingSchedules]);

  const handleReservar = async () => {
    if (!session) {
      toast.error('Debes iniciar sesión para reservar una asesoría');
      return;
    }

    if (!selectedDateTime) {
      toast.error('Por favor selecciona una fecha y hora');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/calendar/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'advisory',
          name: 'Asesoría de Trading',
          startDate: selectedDateTime.toISOString(),
          duration: 60 // 1 hora
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Error al crear el evento');
        console.error('Error al crear el evento:', data.error);
        return;
      }

      toast.success('¡Asesoría reservada con éxito!');
      console.log('Evento creado:', data.event);
      
      // Redirigir a una página de confirmación o dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error al reservar la asesoría:', error);
      toast.error('Error inesperado al reservar la asesoría. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reservar Asesoría - Test</title>
        <meta name="description" content="Reserva una asesoría de trading" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.container}
        >
          <h1 className={styles.title}>Reservar Asesoría</h1>
          
          <div className={styles.content}>
            <div className={styles.info}>
              <h2>Asesoría de Trading</h2>
              <p>
                Sesión personalizada de 1 hora para analizar tu estrategia de trading
                y recibir recomendaciones personalizadas.
              </p>
              <ul className={styles.features}>
                <li>Análisis de tu estrategia actual</li>
                <li>Recomendaciones personalizadas</li>
                <li>Resolución de dudas específicas</li>
                <li>Plan de acción para mejorar</li>
              </ul>
            </div>

            <div className={styles.booking}>
              <h3>Selecciona fecha y hora</h3>
              {fetchError && (
                <div style={{ color: 'red', marginBottom: 12 }}>{fetchError}</div>
              )}
              <DateTimePicker
                onDateTimeSelect={handleDateTimeSelect}
                minDate={new Date()}
                maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 días
                duration={60}
                availableTimes={availableTimes}
              />
              {selectedDate && availableTimes.length === 0 && (
                <div style={{ color: 'red', marginTop: 8 }}>
                  No hay horarios disponibles para asesoría en la fecha seleccionada. Por favor, elige otro día.
                </div>
              )}
              <button
                onClick={handleReservar}
                disabled={loading || !selectedDateTime || availableTimes.length === 0}
                className={styles.button}
              >
                {loading ? 'Reservando...' : 'Reservar Asesoría'}
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </>
  );
};

export default AsesoriasTestPage; 