import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User as UserIcon,
  Eye,
  Download,
  Share2,
  BookOpen,
  TrendingUp,
  FileText
} from 'lucide-react';
import styles from '@/styles/ReportView.module.css';
import dbConnect from '@/lib/mongodb';
import Report from '@/models/Report';
import User from '@/models/User';

interface ReportData {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  type: string;
  category: string;
  coverImage?: {
    url: string;
    optimizedUrl?: string;
  };
  images?: Array<{
    url: string;
    optimizedUrl?: string;
    thumbnailUrl?: string;
    caption?: string;
    order: number;
  }>;
  isPublished: boolean;
  publishedAt: string;
  views: number;
  readTime: number;
  createdAt: string;
}

interface ReportViewProps {
  report: ReportData;
  currentUser: any;
}

const ReportView: React.FC<ReportViewProps> = ({ report, currentUser }) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trader-call':
        return <TrendingUp size={20} />;
      case 'smart-money':
        return <BookOpen size={20} />;
      case 'cash-flow':
        return <FileText size={20} />;
      default:
        return <FileText size={20} />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'trader-call':
        return 'Trader Call';
      case 'smart-money':
        return 'Smart Money';
      case 'cash-flow':
        return 'Cash Flow';
      default:
        return 'Análisis';
    }
  };

  return (
    <>
      <Head>
        <title>{report.title} - Informe de Análisis | Nahuel Lozano</title>
        <meta name="description" content={`Informe de análisis: ${report.title}. ${report.content.substring(0, 160)}...`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        {/* Header con navegación */}
        <div className={styles.header}>
          <div className={styles.container}>
            <button onClick={handleBack} className={styles.backButton}>
              <ArrowLeft size={20} />
              Volver
            </button>
            
            <div className={styles.breadcrumb}>
              <span>Recursos</span>
              <span>/</span>
              <span>Informes</span>
              <span>/</span>
              <span>{report.title}</span>
            </div>
          </div>
        </div>

        <div className={styles.container}>
          {/* Hero Section */}
          <motion.section 
            className={styles.heroSection}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.heroContent}>
              {/* Badge de categoría */}
              <div className={styles.categoryBadge}>
                {getCategoryIcon(report.category)}
                <span>{getCategoryName(report.category)}</span>
              </div>

              {/* Título */}
              <h1 className={styles.title}>{report.title}</h1>

              {/* Meta información */}
              <div className={styles.metaInfo}>
                               <div className={styles.metaItem}>
                 <UserIcon size={16} />
                 <span>{report.author.name}</span>
               </div>
                <div className={styles.metaItem}>
                  <Calendar size={16} />
                  <span>{formatDate(report.publishedAt)}</span>
                </div>
                <div className={styles.metaItem}>
                  <Clock size={16} />
                  <span>{report.readTime} min de lectura</span>
                </div>
                <div className={styles.metaItem}>
                  <Eye size={16} />
                  <span>{report.views} vistas</span>
                </div>
              </div>

              {/* Imagen de portada */}
              {report.coverImage && (
                <div className={styles.coverImage}>
                  <img 
                    src={report.coverImage.optimizedUrl || report.coverImage.url}
                    alt={report.title}
                    className={styles.coverImg}
                  />
                </div>
              )}
            </div>
          </motion.section>

          {/* Contenido del informe */}
          <motion.section 
            className={styles.contentSection}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={styles.contentWrapper}>
              {/* Contenido principal */}
              <div className={styles.mainContent}>
                <div 
                  className={styles.content}
                  dangerouslySetInnerHTML={{ __html: report.content }}
                />
              </div>

              {/* Sidebar con información adicional */}
              <aside className={styles.sidebar}>
                <div className={styles.sidebarCard}>
                  <h3>Información del Informe</h3>
                  <div className={styles.infoItem}>
                    <strong>Tipo:</strong> {report.type}
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Categoría:</strong> {getCategoryName(report.category)}
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Autor:</strong> {report.author.name}
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Publicado:</strong> {formatDate(report.publishedAt)}
                  </div>
                </div>

                {/* Imágenes adicionales */}
                {report.images && report.images.length > 0 && (
                  <div className={styles.sidebarCard}>
                    <h3>Imágenes del Informe</h3>
                    <div className={styles.imageGallery}>
                      {report.images.map((image, index) => (
                        <div 
                          key={index}
                          className={styles.galleryItem}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img 
                            src={image.thumbnailUrl || image.url}
                            alt={image.caption || `Imagen ${index + 1}`}
                            className={styles.galleryThumbnail}
                          />
                          {image.caption && (
                            <p className={styles.imageCaption}>{image.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </motion.section>

          {/* Modal para imágenes */}
          {report.images && report.images.length > 0 && (
            <div 
              className={styles.imageModal}
              style={{ display: currentImageIndex >= 0 ? 'flex' : 'none' }}
              onClick={() => setCurrentImageIndex(-1)}
            >
              <div className={styles.modalContent}>
                <img 
                  src={report.images[currentImageIndex]?.optimizedUrl || report.images[currentImageIndex]?.url}
                  alt={report.images[currentImageIndex]?.caption || `Imagen ${currentImageIndex + 1}`}
                  className={styles.modalImage}
                />
                {report.images[currentImageIndex]?.caption && (
                  <p className={styles.modalCaption}>
                    {report.images[currentImageIndex].caption}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getSession(context);
    
    if (!session?.user?.email) {
      return {
        redirect: {
          destination: '/auth/signin',
          permanent: false,
        },
      };
    }

    const { id } = context.params!;
    
    console.log('🔍 [REPORT] Buscando informe con ID:', id);

    if (!id || typeof id !== 'string') {
      console.log('❌ [REPORT] ID inválido:', id);
      return {
        notFound: true,
      };
    }

    // Obtener el informe directamente desde la base de datos para evitar problemas de fetch
    await dbConnect();
    console.log('✅ [REPORT] Conectado a MongoDB');

    // Asegurar que el modelo User esté registrado
    try {
      const mongoose = require('mongoose');
      if (!mongoose.models.User) {
        require('@/models/User');
      }
    } catch (modelError) {
      console.log('⚠️ [REPORT] Modelo User ya registrado o error menor:', modelError);
    }

    let reportDoc;
    try {
      // Primero obtenemos el informe sin populate
      reportDoc = await Report.findById(id).lean() as any;
      
      // Si existe el informe, obtenemos el autor por separado
      if (reportDoc && reportDoc.author) {
        const authorDoc = await User.findById(reportDoc.author)
          .select('name email image')
          .lean() as any;
        
        if (authorDoc) {
          reportDoc.author = authorDoc;
        }
      }

      console.log('📄 [REPORT] Resultado de búsqueda:', reportDoc ? 'Encontrado' : 'No encontrado');

      if (!reportDoc) {
        console.log('❌ [REPORT] Informe no encontrado en BD');
        return {
          notFound: true,
        };
      }

      console.log('📋 [REPORT] Detalles del informe:', {
        id: reportDoc._id,
        title: reportDoc.title,
        isPublished: reportDoc.isPublished,
        author: reportDoc.author?.name || 'Sin autor'
      });

      // Verificar que el informe esté publicado
      if (!reportDoc.isPublished) {
        console.log('❌ [REPORT] Informe no publicado');
        return {
          notFound: true,
        };
      }
    } catch (dbError) {
      console.error('💥 [REPORT] Error de base de datos:', dbError);
      return {
        notFound: true,
      };
    }

    // Procesar informe para incluir URLs optimizadas de Cloudinary
    let optimizedImageUrl = null;
    if (reportDoc.coverImage?.public_id) {
      try {
        const { getCloudinaryImageUrl } = await import('@/lib/cloudinary');
        optimizedImageUrl = getCloudinaryImageUrl(reportDoc.coverImage.public_id, {
          width: 800,
          height: 600,
          crop: 'fill',
          format: 'webp'
        });
      } catch (error) {
        console.log('Error procesando imagen de portada:', error);
      }
    }

    // Generar URLs optimizadas para imágenes adicionales
    let optimizedImages: any[] = [];
    if (reportDoc.images && reportDoc.images.length > 0) {
      try {
        const { getCloudinaryImageUrl } = await import('@/lib/cloudinary');
        optimizedImages = reportDoc.images
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .map((img: any) => ({
            ...img,
            optimizedUrl: getCloudinaryImageUrl(img.public_id, {
              width: 800,
              height: 600,
              crop: 'fill',
              format: 'webp'
            }),
            thumbnailUrl: getCloudinaryImageUrl(img.public_id, {
              width: 300,
              height: 200,
              crop: 'fill',
              format: 'webp'
            })
          }));
      } catch (error) {
        console.log('Error procesando imágenes adicionales:', error);
        optimizedImages = reportDoc.images || [];
      }
    }

    const processedReport = {
      ...reportDoc,
      _id: reportDoc._id.toString(),
      author: {
        ...reportDoc.author,
        _id: reportDoc.author._id.toString()
      },
      // URL de portada optimizada
      coverImage: reportDoc.coverImage ? {
        ...reportDoc.coverImage,
        optimizedUrl: optimizedImageUrl
      } : null,
      // Imágenes adicionales optimizadas
      images: optimizedImages,
      // Calcular tiempo de lectura estimado
      readTime: Math.ceil((reportDoc.content?.length || 0) / 1000) || 1
    };

    return {
      props: {
        report: processedReport,
        currentUser: session.user,
      },
    };
  } catch (error) {
    console.error('Error en getServerSideProps:', error);
    return {
      notFound: true,
    };
  }
};

export default ReportView; 