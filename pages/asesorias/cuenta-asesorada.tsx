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

const CuentaAsesoradaPage: React.FC<CuentaAsesoradaPageProps> = ({ 
  brokers, 
  faqs 
}) => {
  const { data: session } = useSession();
  const [selectedBroker, setSelectedBroker] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    numeroComitente: '',
    broker: '',
    aceptaTerminos: false
  });

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleBrokerSelect = (brokerNombre: string) => {
    setSelectedBroker(brokerNombre);
    setFormData({ ...formData, broker: brokerNombre });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setShowLoginAlert(true);
      return;
    }

    // Validaciones
    if (!formData.nombre || !formData.apellido || !formData.email || 
        !formData.numeroComitente || !formData.broker) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!formData.aceptaTerminos) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    // Redirect to payment with form data
    const params = new URLSearchParams({
      ...formData,
      aceptaTerminos: formData.aceptaTerminos.toString()
    });
    window.location.href = `/pago/cuenta-asesorada?${params.toString()}`;
  };

  const handleLogin = () => {
    signIn('google');
    setShowLoginAlert(false);
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
        {/* Hero Section con Video Explicativo */}
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.heroContent}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>
                  Cuenta Asesorada
                  <span className={styles.heroSubtitle}>Gestión Profesional de Inversiones</span>
                </h1>
                <p className={styles.heroDescription}>
                  Servicio Premium donde gestionamos profesionalmente tu cuenta de inversiones. 
                  Estrategias avanzadas, monitoreo continuo y optimización mensual para maximizar tus retornos.
                </p>
                <div className={styles.heroPricing}>
                  <div className={styles.priceCard}>
                    <span className={styles.priceBadge}>Premium</span>
                    <span className={styles.priceAmount}>$999 USD</span>
                    <span className={styles.priceDescription}>Servicio mensual</span>
                    <span className={styles.priceIncludes}>Gestión completa + reportes detallados</span>
                  </div>
                </div>
                <div className={styles.heroFeatures}>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Gestión profesional diaria de tu cuenta</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Estrategias institucionales adaptadas</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Reportes mensuales detallados</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Acceso directo con el gestor</span>
                  </div>
                </div>
              </div>
              <div className={styles.heroVideo}>
                <div className={styles.videoContainer}>
                  {/* Placeholder de video explicativo */}
                  <div className={styles.videoPlaceholder}>
                    <div className={styles.placeholderIcon}>📊</div>
                    <h3 className={styles.placeholderTitle}>Video: Explicación de la Asesoría</h3>
                    <p className={styles.placeholderText}>
                      Descubre cómo la gestión profesional puede transformar tu estrategia de inversión
                    </p>
                    <div className={styles.placeholderFeatures}>
                      <span>💼 Gestión Profesional</span>
                      <span>📈 Estrategias Avanzadas</span>
                      <span>📊 Reportes Detallados</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Brokers Section */}
        <section className={styles.brokersSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Brokers Compatibles
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Trabajamos con los mejores brokers del mercado para garantizar la mejor ejecución
            </motion.p>
            
            <div className={styles.brokersGrid}>
              {brokers.map((broker, index) => (
                <motion.div 
                  key={index}
                  className={`${styles.brokerCard} ${selectedBroker === broker.nombre ? styles.brokerSelected : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  onClick={() => handleBrokerSelect(broker.nombre)}
                >
                  <div className={styles.brokerHeader}>
                    <div className={styles.brokerLogo}>
                      <Building2 size={40} />
                    </div>
                    <div className={styles.brokerInfo}>
                      <h3 className={styles.brokerNombre}>{broker.nombre}</h3>
                      <div className={styles.brokerRating}>
                        {[...Array(broker.rating)].map((_, i) => (
                          <Star key={i} size={16} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className={styles.brokerDescripcion}>{broker.descripcion}</p>
                  <div className={styles.brokerCaracteristicas}>
                    {broker.caracteristicas.map((caracteristica, idx) => (
                      <div key={idx} className={styles.caracteristica}>
                        <CheckCircle size={16} />
                        <span>{caracteristica}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Formulario Cambio de Asesor */}
        <section className={styles.formularioSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Formulario Cambio de Asesor
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Completa tus datos para comenzar con la gestión profesional de tu cuenta
            </motion.p>
            
            <motion.div 
              className={styles.formularioContainer}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <form className={styles.formulario} onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <User size={20} />
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <User size={20} />
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="Tu apellido"
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Mail size={20} />
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <FileText size={20} />
                      Número de Comitente *
                    </label>
                    <input
                      type="text"
                      name="numeroComitente"
                      value={formData.numeroComitente}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="Ej: 12345678"
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Building2 size={20} />
                      Broker *
                    </label>
                    <select
                      name="broker"
                      value={formData.broker}
                      onChange={handleInputChange}
                      className={styles.formSelect}
                      required
                    >
                      <option value="">Selecciona tu broker</option>
                      <option value="Bull Market">Bull Market</option>
                      <option value="Inviu">Inviu</option>
                      <option value="Balanz">Balanz</option>
                    </select>
                  </div>
                </div>
                
                <div className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    name="aceptaTerminos"
                    id="aceptaTerminos"
                    checked={formData.aceptaTerminos}
                    onChange={handleInputChange}
                    className={styles.checkbox}
                    required
                  />
                  <label htmlFor="aceptaTerminos" className={styles.checkboxLabel}>
                    Acepto los{' '}
                    <Link href="/terminos" className={styles.link}>
                      términos y condiciones
                    </Link>
                    {' '}del servicio de gestión profesional *
                  </label>
                </div>

                {showLoginAlert && (
                  <div className={styles.loginAlert}>
                    <AlertCircle size={20} />
                    <span>Necesitas una cuenta para contratar este servicio</span>
                    <button 
                      type="button"
                      className={styles.loginButton}
                      onClick={handleLogin}
                    >
                      <User size={20} />
                      Iniciar Sesión
                    </button>
                  </div>
                )}

                {session ? (
                  <button 
                    type="submit"
                    className={styles.submitButton}
                  >
                    Contratar Servicio Premium
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <button 
                    type="button"
                    className={styles.loginRequiredButton}
                    onClick={() => setShowLoginAlert(true)}
                  >
                    <User size={20} />
                    Iniciar Sesión para Continuar
                  </button>
                )}
              </form>
            </motion.div>
          </div>
        </section>

        {/* Preguntas Frecuentes */}
        <section className={styles.faqSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Preguntas Frecuentes
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Resolvemos las dudas más comunes sobre la Cuenta Asesorada
            </motion.p>
            
            <div className={styles.faqContainer}>
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  className={styles.faqItem}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button 
                    className={styles.faqQuestion}
                    onClick={() => toggleFaq(index)}
                  >
                    <span>{faq.question}</span>
                    {openFaq === index ? 
                      <ChevronUp size={20} /> : 
                      <ChevronDown size={20} />
                    }
                  </button>
                  
                  {openFaq === index && (
                    <motion.div 
                      className={styles.faqAnswer}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
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

export default CuentaAsesoradaPage; 