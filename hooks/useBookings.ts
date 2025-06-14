import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Booking {
  _id: string;
  type: 'training' | 'advisory';
  serviceType?: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  price?: number;
  notes?: string;
  createdAt: string;
}

interface CreateBookingData {
  type: 'training' | 'advisory';
  serviceType?: string;
  startDate: string;
  duration?: number;
  price?: number;
  notes?: string;
}

interface AvailableSlots {
  date: string;
  availableSlots: string[];
  totalSlots: number;
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener reservas del usuario
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/bookings');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener reservas');
      }

      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error al obtener reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva reserva
  const createBooking = async (bookingData: CreateBookingData): Promise<Booking | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error('❌ Ese turno no se encuentra disponible, por favor seleccionar otro!', {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: 'white',
              fontWeight: '600'
            }
          });
        } else {
          toast.error(data.error || 'Error al crear la reserva');
        }
        throw new Error(data.error || 'Error al crear la reserva');
      }

      toast.success('¡Reserva creada exitosamente!');
      
      // Actualizar lista de reservas
      await fetchBookings();
      
      return data.booking;
    } catch (err: any) {
      setError(err.message);
      console.error('Error al crear reserva:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obtener horarios disponibles
  const getAvailableSlots = async (
    date: string, 
    type?: 'training' | 'advisory', 
    duration: number = 90
  ): Promise<AvailableSlots | null> => {
    try {
      const params = new URLSearchParams({
        date,
        duration: duration.toString()
      });
      
      if (type) {
        params.append('type', type);
      }

      const response = await fetch(`/api/bookings/available-slots?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener horarios disponibles');
      }

      return data;
    } catch (err: any) {
      console.error('Error al obtener horarios disponibles:', err);
      toast.error('Error al cargar horarios disponibles');
      return null;
    }
  };

  // Cargar reservas al montar el hook
  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    getAvailableSlots
  };
} 