import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Settings, 
  Search,
  Filter,
  Mail,
  Edit3,
  Trash2,
  Plus,
  Download,
  RefreshCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import User from '@/models/User';
import styles from '@/styles/AdminUsers.module.css';
import { toast } from 'react-hot-toast';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'suscriptor' | 'normal';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        toast.error('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar rol de usuario
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast.success('Rol actualizado correctamente');
        fetchUsers(); // Recargar lista
      } else {
        toast.error('Error al actualizar rol');
      }
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      toast.error('Error al actualizar rol');
    }
  };

  // Eliminar usuario
  const deleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Usuario eliminado correctamente');
        fetchUsers(); // Recargar lista
      } else {
        toast.error('Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' ? user.isActive : !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return styles.badgeAdmin;
      case 'suscriptor': return styles.badgeSuscriptor;
      default: return styles.badgeNormal;
    }
  };

  return (
    <>
      <Head>
        <title>Gestión de Usuarios - Admin Dashboard</title>
        <meta name="description" content="Gestión de usuarios del sistema" />
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
                  <Users size={40} />
                </div>
                <div>
                  <h1 className={styles.title}>Gestión de Usuarios</h1>
                  <p className={styles.subtitle}>
                    Administra usuarios, roles y permisos del sistema
                  </p>
                </div>
              </div>
              <div className={styles.headerActions}>
                <Link 
                  href="/admin/dashboard"
                  className={`${styles.actionButton} ${styles.secondary}`}
                >
                  Volver al Dashboard
                </Link>
                <button 
                  onClick={fetchUsers}
                  className={`${styles.actionButton} ${styles.primary}`}
                  disabled={loading}
                >
                  <RefreshCw size={20} />
                  Actualizar
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Users size={24} className={styles.iconBlue} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{users.length}</h3>
                  <p>Total Usuarios</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <UserCheck size={24} className={styles.iconGreen} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{users.filter(u => u.role === 'admin').length}</h3>
                  <p>Administradores</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <UserCheck size={24} className={styles.iconPurple} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{users.filter(u => u.role === 'suscriptor').length}</h3>
                  <p>Suscriptores</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Users size={24} className={styles.iconAmber} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{users.filter(u => u.role === 'normal').length}</h3>
                  <p>Usuarios Normales</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className={styles.filtersCard}>
              <div className={styles.filtersGrid}>
                <div className={styles.searchGroup}>
                  <div className={styles.searchInputWrapper}>
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

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Rol:</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">Todos</option>
                    <option value="admin">Admin</option>
                    <option value="suscriptor">Suscriptor</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Estado:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h2 className={styles.tableTitle}>
                  Lista de Usuarios ({filteredUsers.length})
                </h2>
                <button className={`${styles.actionButton} ${styles.success}`}>
                  <Download size={20} />
                  Exportar CSV
                </button>
              </div>

              {loading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <p>Cargando usuarios...</p>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Registro</th>
                        <th>Último Acceso</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <div className={styles.userInfo}>
                              <div className={styles.userAvatar}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span className={styles.userName}>{user.name}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user._id, e.target.value)}
                              className={`${styles.roleSelect} ${getRoleBadgeClass(user.role)}`}
                            >
                              <option value="normal">Normal</option>
                              <option value="suscriptor">Suscriptor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactive}`}>
                              {user.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}</td>
                          <td>
                            <div className={styles.actionButtons}>
                              <button
                                className={`${styles.actionBtn} ${styles.edit}`}
                                title="Editar usuario"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                className={`${styles.actionBtn} ${styles.mail}`}
                                title="Enviar email"
                              >
                                <Mail size={16} />
                              </button>
                              <button
                                onClick={() => deleteUser(user._id)}
                                className={`${styles.actionBtn} ${styles.delete}`}
                                title="Eliminar usuario"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredUsers.length === 0 && !loading && (
                    <div className={styles.emptyState}>
                      <Users size={48} className={styles.emptyIcon} />
                      <h3>No se encontraron usuarios</h3>
                      <p>Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  )}
                </div>
              )}
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