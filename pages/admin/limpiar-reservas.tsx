import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import styles from '@/styles/Admin.module.css';

interface Booking {
  index: number;
  id: string;
  userEmail: string;
  type: string;
  serviceType: string;
  status: string;
  startDate: string;
  startDateLocal: string;
  hasGoogleEventId: boolean;
  googleEventId: string;
}

const LimpiarReservasPage = () => {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      loadBookings();
    }
  }, [status]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/reservas');
      const data = await response.json();

      if (response.ok) {
        setBookings(data.bookings || []);
        console.log('📊 Resumen de reservas:', {
          total: data.total,
          consultorioFinanciero: data.consultorioFinanciero,
          active: data.active,
          ghostBookings: data.ghostBookings
        });
      } else {
        toast.error('Error al cargar reservas: ' + data.error);
      }
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const limpiarReservasFantasma = async () => {
    if (!confirm('¿Estás seguro de eliminar todas las reservas fantasma (sin Google Event ID)?')) {
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/debug/reservas', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cleanGhostBookings: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✅ ${data.deletedCount} reservas fantasma eliminadas`);
        await loadBookings(); // Recargar datos
      } else {
        toast.error('Error al limpiar reservas: ' + data.error);
      }
    } catch (error) {
      console.error('Error al limpiar reservas:', error);
      toast.error('Error al limpiar reservas');
    } finally {
      setProcessing(false);
    }
  };

  const limpiarReservaUsuario = async (userEmail: string) => {
    if (!confirm(`¿Eliminar todas las reservas de ${userEmail}?`)) {
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/debug/reservas', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✅ ${data.deletedCount} reservas de ${userEmail} eliminadas`);
        await loadBookings();
      } else {
        toast.error('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar reservas del usuario');
    } finally {
      setProcessing(false);
    }
  };

  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  if (!session || session.user?.email !== 'joaquinperez028@gmail.com') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Acceso Denegado</h1>
        <p>Solo el administrador puede acceder a esta página.</p>
      </div>
    );
  }

  const ghostBookings = bookings.filter(b => !b.hasGoogleEventId && b.serviceType === 'ConsultorioFinanciero');
  const consultorioBookings = bookings.filter(b => b.serviceType === 'ConsultorioFinanciero');

  return (
    <>
      <Head>
        <title>Limpiar Reservas - Admin</title>
      </Head>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>🧹 Limpieza de Reservas</h1>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <h3>📊 Total Reservas</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>{bookings.length}</p>
            </div>
            
            <div style={{ padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
              <h3>💼 Consultorio Financiero</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>{consultorioBookings.length}</p>
            </div>
            
            <div style={{ padding: '1rem', background: '#ffebee', borderRadius: '8px' }}>
              <h3>👻 Reservas Fantasma</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>{ghostBookings.length}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              onClick={limpiarReservasFantasma}
              disabled={processing || ghostBookings.length === 0}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: processing ? 'not-allowed' : 'pointer',
                opacity: processing || ghostBookings.length === 0 ? 0.6 : 1
              }}
            >
              {processing ? 'Procesando...' : `🗑️ Limpiar ${ghostBookings.length} Reservas Fantasma`}
            </button>

            <button 
              onClick={loadBookings}
              disabled={processing}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: processing ? 'not-allowed' : 'pointer'
              }}
            >
              🔄 Recargar
            </button>
          </div>
        </div>

        {loading ? (
          <div>Cargando reservas...</div>
        ) : (
          <div>
            <h2>📋 Todas las Reservas de Consultorio Financiero</h2>
            
            {consultorioBookings.length === 0 ? (
              <p>No hay reservas de Consultorio Financiero.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>ID</th>
                      <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Usuario</th>
                      <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Fecha</th>
                      <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Estado</th>
                      <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Google Event</th>
                      <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultorioBookings.map((booking) => (
                      <tr 
                        key={booking.id}
                        style={{ 
                          backgroundColor: !booking.hasGoogleEventId ? '#ffebee' : 'white'
                        }}
                      >
                        <td style={{ padding: '0.5rem', border: '1px solid #ddd', fontSize: '0.8rem' }}>
                          {booking.id.substring(0, 8)}...
                        </td>
                        <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                          {booking.userEmail}
                        </td>
                        <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                          {booking.startDateLocal}
                        </td>
                        <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            backgroundColor: booking.status === 'confirmed' ? '#e8f5e8' : '#fff3cd',
                            color: booking.status === 'confirmed' ? '#2e7d32' : '#856404'
                          }}>
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                          {booking.hasGoogleEventId ? (
                            <span style={{ color: 'green' }}>✅ Sí</span>
                          ) : (
                            <span style={{ color: 'red' }}>❌ No (Fantasma)</span>
                          )}
                        </td>
                        <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                          <button
                            onClick={() => limpiarReservaUsuario(booking.userEmail)}
                            disabled={processing}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#ff9800',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️ Usuario
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default LimpiarReservasPage; 