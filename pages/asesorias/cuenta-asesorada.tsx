import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { useSession, signIn } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  CheckCircle,
  ArrowRight,
  Building2,
  Shield,
  TrendingUp,
  Star,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  User,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import styles from '@/styles/CuentaAsesorada.module.css';
import YouTubePlayer from '@/components/YouTubePlayer';

interface CuentaAsesoradaPageProps {
  brokers: Array<{
    nombre: string;
    logo: string;
    descripcion: string;
    caracteristicas: string[];
    rating: number;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export default function CuentaAsesorada() {
  const { data: session } = useSession();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      <Head>
        <title>Cuenta Asesorada - Gestión Profesional de Inversiones | Nahuel Lozano</title>
        <meta name="description" content="Servicio Premium de gestión profesional de tu cuenta de inversiones. Estrategias personalizadas, seguimiento continuo y optimización mensual de tu portafolio." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>Cuenta Asesorada</h1>
              <p className={styles.heroDescription}>
                Servicio integral de inversión con gestión profesional, donde te recomendamos como manejar tu portafolio con estrategias avanzadas y reportes detallados.
              </p>
              <a href="#formulario-turno" className={styles.heroButtonGold}>
                Agendar Turno &gt;
              </a>
            </div>
            <div className={styles.heroVideo}>
              <div className={styles.videoContainer}>
                <YouTubePlayer
                  videoId="dQw4w9WgXcQ"
                  title="Cuenta Asesorada - Introducción"
                  autoplay={false}
                  muted={true}
                  loop={false}
                  className={styles.videoPlayer}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Brokers */}
        <section className={styles.brokersSection} id="brokers-section">
          <div className={styles.brokersContainer}>
            <h2 className={styles.brokersTitle}>Nuestros Brokers Recomendados</h2>
            <p className={styles.brokersSubtitle}>Elige el broker que mejor se adapte a tu perfil de inversor</p>
            
            <div className={styles.brokersGrid}>
              {/* Tarjeta Inviu */}
              <div className={styles.brokerCard}>
                <div className={styles.brokerHeader}>
                  <div className={styles.brokerLogoPlaceholder}>
                    {/* Espacio reservado para logo de Inviu */}
                  </div>
                  <h3 className={styles.brokerName}>Inviu</h3>
                </div>
                <div className={styles.brokerContent}>
                  <p className={styles.brokerDescription}>
                    Es una plataforma orientada a inversores novatos, con muchas opciones de inversión para cada perfil
                  </p>
                  <ul className={styles.brokerFeatures}>
                    <li>Plataforma intuitiva para principiantes</li>
                    <li>Fácil de usar tanto en web cómo en celular</li>
                    <li>Principales activos de la bolsa</li>
                  </ul>
                </div>
                <button className={styles.brokerButton}>Registrarme &gt;</button>
              </div>

              {/* Tarjeta Bull Market Brokers */}
              <div className={styles.brokerCard}>
                <div className={styles.brokerHeader}>
                  <div className={styles.brokerLogoPlaceholder}>
                    {/* Espacio reservado para logo de Bull Market Brokers */}
                  </div>
                  <h3 className={styles.brokerName}>Bull Market Brokers</h3>
                </div>
                <div className={styles.brokerContent}>
                  <p className={styles.brokerDescription}>
                    Ideal para operar activos tanto nacionales como internacionales. Sin necesidad de abrir cuenta en el exterior
                  </p>
                  <ul className={styles.brokerFeatures}>
                    <li>Plataforma de nivel moderado</li>
                    <li>Permite operar activos internacionales sin tener cuenta en USA</li>
                    <li>Amplia oferta de FCIs</li>
                  </ul>
                </div>
                <button className={styles.brokerButton}>Registrarme &gt;</button>
              </div>

              {/* Tarjeta Balanz */}
              <div className={styles.brokerCard}>
                <div className={styles.brokerHeader}>
                  <div className={styles.brokerLogoPlaceholder}>
                    {/* Espacio reservado para logo de Balanz */}
                  </div>
                  <h3 className={styles.brokerName}>Balanz</h3>
                </div>
                <div className={styles.brokerContent}>
                  <p className={styles.brokerDescription}>
                    Broker intuitivo y fácil de usar. Brinda muy buenos informes y oportunidades de licitación en el mercado primario
                  </p>
                  <ul className={styles.brokerFeatures}>
                    <li>Plataforma fácil de usar para novatos</li>
                    <li>Excelentes informes realizados por el broker sobre sectores de inversión</li>
                    <li>Acceso a oportunidades del mercado primario</li>
                  </ul>
                </div>
                <button className={styles.brokerButton}>Registrarme &gt;</button>
              </div>
            </div>
          </div>
        </section>

        {/* Formulario de Turno */}
        <section className={styles.formularioSection} id="formulario-turno">
          <div className={styles.formularioContainer}>
            <h2 className={styles.formularioTitulo}>
              Si ya tenes cuenta en estos brokers<br/>
              necesitas realizar el cambio de asesor
            </h2>
            
            <div className={styles.formularioCard}>
              <h3 className={styles.formularioSubtitulo}>
                Enviame Un Correo Y Te Indico Como<br/>
                Realizarlo.
              </h3>
              
              <form className={styles.formulario}>
                <div className={styles.formularioGrid}>
                  <div className={styles.campoFormulario}>
                    <label htmlFor="nombre" className={styles.labelFormulario}>
                      Nombre <span className={styles.asterisco}>*</span>
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      className={styles.inputFormulario}
                      required
                    />
                  </div>
                  
                  <div className={styles.campoFormulario}>
                    <label htmlFor="apellido" className={styles.labelFormulario}>
                      Apellido <span className={styles.asterisco}>*</span>
                    </label>
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      className={styles.inputFormulario}
                      required
                    />
                  </div>
                  
                  <div className={styles.campoFormulario}>
                    <label htmlFor="email" className={styles.labelFormulario}>
                      Correo electrónico <span className={styles.asterisco}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={styles.inputFormulario}
                      required
                    />
                  </div>
                  
                  <div className={styles.campoFormulario}>
                    <label htmlFor="comitente" className={styles.labelFormulario}>
                      Número de Comitente <span className={styles.asterisco}>*</span>
                    </label>
                    <input
                      type="text"
                      id="comitente"
                      name="comitente"
                      className={styles.inputFormulario}
                      required
                    />
                  </div>
                  
                  <div className={styles.campoFormulario}>
                    <label htmlFor="broker" className={styles.labelFormulario}>
                      Cual es tu broker? <span className={styles.asterisco}>*</span>
                    </label>
                    <select
                      id="broker"
                      name="broker"
                      className={styles.selectFormulario}
                      required
                    >
                      <option value="INVIU">INVIU</option>
                      <option value="BULLMARKET">BULL MARKET BROKERS</option>
                      <option value="BALANZ">BALANZ</option>
                    </select>
                  </div>
                  
                  <div className={styles.campoFormulario}>
                    <label htmlFor="mensaje" className={styles.labelFormulario}>
                      Mensaje:
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      className={styles.textareaFormulario}
                      rows={4}
                      defaultValue="Quiero que seas mi asesor."
                    ></textarea>
                  </div>
                </div>
                
                <div className={styles.checkboxContainer}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="terminos"
                      className={styles.checkboxFormulario}
                      required
                    />
                    <span className={styles.checkboxText}>
                      Acepto los <a href="/terminos" className={styles.terminosLink}>Términos y condiciones</a>
                    </span>
                  </label>
                </div>
                
                <button type="submit" className={styles.botonEnviar}>
                  ENVIAR
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Preguntas Frecuentes */}
        <section className={styles.faqSection}>
          <div className={styles.faqContainer}>
            <h2 className={styles.faqTitle}>PREGUNTAS FRECUENTES</h2>
            
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <button className={styles.faqQuestion} onClick={() => toggleFaq(0)}>
                  <span>¿En que consiste tener a Nahuel cómo asesor?</span>
                  <span className={styles.faqIcon}>+</span>
                </button>
                <div className={`${styles.faqAnswer} ${openFaq === 0 ? styles.faqOpen : ''}`}>
                  <p>Nahuel te brinda gestión profesional de tu portafolio, recomendaciones personalizadas, reportes detallados y estrategias avanzadas de inversión.</p>
                </div>
              </div>

