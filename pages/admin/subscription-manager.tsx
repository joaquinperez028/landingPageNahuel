import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, Plus, Search, Calendar, Mail, Shield } from 'lucide-react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/Admin.module.css';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  subscriptionExpiry?: Date;
  activeSubscriptions: Array<{
    service: string;
    startDate: Date;
    expiryDate: Date;
    isActive: boolean;
    amount: number;
    currency: string;
  }>;
  createdAt: Date;
  lastLogin?: Date;
}

interface SubscriptionManagerProps {
  session: any;
  users: UserData[];
}

export default function SubscriptionManager({ session, users }: SubscriptionManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [durationDays, setDurationDays] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>(users);

  // Filtrar usuarios basado en el término de búsqueda
  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleAddTraderCallSubscription = async () => {
    if (!selectedUser) {
      toast.error('Por favor selecciona un usuario');
      return;
    }

    if (durationDays <= 0) {
      toast.error('La duración debe ser mayor a 0 días');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/add-tradercall-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: selectedUser.email,
          durationDays: durationDays
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        // Recargar la página para mostrar los cambios
        window.location.reload();
      } else {
        toast.error(data.error || 'Error al agregar la suscripción');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSubscriptionActive = (user: UserData) => {
    if (!user.subscriptionExpiry) return false;
    return new Date() < new Date(user.subscriptionExpiry);
  };

  const hasTraderCallSubscription = (user: UserData) => {
    return user.activeSubscriptions.some(sub => 
      sub.service === 'TraderCall' && sub.isActive && new Date() < new Date(sub.expiryDate)
    );
  };

  const getTraderCallExpiry = (user: UserData) => {
    const traderCallSub = user.activeSubscriptions.find(sub => 
      sub.service === 'TraderCall' && sub.isActive && new Date() < new Date(sub.expiryDate)
    );
    return traderCallSub ? traderCallSub.expiryDate : null;
  };

  return (
    <>
      <Head>
        <title>Gestionar Suscripciones - Admin</title>
        <meta name="description" content="Panel de administración para gestionar suscripciones de usuarios" />
      </Head>

      <Navbar />

      <main className={styles.adminMain}>
        <div className="container">
          <div className={styles.adminHeader}>
            <h1 className={styles.adminTitle}>
              <Shield size={32} />
              Gestión de Suscripciones
            </h1>
            <p className={styles.adminSubtitle}>
              Administra las suscripciones de TraderCall de los usuarios
            </p>
          </div>

          {/* Panel de Agregar Suscripción */}
          <div className={styles.adminCard}>
            <h2 className={styles.cardTitle}>
              <Plus size={24} />
              Agregar Membresía TraderCall
            </h2>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Buscar Usuario:</label>
                <div className={styles.searchContainer}>
                  <Search size={20} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Duración (días):</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value) || 2)}
                  className={styles.formInput}
                />
              </div>
            </div>

            {/* Lista de Usuarios */}
            <div className={styles.usersList}>
              <h3 className={styles.sectionTitle}>Usuarios ({filteredUsers.length})</h3>
              
              <div className={styles.usersGrid}>
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`${styles.userCard} ${
                      selectedUser?._id === user._id ? styles.userCardSelected : ''
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}>
                        <User size={24} />
                      </div>
                      <div className={styles.userDetails}>
                        <h4 className={styles.userName}>{user.name}</h4>
                        <p className={styles.userEmail}>
                          <Mail size={16} />
                          {user.email}
                        </p>
                        <p className={styles.userRole}>
                          <Shield size={16} />
                          {user.role}
                        </p>
                      </div>
                    </div>

                    <div className={styles.userSubscriptions}>
                      <div className={styles.subscriptionStatus}>
                        <span className={`${styles.statusBadge} ${
                          isSubscriptionActive(user) ? styles.statusActive : styles.statusInactive
                        }`}>
                          {isSubscriptionActive(user) ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>

                      {hasTraderCallSubscription(user) && (
                        <div className={styles.traderCallInfo}>
                          <span className={styles.traderCallBadge}>TraderCall</span>
                          <p className={styles.expiryDate}>
                            <Calendar size={14} />
                            Vence: {formatDate(getTraderCallExpiry(user)!)}
                          </p>
                        </div>
                      )}

                      {user.subscriptionExpiry && (
                        <p className={styles.generalExpiry}>
                          <Calendar size={14} />
                          General: {formatDate(user.subscriptionExpiry)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón de Acción */}
            {selectedUser && (
              <div className={styles.actionSection}>
                <div className={styles.selectedUserInfo}>
                  <h3>Usuario Seleccionado:</h3>
                  <p><strong>{selectedUser.name}</strong> ({selectedUser.email})</p>
                  {hasTraderCallSubscription(selectedUser) && (
                    <p className={styles.warning}>
                      ⚠️ Este usuario ya tiene una suscripción activa de TraderCall
                    </p>
                  )}
                </div>
                
                <button
                  onClick={handleAddTraderCallSubscription}
                  disabled={isLoading}
                  className={styles.actionButton}
                >
                  {isLoading ? (
                    'Procesando...'
                  ) : (
                    <>
                      <Plus size={20} />
                      Agregar TraderCall por {durationDays} días
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Estadísticas */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Total Usuarios</h3>
              <p className={styles.statNumber}>{users.length}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Suscripciones Activas</h3>
              <p className={styles.statNumber}>
                {users.filter(isSubscriptionActive).length}
              </p>
            </div>
            <div className={styles.statCard}>
              <h3>TraderCall Activo</h3>
              <p className={styles.statNumber}>
                {users.filter(hasTraderCallSubscription).length}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getSession(context);
    
    if (!session) {
      return {
        redirect: {
          destination: '/auth/signin',
          permanent: false,
        },
      };
    }

    // Verificar si es administrador
    const { verifyAdminAccess } = await import('@/lib/adminAuth');
    const adminResult = await verifyAdminAccess(context);
    
    if (!adminResult.isAdmin) {
      return {
        redirect: {
          destination: adminResult.redirectTo || '/',
          permanent: false,
        },
      };
    }

    // Obtener usuarios de la base de datos
    const dbConnect = (await import('@/lib/mongodb')).default;
    const User = (await import('@/models/User')).default;
    
    await dbConnect();
    
    const users = await User.find({})
      .select('name email role subscriptionExpiry activeSubscriptions createdAt lastLogin')
      .sort({ createdAt: -1 })
      .lean();

    return {
      props: {
        session,
        users: users.map((user: any) => ({
          ...user,
          _id: user._id.toString(),
          createdAt: user.createdAt.toISOString(),
          lastLogin: user.lastLogin?.toISOString(),
          subscriptionExpiry: user.subscriptionExpiry?.toISOString(),
          activeSubscriptions: user.activeSubscriptions.map((sub: any) => ({
            ...sub,
            startDate: sub.startDate.toISOString(),
            expiryDate: sub.expiryDate.toISOString()
          }))
        }))
      },
    };
  } catch (error) {
    console.error('Error en getServerSideProps:', error);
    return {
      props: {
        session: null,
        users: []
      },
    };
  }
};
