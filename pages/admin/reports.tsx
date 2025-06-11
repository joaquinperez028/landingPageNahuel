import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../../styles/AdminReports.module.css';

interface Report {
  id: string;
  title: string;
  type: 'informe' | 'video' | 'analisis';
  summary: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  readTime?: number;
  views: number;
  isFeature: boolean;
  publishedAt?: string;
  createdAt: string;
  tags: string[];
}

const AdminReportsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [migrating, setMigrating] = useState(false);
  
  const [newReport, setNewReport] = useState({
    title: '',
    type: 'informe' as const,
    summary: '',
    content: '',
    status: 'draft' as const,
    tags: '',
    isFeature: false
  });

  // Verificar autenticación y permisos
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Verificar si es admin (esto deberías hacerlo en el servidor idealmente)
    loadReports();
  }, [session, status, router]);

  const loadReports = async () => {
    try {
      const response = await fetch('/api/reports?limit=50');
      if (response.ok) {
        const data = await response.json();
        setReports(data.data?.reports || []);
      }
    } catch (error) {
      console.error('Error al cargar informes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateReports = async () => {
    if (!confirm('¿Estás seguro de que quieres migrar los informes existentes al nuevo esquema de Cloudinary?')) {
      return;
    }

    setMigrating(true);
    try {
      const response = await fetch('/api/admin/reports/migrate', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Migración completada: ${data.data.migrados} informes migrados, ${data.data.errores} errores`);
        // Recargar informes después de la migración
        loadReports();
      } else {
        const errorData = await response.json();
        alert(`Error en migración: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error en migración:', error);
      alert('Error al ejecutar migración');
    } finally {
      setMigrating(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const tagsArray = newReport.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch('/api/admin/reports/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          ...newReport,
          tags: tagsArray
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReports(prev => [data.data.report, ...prev]);
        setNewReport({
          title: '',
          type: 'informe',
          summary: '',
          content: '',
          status: 'draft',
          tags: '',
          isFeature: false
        });
        setShowCreateForm(false);
        alert('Informe creado exitosamente');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error al crear informe:', error);
      alert('Error al crear informe');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return '#10b981';
      case 'draft': return '#f59e0b';
      case 'archived': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'analisis': return '📊';
      default: return '📄';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h2>Cargando...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin - Gestión de Informes</title>
        <meta name="description" content="Panel de administración para gestión de informes" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>📄 Gestión de Informes</h1>
            <p className={styles.subtitle}>
              {reports.length} informe{reports.length !== 1 ? 's' : ''} en total
            </p>
          </div>
          
          <div className={styles.headerActions}>
            <button 
              className={styles.migrateButton}
              onClick={handleMigrateReports}
              disabled={migrating}
              style={{
                background: migrating ? '#6b7280' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: migrating ? 'not-allowed' : 'pointer',
                marginRight: '1rem'
              }}
            >
              {migrating ? '⏳ Migrando...' : '🔄 Migrar Informes'}
            </button>
            
            <button 
              className={styles.createButton}
              onClick={() => setShowCreateForm(true)}
            >
              + Crear Informe
            </button>
          </div>
        </div>

        {/* Mensaje de ayuda sobre migración */}
        {reports.length === 0 && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            color: '#d97706'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#d97706' }}>
              ⚠️ No se encontraron informes
            </h3>
            <p style={{ margin: 0 }}>
              Si tenías informes creados anteriormente, es posible que necesites ejecutar la migración 
              para actualizar el esquema de base de datos al nuevo sistema de Cloudinary.
            </p>
          </div>
        )}

        {/* Modal de creación */}
        {showCreateForm && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>Crear Nuevo Informe</h2>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateReport} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Título *</label>
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport(prev => ({...prev, title: e.target.value}))}
                    required
                    maxLength={200}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tipo *</label>
                    <select
                      value={newReport.type}
                      onChange={(e) => setNewReport(prev => ({...prev, type: e.target.value as any}))}
                    >
                      <option value="informe">📄 Informe</option>
                      <option value="video">🎥 Video</option>
                      <option value="analisis">📊 Análisis</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Estado</label>
                    <select
                      value={newReport.status}
                      onChange={(e) => setNewReport(prev => ({...prev, status: e.target.value as any}))}
                    >
                      <option value="draft">Borrador</option>
                      <option value="published">Publicado</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Resumen *</label>
                  <textarea
                    value={newReport.summary}
                    onChange={(e) => setNewReport(prev => ({...prev, summary: e.target.value}))}
                    required
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Contenido *</label>
                  <textarea
                    value={newReport.content}
                    onChange={(e) => setNewReport(prev => ({...prev, content: e.target.value}))}
                    required
                    rows={8}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tags (separados por comas)</label>
                  <input
                    type="text"
                    value={newReport.tags}
                    onChange={(e) => setNewReport(prev => ({...prev, tags: e.target.value}))}
                    placeholder="trading, analisis, mercados"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={newReport.isFeature}
                      onChange={(e) => setNewReport(prev => ({...prev, isFeature: e.target.checked}))}
                    />
                    Marcar como destacado
                  </label>
                </div>

                <div className={styles.formActions}>
                  <button type="button" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={creating}>
                    {creating ? 'Creando...' : 'Crear Informe'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de informes */}
        <div className={styles.reportsList}>
          {reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.id} className={styles.reportCard}>
                <div className={styles.reportHeader}>
                  <div className={styles.reportTitle}>
                    <span className={styles.typeIcon}>{getTypeIcon(report.type)}</span>
                    <h3>{report.title}</h3>
                    {report.isFeature && <span className={styles.featuredBadge}>⭐</span>}
                  </div>
                  <div 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(report.status) }}
                  >
                    {report.status}
                  </div>
                </div>

                <p className={styles.reportSummary}>{report.summary}</p>

                <div className={styles.reportMeta}>
                  <span>Por {report.author}</span>
                  <span>{report.readTime} min lectura</span>
                  <span>{report.views} vistas</span>
                  <span>{new Date(report.createdAt).toLocaleDateString('es-ES')}</span>
                </div>

                {report.tags && report.tags.length > 0 && (
                  <div className={styles.tags}>
                    {report.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <h3>No hay informes disponibles</h3>
              <p>Comienza creando tu primer informe o ejecuta la migración si tenías informes anteriores.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminReportsPage; 