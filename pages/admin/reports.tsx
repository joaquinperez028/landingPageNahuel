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
        <title>Gestión de Informes - Admin</title>
      </Head>
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Gestión de Informes</h1>
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateForm(true)}
          >
            + Crear Informe
          </button>
        </div>

        {/* Formulario de creación */}
        {showCreateForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
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
                    maxLength={500}
                    rows={3}
                    placeholder="Descripción breve del informe..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Contenido *</label>
                  <textarea
                    value={newReport.content}
                    onChange={(e) => setNewReport(prev => ({...prev, content: e.target.value}))}
                    required
                    rows={10}
                    placeholder="Contenido completo del informe..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tags (separados por comas)</label>
                  <input
                    type="text"
                    value={newReport.tags}
                    onChange={(e) => setNewReport(prev => ({...prev, tags: e.target.value}))}
                    placeholder="trading, análisis, mercado"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={newReport.isFeature}
                      onChange={(e) => setNewReport(prev => ({...prev, isFeature: e.target.checked}))}
                    />
                    Marcar como destacado
                  </label>
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={() => setShowCreateForm(false)}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={creating}
                    className={styles.submitButton}
                  >
                    {creating ? 'Creando...' : 'Crear Informe'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de informes */}
        <div className={styles.reportsList}>
          {reports.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No hay informes creados</h3>
              <p>Crea tu primer informe para comenzar.</p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </>
  );
};

export default AdminReportsPage; 