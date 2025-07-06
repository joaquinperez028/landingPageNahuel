import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { verifyAdminAccess } from '@/lib/adminAuth';
import Head from 'next/head';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Send,
  Users,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import User from '@/models/User';
import styles from '@/styles/AdminUsers.module.css';
import { toast } from 'react-hot-toast';

export default function AdminBulkEmailPage() {
  const [loading, setLoading] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipients: 'all' // all, suscriptores, admins
  });
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  const sendBulkEmail = async () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      toast.error('Por favor completa el asunto y el mensaje');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/email/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Email enviado a ${result.sentCount} usuarios`);
        setEmailData({ subject: '', message: '', recipients: 'all' });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al enviar emails');
      }
    } catch (error) {
      console.error('Error al enviar emails:', error);
      toast.error('Error al enviar emails');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async (testType: string) => {
    if (!testEmail.trim()) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    try {
      setTestLoading(true);
      const response = await fetch('/api/admin/email/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testType, email: testEmail }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Email de prueba enviado exitosamente');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al enviar email de prueba');
      }
    } catch (error) {
      console.error('Error al enviar email de prueba:', error);
      toast.error('Error al enviar email de prueba');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Envío Masivo de Emails - Admin Dashboard</title>
        <meta name="description" content="Enviar emails masivos a usuarios del sistema" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.headerIcon}>
                  <Mail size={40} />
                </div>
                <div>
                  <h1 className={styles.title}>Envío Masivo de Emails</h1>
                  <p className={styles.subtitle}>
                    Envía comunicaciones importantes a grupos de usuarios
                  </p>
                </div>
              </div>
              <div className={styles.headerActions}>
                <Link 
                  href="/admin/dashboard"
                  className={`${styles.actionButton} ${styles.secondary}`}
                >
                  <ArrowLeft size={20} />
                  Volver al Dashboard
                </Link>
              </div>
            </div>

            {/* Email Form */}
            <div className={styles.tableContainer}>
              <div style={{ padding: '2rem' }}>
                <div className={styles.subscriptionStats}>
                  <h3>Configuración del Email</h3>
                  
                  <div className={styles.filtersSection}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Recipients */}
                      <div className={styles.formGroup}>
                        <label style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'block' }}>
                          Destinatarios
                        </label>
                        <select
                          value={emailData.recipients}
                          onChange={(e) => setEmailData(prev => ({ ...prev, recipients: e.target.value }))}
                          className={styles.searchInput}
                          style={{ width: '300px' }}
                        >
                          <option value="all">Todos los usuarios</option>
                          <option value="suscriptores">Solo suscriptores</option>
                          <option value="admins">Solo administradores</option>
                        </select>
                      </div>

                      {/* Subject */}
                      <div className={styles.formGroup}>
                        <label style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'block' }}>
                          Asunto del Email
                        </label>
                        <input
                          type="text"
                          value={emailData.subject}
                          onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Ej: Actualización importante del sistema"
                          className={styles.searchInput}
                          style={{ width: '100%' }}
                        />
                      </div>

                      {/* Message */}
                      <div className={styles.formGroup}>
                        <label style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'block' }}>
                          Mensaje
                        </label>
                        <textarea
                          value={emailData.message}
                          onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Escribe tu mensaje aquí..."
                          className={styles.searchInput}
                          style={{ 
                            width: '100%', 
                            minHeight: '200px', 
                            resize: 'vertical',
                            fontFamily: 'inherit'
                          }}
                        />
                      </div>

                      {/* Send Button */}
                      <div className={styles.formGroup}>
                        <button
                          onClick={sendBulkEmail}
                          disabled={loading || !emailData.subject.trim() || !emailData.message.trim()}
                          className={`${styles.actionButton} ${styles.primary}`}
                          style={{ width: 'auto' }}
                        >
                          <Send size={20} />
                          {loading ? 'Enviando...' : 'Enviar Email Masivo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className={styles.subscriptionCard} style={{ marginTop: '2rem', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                    <div className={styles.subscriptionIcon} style={{ backgroundColor: '#f59e0b' }}>
                      <AlertCircle size={20} />
                    </div>
                    <div className={styles.subscriptionInfo}>
                      <h4>Importante</h4>
                      <p>Usa esta función con responsabilidad:</p>
                      <ul style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <li>• Verifica el contenido antes de enviar</li>
                        <li>• El envío no se puede deshacer</li>
                        <li>• Se enviará a todos los usuarios del grupo seleccionado</li>
                        <li>• Evita el spam respetando la frecuencia de envíos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Mail size={24} className={styles.iconBlue} />
                </div>
                <div className={styles.statInfo}>
                  <h3>Email</h3>
                  <p>Canal de Comunicación</p>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Users size={24} className={styles.iconGreen} />
                </div>
                <div className={styles.statInfo}>
                  <h3>Masivo</h3>
                  <p>Alcance del Envío</p>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CheckCircle size={24} className={styles.iconGold} />
                </div>
                <div className={styles.statInfo}>
                  <h3>Eficiente</h3>
                  <p>Comunicación Directa</p>
                </div>
              </div>
            </div>

            {/* Test de Emails de Reservas */}
            <div className={styles.tableContainer} style={{ marginTop: '2rem' }}>
              <div style={{ padding: '2rem' }}>
                <div className={styles.subscriptionStats}>
                  <h3>🧪 Test de Emails de Reservas</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Prueba los emails de confirmación de reservas y notificaciones
                  </p>
                  
                  <div className={styles.filtersSection}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Test Email Input */}
                      <div className={styles.formGroup}>
                        <label style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'block' }}>
                          📧 Email de Prueba
                        </label>
                        <input
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="usuario@ejemplo.com"
                          className={styles.searchInput}
                          style={{ width: '100%', maxWidth: '400px' }}
                        />
                      </div>

                      {/* Test Buttons */}
                      <div className={styles.formGroup}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleTestEmail('simple')}
                            disabled={testLoading || !testEmail}
                            className={`${styles.actionButton} ${styles.primary}`}
                            style={{ width: 'auto' }}
                          >
                            <CheckCircle size={20} />
                            {testLoading ? 'Enviando...' : '📧 Test Simple'}
                          </button>
                          
                          <button
                            onClick={() => handleTestEmail('advisory_confirmation')}
                            disabled={testLoading || !testEmail}
                            className={`${styles.actionButton} ${styles.secondary}`}
                            style={{ width: 'auto' }}
                          >
                            <Mail size={20} />
                            {testLoading ? 'Enviando...' : '🩺 Test Confirmación Asesoría'}
                          </button>
                          
                          <button
                            onClick={() => handleTestEmail('admin_notification')}
                            disabled={testLoading || !testEmail}
                            className={`${styles.actionButton} ${styles.tertiary}`}
                            style={{ width: 'auto' }}
                          >
                            <AlertCircle size={20} />
                            {testLoading ? 'Enviando...' : '🔔 Test Notificación Admin'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Test Info */}
                  <div className={styles.subscriptionCard} style={{ marginTop: '2rem', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                    <div className={styles.subscriptionIcon} style={{ backgroundColor: '#10b981' }}>
                      <CheckCircle size={20} />
                    </div>
                    <div className={styles.subscriptionInfo}>
                      <h4>Información de Test</h4>
                      <ul style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <li>• <strong>Test Simple:</strong> Email básico de prueba para verificar configuración SMTP</li>
                        <li>• <strong>Test Confirmación Asesoría:</strong> Email que recibe el usuario al reservar una asesoría</li>
                        <li>• <strong>Test Notificación Admin:</strong> Email que recibe el administrador cuando hay una nueva reserva</li>
                        <li>• Los emails de test usan datos de ejemplo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log('🔍 [BULK EMAIL] Iniciando verificación de acceso...');
  
  try {
    // Usar la función de verificación que ya sabemos que funciona
    const verification = await verifyAdminAccess(context);
    
    console.log('🔍 [BULK EMAIL] Resultado de verificación:', verification);
    
    if (!verification.isAdmin) {
      console.log('❌ [BULK EMAIL] Acceso denegado - redirigiendo a:', verification.redirectTo);
      return {
        redirect: {
          destination: verification.redirectTo || '/',
          permanent: false,
        },
      };
    }

    console.log('✅ [BULK EMAIL] Acceso de admin confirmado para:', verification.user?.email);
    
    return {
      props: {
        user: verification.user,
      },
    };

  } catch (error) {
    console.error('💥 [BULK EMAIL] Error en getServerSideProps:', error);
    
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }
}; 