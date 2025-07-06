import React, { useState } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Plus, Settings, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/Admin.module.css';

const CreateSlotsPage = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: 'ConsultorioFinanciero',
    startDate: '',
    endDate: '',
    timeSlots: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
    price: 199,
    duration: 60,
    skipWeekends: true,
    skipExisting: true
  });

  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Por favor completa las fechas de inicio y fin');
      return;
    }

    if (formData.timeSlots.length === 0) {
      toast.error('Por favor agrega al menos un horario');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch('/api/admin/create-available-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        toast.success(`✅ ${data.created} horarios creados exitosamente`);
        
        // Opcional: limpiar formulario
        setFormData(prev => ({
          ...prev,
          startDate: '',
          endDate: ''
        }));
      } else {
        toast.error('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating slots:', error);
      toast.error('Error al crear horarios');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotChange = (index: number, value: string) => {
    const newTimeSlots = [...formData.timeSlots];
    newTimeSlots[index] = value;
    setFormData(prev => ({ ...prev, timeSlots: newTimeSlots }));
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, '20:00']
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  if (status === 'loading') {
    return (
      <>
        <Navbar />
        <div className={styles.adminPage}>
          <div className={styles.container}>
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Cargando...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!session || session.user?.email !== 'joaquinperez028@gmail.com') {
    return (
      <>
        <Navbar />
        <div className={styles.adminPage}>
          <div className={styles.container}>
            <div className={styles.error}>
              <h1>🚫 Acceso Denegado</h1>
              <p>Solo el administrador puede acceder a esta página.</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Crear Horarios Disponibles - Admin | Nahuel Lozano</title>
        <meta name="description" content="Crear horarios disponibles para servicios" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Navbar />

      <div className={styles.adminPage}>
        <div className={styles.container}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 className={styles.title}>📅 Crear Horarios Disponibles</h1>
            <p className={styles.subtitle}>
              Crea horarios disponibles para que los usuarios puedan reservar. 
              Los horarios se crean automáticamente para el rango de fechas seleccionado.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Tipo de Servicio */}
            <div>
              <label htmlFor="serviceType" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Tipo de Servicio
              </label>
              <select
                id="serviceType"
                value={formData.serviceType}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="ConsultorioFinanciero">Consultorio Financiero</option>
                <option value="CuentaAsesorada">Cuenta Asesorada</option>
                <option value="TradingAvanzado">Trading Avanzado</option>
                <option value="TradingBasico">Trading Básico</option>
              </select>
            </div>

            {/* Fechas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label htmlFor="startDate" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Fecha Inicio (DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  placeholder="07/01/2025"
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div>
                <label htmlFor="endDate" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Fecha Fin (DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  placeholder="31/01/2025"
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            {/* Horarios */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Horarios Disponibles
              </label>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {formData.timeSlots.map((slot, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="time"
                      value={slot}
                      onChange={(e) => handleTimeSlotChange(index, e.target.value)}
                      style={{ 
                        flex: 1,
                        padding: '0.5rem', 
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--border-color)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    {formData.timeSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className={`${styles.button} ${styles.buttonDanger}`}
                        style={{ padding: '0.5rem' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  style={{ justifySelf: 'start' }}
                >
                  <Plus size={16} />
                  Agregar Horario
                </button>
              </div>
            </div>

            {/* Precio y Duración */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label htmlFor="price" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Precio (USD)
                </label>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                  min="0"
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div>
                <label htmlFor="duration" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="15"
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            {/* Opciones */}
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={formData.skipWeekends}
                  onChange={(e) => setFormData(prev => ({ ...prev, skipWeekends: e.target.checked }))}
                />
                Saltar fines de semana
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={formData.skipExisting}
                  onChange={(e) => setFormData(prev => ({ ...prev, skipExisting: e.target.checked }))}
                />
                Saltar horarios existentes
              </label>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className={`${styles.button} ${styles.buttonPrimary} ${loading ? styles.buttonDisabled : ''}`}
            >
              {loading ? 'Creando...' : 'Crear Horarios'}
              {!loading && <Calendar size={20} />}
            </button>
          </form>

          {/* Resultado */}
          {result && (
            <div className={styles.success} style={{ marginTop: '2rem' }}>
              <CheckCircle size={20} />
              <div style={{ marginLeft: '0.5rem' }}>
                <h3>✅ Horarios creados exitosamente</h3>
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Creados:</strong> {result.created}</p>
                  <p><strong>Saltados:</strong> {result.skipped}</p>
                  <p><strong>Errores:</strong> {result.errors}</p>
                </div>
                
                {result.details.createdSlots.length > 0 && (
                  <details style={{ marginTop: '1rem' }}>
                    <summary>Ver horarios creados ({result.details.createdSlots.length})</summary>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      {result.details.createdSlots.slice(0, 10).map((slot: string, index: number) => (
                        <div key={index}>• {slot}</div>
                      ))}
                      {result.details.createdSlots.length > 10 && (
                        <div>... y {result.details.createdSlots.length - 10} más</div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CreateSlotsPage; 