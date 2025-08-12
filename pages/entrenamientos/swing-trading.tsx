import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession, signIn } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { toast } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import styles from '@/styles/SwingTrading.module.css';

// Importar componentes optimizados
import HeroSection from '../../components/swing-trading/HeroSection';
import InfoCardsSection from '../../components/swing-trading/InfoCardsSection';
import RoadmapSection from '../../components/swing-trading/RoadmapSection';
import MetricsSection from '../../components/swing-trading/MetricsSection';
import CalendarSection from '../../components/swing-trading/CalendarSection';
import TestimonialsSection from '../../components/swing-trading/TestimonialsSection';
import ProgramSection from '../../components/swing-trading/ProgramSection';
import CTASection from '../../components/swing-trading/CTASection';
import FAQSection from '../../components/swing-trading/FAQSection';
import EnrollmentModal from '../../components/swing-trading/EnrollmentModal';

// Hooks personalizados
import { useSwingTradingData } from '../../hooks/useSwingTradingData';
import { useEnrollment } from '../../hooks/useEnrollment';
import { useTrainingDates } from '../../hooks/useTrainingDates';

interface TrainingData {
  tipo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  metricas: {
    rentabilidad: string;
    estudiantesActivos: string;
    entrenamientosRealizados: string;
    satisfaccion: string;
  };
  contenido: {
    modulos: number;
    lecciones: number;
    certificacion: boolean;
    nivelAcceso: string;
  };
}

interface ProgramModule {
  module: number;
  title: string;
  duration: string;
  lessons: number;
  topics: string[];
  description: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
  results: string;
}

interface TradingPageProps {
  training: TrainingData;
  program: ProgramModule[];
  testimonials: Testimonial[];
}

const SwingTradingPage: React.FC<TradingPageProps> = ({ 
  training,
  program, 
  testimonials
}) => {
  const { data: session } = useSession();
  
  // Hooks personalizados para manejar la lógica
  const { 
    roadmapModules, 
    loadingRoadmap, 
    roadmapError, 
    fetchRoadmaps 
  } = useSwingTradingData();
  
  const {
    isEnrolled,
    checkingEnrollment,
    isProcessingPayment,
    handleEnroll,
    showEnrollForm,
    setShowEnrollForm,
    formData,
    setFormData,
    handleSubmitEnrollment,
    isEnrolling
  } = useEnrollment(session, 'SwingTrading');
  
  const {
    trainingDates,
    nextTrainingDate,
    countdown,
    startDateText,
    isAdmin,
    handleAddTrainingDate,
    handleCalendarDateSelect
  } = useTrainingDates(session, 'SwingTrading');

  // Auto-refresh de roadmaps si hay error
  useEffect(() => {
    if (roadmapError) {
      const timer = setTimeout(fetchRoadmaps, 5000);
      return () => clearTimeout(timer);
    }
  }, [roadmapError, fetchRoadmaps]);

  return (
    <>
      <Head>
        <title>Swing Trading - Entrenamiento Completo | Nahuel Lozano</title>
        <meta name="description" content="Experiencia de aprendizaje premium, personalizada y con acompañamiento constante, donde aprenderás a operar movimientos de varios días o semanas, identificando oportunidades con análisis técnico y estrategias que combinan precisión y paciencia" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <HeroSection
          training={training}
          countdown={countdown}
          startDateText={startDateText}
          isEnrolled={isEnrolled}
          checkingEnrollment={checkingEnrollment}
          isProcessingPayment={isProcessingPayment}
          onEnroll={handleEnroll}
        />

        {/* Info Cards Section */}
        <InfoCardsSection />

        {/* Roadmap Section */}
        <RoadmapSection
          roadmapModules={roadmapModules}
          loadingRoadmap={loadingRoadmap}
          roadmapError={roadmapError}
          onRetry={fetchRoadmaps}
        />

        {/* Metrics Section */}
        <MetricsSection training={training} />

        {/* Calendar Section */}
        <CalendarSection
          trainingDates={trainingDates}
          isAdmin={isAdmin}
          onDateSelect={handleCalendarDateSelect}
        />

        {/* Testimonials Section */}
        <TestimonialsSection
          testimonials={testimonials}
          countdown={countdown}
          startDateText={startDateText}
          isEnrolled={isEnrolled}
          checkingEnrollment={checkingEnrollment}
          isProcessingPayment={isProcessingPayment}
          onEnroll={handleEnroll}
        />

        {/* Program Section */}
        <ProgramSection training={training} program={program} />

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <CTASection
          training={training}
          isEnrolled={isEnrolled}
          checkingEnrollment={checkingEnrollment}
          onEnroll={handleEnroll}
        />
      </main>

      {/* Enrollment Modal */}
      {showEnrollForm && (
        <EnrollmentModal
          formData={formData}
          setFormData={setFormData}
          isEnrolling={isEnrolling}
          onSubmit={handleSubmitEnrollment}
          onClose={() => setShowEnrollForm(false)}
        />
      )}

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Obtener datos del entrenamiento desde la API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/entrenamientos/SwingTrading`);
    
    if (!response.ok) {
      throw new Error('Error fetching training data');
    }
    
    const data = await response.json();
    
    return {
      props: {
        training: data.data.training,
        program: data.data.program,
        testimonials: data.data.testimonials
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Datos de fallback en caso de error
    return {
      props: {
        training: {
          tipo: 'SwingTrading',
          nombre: 'Swing Trading',
          descripcion: 'Experiencia de aprendizaje premium, personalizada y con acompañamiento constante, donde aprenderás a operar movimientos de varios días o semanas, identificando oportunidades con análisis técnico y estrategias que combinan precisión y paciencia',
          precio: 497,
          duracion: 40,
          metricas: {
            rentabilidad: '120%',
            estudiantesActivos: '850',
            entrenamientosRealizados: '150',
            satisfaccion: '4.8'
          },
          contenido: {
            modulos: 12,
            lecciones: 85,
            certificacion: true,
            nivelAcceso: 'Básico a Intermedio'
          }
        },
        program: [],
        testimonials: []
      }
    };
  }
};

export default SwingTradingPage; 