import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import Head from 'next/head';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download,
  Calendar,
  DollarSign,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import User from '@/models/User';
import styles from '@/styles/AdminUsers.module.css';
import { toast } from 'react-hot-toast';
import connectDB from '@/lib/mongodb';

export default function AdminBillingExportPage() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const exportBillingData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        from: dateRange.from,
        to: dateRange.to
      });

      const response = await fetch(`/api/admin/billing/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facturacion-${dateRange.from}-${dateRange.to}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Archivo exportado correctamente');
      } else {
        toast.error('Error al exportar datos');
      }
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Exportar Facturación - Admin Dashboard</title>
        <meta name="description" content="Exportar datos de facturación para reportes" />
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
                  <Download size={40} />
                </div>
                <div>
                  <h1 className={styles.title}>Exportar Facturación</h1>
                  <p className={styles.subtitle}>
                    Genera reportes de facturación en Excel con datos de usuarios y pagos
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

            {/* Export Form */}
            <div className={styles.tableContainer}>
              <div style={{ padding: '2rem' }}>
                <div className={styles.subscriptionStats}>
                  <h3>Configuración de Exportación</h3>
                  
                  <div className={styles.filtersSection}>
                    <div className={styles.filters} style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                      <div className={styles.formGroup}>
                        <label style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'block' }}>
                          Fecha Desde
                        </label>
                        <input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                          className={styles.searchInput}
                          style={{ width: '100%' }}
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'block' }}>
                          Fecha Hasta
                        </label>
                        <input
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                          className={styles.searchInput}
                          style={{ width: '100%' }}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label style={{ color: 'transparent', marginBottom: '0.5rem', display: 'block' }}>
                          Acción
                        </label>
                        <button
                          onClick={exportBillingData}
                          disabled={loading}
                          className={`${styles.actionButton} ${styles.primary}`}
                        >
                          <Download size={20} />
                          {loading ? 'Exportando...' : 'Exportar Excel'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className={styles.subscriptionCard} style={{ marginTop: '2rem', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <div className={styles.subscriptionIcon} style={{ backgroundColor: '#3b82f6' }}>
                      <AlertCircle size={20} />
                    </div>
                    <div className={styles.subscriptionInfo}>
                      <h4>Información del Archivo</h4>
                      <p>El archivo Excel contendrá las siguientes columnas:</p>
                      <ul style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <li>• Nombre y Apellido</li>
                        <li>• Email</li>
                        <li>• CUIT/CUIL (si está disponible)</li>
                        <li>• Monto Abonado</li>
                        <li>• Fecha de Pago</li>
                        <li>• Tipo de Suscripción</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FileText size={24} className={styles.iconBlue} />
                </div>
                <div className={styles.statInfo}>
                  <h3>Excel</h3>
                  <p>Formato de Exportación</p>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Calendar size={24} className={styles.iconGreen} />
                </div>
                <div className={styles.statInfo}>
                  <h3>Mensual</h3>
                  <p>Frecuencia Recomendada</p>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <DollarSign size={24} className={styles.iconGold} />
                </div>
                <div className={styles.statInfo}>
                  <h3>Completo</h3>
                  <p>Datos Financieros</p>
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
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }

  // Verificar que el usuario es admin
  try {
    await connectDB();
    const user = await User.findOne({ email: session.user?.email });
    if (!user || user.role !== 'admin') {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
  } catch (error) {
    console.error('Error al verificar usuario admin:', error);
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}; 