import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DateTimePicker from '@/components/DateTimePicker';
import styles from '@/styles/AsesoriasTest.module.css';

const AsesoriasTestPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDateTimeSelect = (date: Date) => {
    setSelectedDateTime(date);
  };

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
        throw new Error(data.error || 'Error al crear el evento');
      }

      toast.success('¡Asesoría reservada con éxito!');
      console.log('Evento creado:', data.event);
      
      // Redirigir a una página de confirmación o dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al reservar la asesoría');
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
              <DateTimePicker
                onDateTimeSelect={handleDateTimeSelect}
                minDate={new Date()}
                maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 días
                duration={60}
              />

              <button
                onClick={handleReservar}
                disabled={loading || !selectedDateTime}
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