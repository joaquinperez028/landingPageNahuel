import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Save, 
  X, 
  Star,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/admin/CourseCards.module.css';

interface ICourseCard {
  _id: string;
  titulo: string;
  descripcion: string;
  precio: string;
  urlDestino: string;
  imagen?: string;
  destacado: boolean;
  activo: boolean;
  orden: number;
  categoria?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface AdminCourseCardsProps {
  user: any;
}

const AdminCourseCards: React.FC<AdminCourseCardsProps> = ({ user }) => {
  const [courseCards, setCourseCards] = useState<ICourseCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<ICourseCard | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    urlDestino: '',
    imagen: '',
    destacado: false,
    activo: true,
    orden: 0,
    categoria: ''
  });

  useEffect(() => {
    fetchCourseCards();
  }, []);

  const fetchCourseCards = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/course-cards');
      if (response.ok) {
        const data = await response.json();
        setCourseCards(data);
      } else {
        setMessage({ type: 'error', text: 'Error al cargar las tarjetas de cursos' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCard ? `/api/course-cards?id=${editingCard._id}` : '/api/course-cards';
      const method = editingCard ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showMessage('success', editingCard ? 'Tarjeta actualizada correctamente' : 'Tarjeta creada correctamente');
        fetchCourseCards();
        handleCancelForm();
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      showMessage('error', 'Error de conexión');
    }
  };

  const handleEdit = (card: ICourseCard) => {
    setEditingCard(card);
    setFormData({
      titulo: card.titulo,
      descripcion: card.descripcion,
      precio: card.precio,
      urlDestino: card.urlDestino,
      imagen: card.imagen || '',
      destacado: card.destacado,
      activo: card.activo,
      orden: card.orden,
      categoria: card.categoria || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      return;
    }

    try {
      const response = await fetch(`/api/course-cards?id=${cardId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('success', 'Tarjeta eliminada correctamente');
        fetchCourseCards();
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Error al eliminar la tarjeta');
      }
    } catch (error) {
      showMessage('error', 'Error de conexión');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCard(null);
    setFormData({
      titulo: '',
      descripcion: '',
      precio: '',
      urlDestino: '',
      imagen: '',
      destacado: false,
      activo: true,
      orden: 0,
      categoria: ''
    });
  };

  const toggleDestacado = async (card: ICourseCard) => {
    try {
      const response = await fetch(`/api/course-cards?id=${card._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destacado: !card.destacado }),
      });

      if (response.ok) {
        fetchCourseCards();
        showMessage('success', `Tarjeta ${!card.destacado ? 'marcada como destacada' : 'desmarcada como destacada'}`);
      }
    } catch (error) {
      showMessage('error', 'Error al actualizar la tarjeta');
    }
  };

  const toggleActivo = async (card: ICourseCard) => {
    try {
      const response = await fetch(`/api/course-cards?id=${card._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo: !card.activo }),
      });

      if (response.ok) {
        fetchCourseCards();
        showMessage('success', `Tarjeta ${!card.activo ? 'activada' : 'desactivada'}`);
      }
    } catch (error) {
      showMessage('error', 'Error al actualizar la tarjeta');
    }
  };

  return (
    <>
      <Head>
        <title>Gestión de Tarjetas de Cursos - Nahuel Lozano</title>
        <meta name="description" content="Panel de administración para gestionar tarjetas de cursos personalizadas" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.header}
          >
            <div className={styles.headerContent}>
              <div>
                <h1 className={styles.title}>Gestión de Tarjetas de Cursos</h1>
                <p className={styles.subtitle}>
                  Administra las tarjetas de cursos que aparecen en la sección "Cursos Destacados"
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className={styles.addButton}
              >
                <Plus size={20} />
                Nueva Tarjeta
              </button>
            </div>
          </motion.div>

          {/* Mensajes */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`${styles.message} ${styles[message.type]}`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulario */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.formOverlay}
                onClick={handleCancelForm}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className={styles.formModal}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.formHeader}>
                    <h2>{editingCard ? 'Editar Tarjeta' : 'Nueva Tarjeta'}</h2>
                    <button onClick={handleCancelForm} className={styles.closeButton}>
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label htmlFor="titulo">Título *</label>
                        <input
                          type="text"
                          id="titulo"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                          required
                          maxLength={100}
                          placeholder="Título del curso"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="precio">Precio *</label>
                        <input
                          type="text"
                          id="precio"
                          value={formData.precio}
                          onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                          required
                          maxLength={50}
                          placeholder="Ej: $299, Gratis, Desde $99"
                        />
                      </div>

                      <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label htmlFor="descripcion">Descripción *</label>
                        <textarea
                          id="descripcion"
                          value={formData.descripcion}
                          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                          required
                          maxLength={500}
                          rows={3}
                          placeholder="Descripción del curso"
                        />
                      </div>

                      <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label htmlFor="urlDestino">URL de Destino *</label>
                        <input
                          type="url"
                          id="urlDestino"
                          value={formData.urlDestino}
                          onChange={(e) => setFormData({ ...formData, urlDestino: e.target.value })}
                          required
                          placeholder="https://plataformacursos.lozanonahuel.com/curso-especifico"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="categoria">Categoría</label>
                        <input
                          type="text"
                          id="categoria"
                          value={formData.categoria}
                          onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                          placeholder="Ej: Trading, Inversión, Cripto"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="orden">Orden</label>
                        <input
                          type="number"
                          id="orden"
                          value={formData.orden}
                          onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                          min="0"
                          placeholder="0"
                        />
                      </div>

                      <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label htmlFor="imagen">URL de Imagen (opcional)</label>
                        <input
                          type="url"
                          id="imagen"
                          value={formData.imagen}
                          onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                          placeholder="URL de la imagen del curso"
                        />
                      </div>

                      <div className={styles.checkboxGroup}>
                        <label className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={formData.destacado}
                            onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                          />
                          <span>Curso destacado</span>
                        </label>

                        <label className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={formData.activo}
                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                          />
                          <span>Tarjeta activa</span>
                        </label>
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <button type="button" onClick={handleCancelForm} className={styles.cancelButton}>
                        Cancelar
                      </button>
                      <button type="submit" className={styles.saveButton}>
                        <Save size={20} />
                        {editingCard ? 'Actualizar' : 'Crear'} Tarjeta
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lista de tarjetas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={styles.cardsSection}
          >
            {isLoading ? (
              <div className={styles.loading}>Cargando tarjetas...</div>
            ) : courseCards.length === 0 ? (
              <div className={styles.empty}>
                <h3>No hay tarjetas de cursos</h3>
                <p>Crea tu primera tarjeta para comenzar</p>
                <button onClick={() => setShowForm(true)} className={styles.addButton}>
                  <Plus size={20} />
                  Nueva Tarjeta
                </button>
              </div>
            ) : (
              <div className={styles.cardsGrid}>
                {courseCards.map((card, index) => (
                  <motion.div
                    key={card._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${styles.card} ${!card.activo ? styles.inactive : ''}`}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardMeta}>
                        {card.destacado && (
                          <span className={styles.destacadoBadge}>
                            <Star size={14} fill="currentColor" />
                            Destacado
                          </span>
                        )}
                        {card.categoria && (
                          <span className={styles.categoriaBadge}>{card.categoria}</span>
                        )}
                      </div>
                      
                      <div className={styles.cardActions}>
                        <button
                          onClick={() => toggleDestacado(card)}
                          className={`${styles.actionButton} ${card.destacado ? styles.active : ''}`}
                          title={card.destacado ? 'Quitar de destacados' : 'Marcar como destacado'}
                        >
                          <Star size={16} />
                        </button>
                        
                        <button
                          onClick={() => toggleActivo(card)}
                          className={`${styles.actionButton} ${card.activo ? styles.active : ''}`}
                          title={card.activo ? 'Desactivar' : 'Activar'}
                        >
                          {card.activo ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        
                        <button
                          onClick={() => handleEdit(card)}
                          className={styles.actionButton}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(card._id)}
                          className={`${styles.actionButton} ${styles.delete}`}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.cardContent}>
                      <h3 className={styles.cardTitle}>{card.titulo}</h3>
                      <p className={styles.cardDescription}>{card.descripcion}</p>
                      <div className={styles.cardPrice}>{card.precio}</div>
                      
                      <div className={styles.cardFooter}>
                        <a
                          href={card.urlDestino}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.urlLink}
                        >
                          <ExternalLink size={14} />
                          Ver curso
                        </a>
                        <span className={styles.cardOrder}>Orden: {card.orden}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const verification = await verifyAdminAccess(context);
  
  if (!verification.isAdmin) {
    return {
      redirect: {
        destination: verification.redirectTo || '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: verification.user,
    },
  };
};

export default AdminCourseCards; 