import React from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/CuentaAsesorada.module.css';

export default function CuentaAsesorada() {
  return (
    <>
      <Head>
        <title>Cuenta Asesorada - Próximamente | Nahuel Lozano</title>
        <meta name="description" content="Servicio de Cuenta Asesorada - Próximamente" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        {/* Hero Section - Próximamente */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>Cuenta Asesorada</h1>
              <div className={styles.proximamenteContainer}>
                <h2 className={styles.proximamenteTitle}>Próximamente</h2>
                <p className={styles.proximamenteDescription}>
                  Estamos trabajando para traerte el mejor servicio de gestión profesional de inversiones.
                  <br />
                  <br />
                  Muy pronto podrás acceder a:
                </p>
                <ul className={styles.proximamenteFeatures}>
                  <li>✅ Gestión profesional de tu portafolio</li>
                  <li>✅ Estrategias personalizadas de inversión</li>
                  <li>✅ Seguimiento continuo del mercado</li>
                  <li>✅ Reportes detallados de performance</li>
                  <li>✅ Optimización mensual de activos</li>
                </ul>
                <p className={styles.proximamenteFooter}>
                  ¡Mantente atento a nuestras notificaciones para ser el primero en conocer cuando esté disponible!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
} 