              <div className={styles.faqItem}>
                <button className={styles.faqQuestion} onClick={() => toggleFaq(1)}>
                  <span>Nahuel comparte:</span>
                  <span className={styles.faqIcon}>+</span>
                </button>
                <div className={`${styles.faqAnswer} ${openFaq === 1 ? styles.faqOpen : ''}`}>
                  <p>Nahuel comparte su experiencia y conocimiento del mercado para ayudarte a tomar decisiones informadas de inversión.</p>
                </div>
              </div>

              <div className={styles.faqItem}>
                <button className={styles.faqQuestion} onClick={() => toggleFaq(2)}>
                  <span>¿Qué plataforma me conviene?</span>
                  <span className={styles.faqIcon}>+</span>
                </button>
                <div className={`${styles.faqAnswer} ${openFaq === 2 ? styles.faqOpen : ''}`}>
                  <p>La elección depende de tu perfil de inversor. Inviu es ideal para principiantes, Bull Market para activos internacionales, y Balanz para informes detallados.</p>
                </div>
              </div>

              <div className={styles.faqItem}>
                <button className={styles.faqQuestion} onClick={() => toggleFaq(3)}>
                  <span>¿Puedo tener más de un broker?</span>
                  <span className={styles.faqIcon}>+</span>
                </button>
                <div className={`${styles.faqAnswer} ${openFaq === 3 ? styles.faqOpen : ''}`}>
                  <p>Sí, puedes tener cuentas en múltiples brokers para diversificar tus inversiones y aprovechar las mejores ofertas de cada plataforma.</p>
                </div>
              </div>

