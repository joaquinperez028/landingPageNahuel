import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import {
  Map,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  BookOpen,
  Clock,
  Target,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { GetServerSideProps } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import styles from '../../styles/AdminRoadmaps.module.css';

interface RoadmapTopic {
  titulo: string;
  descripcion?: string;
}

interface RoadmapModule {
  id: number;
  titulo: string;
  descripcion: string;
  duracion: string;
  lecciones: number;
  temas: RoadmapTopic[];
  dificultad: 'Básico' | 'Intermedio' | 'Avanzado';
  prerequisito?: number;
  orden: number;
  activo: boolean;
}

interface Roadmap {
  _id: string;
  nombre: string;
  descripcion: string;
  tipoEntrenamiento: 'TradingFundamentals' | 'DowJones' | 'General';
  modulos: RoadmapModule[];
  activo: boolean;
  orden: number;
  metadatos: {
    totalLecciones: number;
    totalHoras: number;
    autor: string;
    version: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AdminRoadmapsProps {
  session: any;
}

const AdminRoadmaps: React.FC<AdminRoadmapsProps> = ({ session }) => {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  
  // Estados para manejo de errores
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipoEntrenamiento: 'TradingFundamentals' as 'TradingFundamentals' | 'DowJones' | 'General',
    modulos: [] as RoadmapModule[],
    activo: true,
    orden: 1
  });

  return (
    <>
      <Head>
        <title>Gestión de Roadmaps - Admin</title>
        <meta name="description" content="Panel de administración para gestionar roadmaps de aprendizaje" />
      </Head>

      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <Map size={32} />
              Gestión de Roadmaps
            </h1>
            <p className={styles.subtitle}>
              Crea y gestiona los roadmaps de aprendizaje para cada entrenamiento
            </p>
          </div>

          <div className={styles.headerRight}>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={styles.select}
            >
              <option value="all">Todos los tipos</option>
              <option value="TradingFundamentals">Trading Fundamentals</option>
              <option value="DowJones">Dow Jones</option>
              <option value="General">General</option>
            </select>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className={`${styles.button} ${styles.primaryButton}`}
            >
              <Plus size={16} />
              Nuevo Roadmap
            </button>
          </div>
        </div>

        {/* Controles */}
        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar roadmaps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Contenido temporal */}
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          Panel de Roadmaps en construcción...
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const adminCheck = await verifyAdminAccess(context);
  
  if (!adminCheck.isAdmin) {
    return {
      redirect: {
        destination: adminCheck.redirectTo || '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session: adminCheck.session
    },
  };
};

export default AdminRoadmaps; 