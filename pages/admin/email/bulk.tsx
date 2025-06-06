import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Send, 
  Users,
  FileText,
  ArrowLeft
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import User from '@/models/User';
import styles from '@/styles/AdminEmail.module.css';
import { toast } from 'react-hot-toast';

export default function AdminEmailBulkPage() {
  const [emailData, setEmailData] = useState({
    subject: '',
    content: '',
    recipient: 'all' // all, suscriptors, normal
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailData.subject || !emailData.content) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      setSending(true);
      
      const response = await fetch('/api/admin/email/send-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Email enviado exitosamente a ${data.sentCount} usuarios`);
        setEmailData({ subject: '', content: '', recipient: 'all' });
      } else {
        toast.error('Error al enviar email');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar email');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Head>
        <title>Envío Masivo de Emails - Admin Dashboard</title>
        <meta name="description" content="Envío masivo de emails a usuarios" />
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
                    Envía comunicaciones personalizadas a tus usuarios
                  </p>
                </div>
              </div>
              <div className={styles.headerActions}>
                <Link 
                  href="/admin/database"
                  className={`${styles.actionButton} ${styles.secondary}`}
                >
                  <ArrowLeft size={20} />
                  Volver
                </Link>
              </div>
            </div>

            {/* Email Form */}
            <div className={styles.formCard}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Destinatarios:</label>
                  <select
                    value={emailData.recipient}
                    onChange={(e) => setEmailData({...emailData, recipient: e.target.value})}
                    className={styles.select}
                  >
                    <option value="all">Todos los usuarios</option>
                    <option value="suscriptor">Solo suscriptores</option>
                    <option value="normal">Solo usuarios normales</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Asunto:</label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                    placeholder="Asunto del email..."
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Contenido:</label>
                  <textarea
                    value={emailData.content}
                    onChange={(e) => setEmailData({...emailData, content: e.target.value})}
                    placeholder="Escribe tu mensaje aquí..."
                    rows={10}
                    className={styles.textarea}
                    required
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    disabled={sending}
                    className={`${styles.submitButton} ${styles.primary}`}
                  >
                    <Send size={20} />
                    {sending ? 'Enviando...' : 'Enviar Email'}
                  </button>
                </div>
              </form>
            </div>

            {/* Info Cards */}
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <Users size={24} className={styles.iconBlue} />
                </div>
                <div className={styles.infoContent}>
                  <h3>Segmentación</h3>
                  <p>Envía emails a grupos específicos de usuarios según su rol</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <FileText size={24} className={styles.iconGreen} />
                </div>
                <div className={styles.infoContent}>
                  <h3>Personalización</h3>
                  <p>Los emails incluyen el nombre del usuario automáticamente</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <Mail size={24} className={styles.iconPurple} />
                </div>
                <div className={styles.infoContent}>
                  <h3>Entrega Confiable</h3>
                  <p>Sistema robusto de envío con confirmación de entrega</p>
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
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }

  // Verificar que el usuario sea administrador
  const user = await User.findOne({ email: session.user?.email });
  if (!user || user.role !== 'admin') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}; 