              <div className={styles.faqItem}>
                <button className={styles.faqQuestion} onClick={() => toggleFaq(4)}>
                  <span>¿Cómo puedo cambiar de asesor?</span>
                  <span className={styles.faqIcon}>+</span>
                </button>
                <div className={`${styles.faqAnswer} ${openFaq === 4 ? styles.faqOpen : ''}`}>
                  <p>Completa el formulario de cambio de asesor y te guiaremos paso a paso en el proceso de transferencia.</p>
                </div>
              </div>

              <div className={styles.faqItem}>
                <button className={styles.faqQuestion} onClick={() => toggleFaq(5)}>
                  <span>¿Puedo hacer consultas de un broker el cual Marcos no tiene convenio?</span>
                  <span className={styles.faqIcon}>+</span>
                </button>
                <div className={`${styles.faqAnswer} ${openFaq === 5 ? styles.faqOpen : ''}`}>
                  <p>Nuestro servicio está optimizado para los brokers con los que tenemos convenio, pero podemos asesorarte sobre otros brokers según tu caso específico.</p>
                </div>
              </div>

              <div className={styles.faqItem}>
                <button className={styles.faqQuestion} onClick={() => toggleFaq(6)}>
                  <span>¿Se tiene una consultoría uno a uno?</span>
                  <span className={styles.faqIcon}>+</span>
                </button>
                <div className={`${styles.faqAnswer} ${openFaq === 6 ? styles.faqOpen : ''}`}>
                  <p>Sí, ofrecemos consultorías personalizadas uno a uno para analizar tu situación específica y crear estrategias a medida.</p>
                </div>
              </div>

              <div className={styles.faqItem}>
                <button className={styles.faqQuestion} onClick={() => toggleFaq(7)}>
                  <span>¿De cuanto es la comisión a pagar por los servicios?</span>
                  <span className={styles.faqIcon}>+</span>
                </button>
                <div className={`${styles.faqAnswer} ${openFaq === 7 ? styles.faqOpen : ''}`}>
                  <p>Las comisiones varían según el servicio y el broker. Te proporcionamos información detallada durante la consulta inicial.</p>
                </div>
              </div>

              <div className={styles.faqItem}>
                <button className={styles.faqQuestion} onClick={() => toggleFaq(8)}>
                  <span>¿Tengo un mínimo de permanencia?</span>
                  <span className={styles.faqIcon}>+</span>
                </button>
                <div className={`${styles.faqAnswer} ${openFaq === 8 ? styles.faqOpen : ''}`}>
                  <p>No hay un mínimo de permanencia obligatorio. Puedes cancelar el servicio cuando lo desees, aunque recomendamos mantener la relación para mejores resultados.</p>
                </div>
              </div>

              <div className={styles.faqItem}>
                <button className={styles.faqQuestion} onClick={() => toggleFaq(9)}>
                  <span>¿Hay un mínimo de capital?</span>
                  <span className={styles.faqIcon}>+</span>
                </button>
                <div className={`${styles.faqAnswer} ${openFaq === 9 ? styles.faqOpen : ''}`}>
                  <p>No hay un mínimo de capital estricto. Trabajamos con inversores de diferentes perfiles y montos de inversión.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className={styles.ctaFinalSection}>
          <div className={styles.ctaFinalContainer}>
            <h2 className={styles.ctaFinalTitle}>
              ¿Listo para llevar tus inversiones al siguiente nivel?
            </h2>
            <p className={styles.ctaFinalSubtitle}>
              Únete a nuestra comunidad y comienza construir tu libertad financiera
            </p>
            <a href="#brokers-section" className={styles.ctaFinalButton}>
              Elegí tu Broker &gt;
            </a>
          </div>
        </section>

        {/* Sección YouTube */}
        <section className={styles.youtubeFinalSection}>
          <div className={styles.youtubeFinalContainer}>
            <div className={styles.youtubeFinalText}>
              <h2 className={styles.youtubeFinalTitle}>
                ¡Sumate a nuestra comunidad<br/>
                en YouTube!
              </h2>
              <p className={styles.youtubeFinalSubtitle}>
                No te pierdas nuestros últimos videos
              </p>
            </div>
            <div className={styles.youtubeFinalVideoContainer}>
              <button className={styles.youtubeFinalArrow} aria-label="Anterior">&#60;</button>
              <div className={styles.youtubeFinalVideoPlayer}>
                <YouTubePlayer
                  videoId="dQw4w9WgXcQ"
                  title="Cuenta Asesorada - Videos Finales"
                  autoplay={false}
                  muted={true}
                  loop={false}
                  className={styles.youtubeFinalVideoPlayer}
                />
              </div>
              <button className={styles.youtubeFinalArrow} aria-label="Siguiente">&#62;</button>
            </div>
          </div>
        </section>

        {/* Footer */}
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const brokers = [
    {
      nombre: 'Bull Market',
      logo: '/brokers/bull-market.jpg',
      descripcion: 'Broker líder en Argentina con tecnología avanzada y bajas comisiones. Especializado en inversores institucionales y cuentas de alto volumen.',
      caracteristicas: [
        'Comisiones competitivas desde 0.5%',
        'Plataforma tecnológica avanzada',
        'Acceso a mercados internacionales',
        'Soporte 24/7 para cuentas asesoradas'
      ],
      rating: 5
    },
    {
      nombre: 'Inviu',
      logo: '/brokers/inviu.jpg',
      descripcion: 'Broker innovador con enfoque en tecnología fintech. Interfaz moderna y herramientas de análisis profesional para gestión avanzada.',
      caracteristicas: [
        'Tecnología fintech de vanguardia',
        'API de trading automatizado',
        'Herramientas de análisis técnico',
        'Ejecución instantánea de órdenes'
      ],
      rating: 5
    },
    {
      nombre: 'Balanz',
      logo: '/brokers/balanz.jpg',
      descripcion: 'Broker tradicional con amplia experiencia en el mercado argentino. Solidez institucional y servicios premium para cuentas asesoradas.',
      caracteristicas: [
        'Más de 20 años de experiencia',
        'Solidez institucional garantizada',
        'Servicios premium personalizados',
        'Acceso a productos estructurados'
      ],
      rating: 5
    }
  ];

  const faqs = [
    {
      question: '¿Qué incluye exactamente el servicio de Cuenta Asesorada?',
      answer: 'El servicio incluye: gestión diaria profesional de tu cuenta, implementación de estrategias institucionales, monitoreo continuo del mercado, optimización mensual del portafolio, reportes detallados de performance y acceso directo al gestor asignado.'
    },
    {
      question: '¿Cuál es el monto mínimo para abrir una cuenta asesorada?',
      answer: 'El monto mínimo requerido es de $50,000 USD para garantizar la diversificación adecuada y la implementación efectiva de estrategias profesionales.'
    },
    {
      question: '¿Qué rentabilidad puedo esperar?',
      answer: 'Si bien los retornos pasados no garantizan resultados futuros, nuestras cuentas asesoradas han mostrado un rendimiento promedio del 18-25% anual, superando consistentemente los índices de referencia.'
    },
    {
      question: '¿Tengo control sobre mi cuenta?',
      answer: 'Mantienes la propiedad total de tu cuenta. Nosotros operamos bajo poder de gestión limitado, y puedes revisar todas las operaciones en tiempo real. Puedes terminar el servicio en cualquier momento.'
    },
    {
      question: '¿Con qué frecuencia recibo reportes?',
      answer: 'Recibes reportes mensuales detallados con análisis de performance, distribución de activos, operaciones realizadas y estrategia para el mes siguiente. También tienes acceso 24/7 a la plataforma para monitorear tu cuenta.'
    },
    {
      question: '¿Qué estrategias de inversión utilizan?',
      answer: 'Implementamos estrategias diversificadas que incluyen: análisis fundamental y técnico, gestión de riesgo avanzada, rotación sectorial, trading de momentum, y aprovechamiento de ineficiencias del mercado.'
    },
    {
      question: '¿Puedo cambiar de broker una vez iniciado el servicio?',
      answer: 'Sí, trabajamos con múltiples brokers. Si necesitas cambiar, te asistimos en el proceso de transferencia sin interrumpir la gestión de tu portafolio.'
    },
    {
      question: '¿Qué pasa si no estoy satisfecho con el servicio?',
      answer: 'Ofrecemos una garantía de satisfacción de 30 días. Si no estás conforme con el servicio durante el primer mes, te devolvemos la tarifa completa sin preguntas.'
    }
  ];

  return {
    props: {
      brokers,
      faqs
    }
  };
}; 