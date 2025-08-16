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
  BookOpen,
  TrendingUp,
  FileText,
  ChevronLeft,
  ChevronRight,
  List
} from 'lucide-react';
import styles from '@/styles/ReportView.module.css';
import dbConnect from '@/lib/mongodb';
import Report from '@/models/Report';
import User from '@/models/User';

interface Article {
  _id: string;
  title: string;
  content: string;
  order: number;
  isPublished: boolean;
  readTime: number;
  createdAt: string;
}

interface ReportData {
  _id: string;
  title: string;
  content: string;
  articles?: Article[];
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
  userRole: string;
}

const ReportView: React.FC<ReportViewProps> = ({ report, currentUser, userRole }) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [showArticlesList, setShowArticlesList] = useState(false);

  // Debug: mostrar el rol del usuario
  console.log('🔍 [REPORT VIEW] Rol del usuario:', userRole, 'Es admin:', userRole === 'admin');

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

  // Obtener artículos publicados ordenados
  const publishedArticles = report.articles?.filter(article => article.isPublished).sort((a, b) => a.order - b.order) || [];

  // Calcular tiempo de lectura total
  const totalReadTime = publishedArticles.reduce((total, article) => total + article.readTime, 0) + report.readTime;

  const handlePreviousArticle = () => {
    if (currentArticleIndex > 0) {
      setCurrentArticleIndex(currentArticleIndex - 1);
    }
  };

  const handleNextArticle = () => {
    if (currentArticleIndex < publishedArticles.length - 1) {
      setCurrentArticleIndex(currentArticleIndex + 1);
    }
  };

  const handleArticleSelect = (index: number) => {
    setCurrentArticleIndex(index);
    setShowArticlesList(false);
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
                  <span>{totalReadTime} min de lectura total</span>
                </div>
                <div className={styles.metaItem}>
                  <Eye size={16} />
                  <span>{report.views} vistas</span>
                </div>
                {publishedArticles.length > 0 && (
                  <div className={styles.metaItem}>
                    <BookOpen size={16} />
                    <span>{publishedArticles.length} artículo{publishedArticles.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
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
                {/* Navegación de artículos */}
                {publishedArticles.length > 0 && (
                  <div className={styles.articlesNavigation}>
                    <div className={styles.articlesHeader}>
                      <h2>📚 Artículos del Informe</h2>
                      <button 
                        onClick={() => setShowArticlesList(!showArticlesList)}
                        className={styles.articlesListButton}
                      >
                        <List size={20} />
                        Lista de Artículos
                      </button>
                    </div>

                    {/* Lista desplegable de artículos */}
                    {showArticlesList && (
                      <div className={styles.articlesList}>
                        {publishedArticles.map((article, index) => (
                          <button
                            key={article._id}
                            onClick={() => handleArticleSelect(index)}
                            className={`${styles.articleListItem} ${index === currentArticleIndex ? styles.activeArticle : ''}`}
                          >
                            <div className={styles.articleListInfo}>
                              <span className={styles.articleOrder}>Artículo {article.order}</span>
                              <h4 className={styles.articleListTitle}>{article.title}</h4>
                              <span className={styles.articleReadTime}>{article.readTime} min</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Navegación entre artículos */}
                    <div className={styles.articleNavigation}>
                      <button
                        onClick={handlePreviousArticle}
                        disabled={currentArticleIndex === 0}
                        className={styles.articleNavButton}
                      >
                        <ChevronLeft size={20} />
                        Anterior
                      </button>
                      
                      <span className={styles.articleCounter}>
                        Artículo {currentArticleIndex + 1} de {publishedArticles.length}
                      </span>
                      
                      <button
                        onClick={handleNextArticle}
                        disabled={currentArticleIndex === publishedArticles.length - 1}
                        className={styles.articleNavButton}
                      >
                        Siguiente
                        <ChevronRight size={20} />
                      </button>
                    </div>

                    {/* Contenido del artículo actual */}
                    <div className={styles.currentArticle}>
                      <h3 className={styles.articleTitle}>
                        Artículo {publishedArticles[currentArticleIndex].order}: {publishedArticles[currentArticleIndex].title}
                      </h3>
                      <div 
                        className={styles.articleContent}
                        dangerouslySetInnerHTML={{ __html: publishedArticles[currentArticleIndex].content }}
                      />
                      <div className={styles.articleMeta}>
                        <span>Tiempo de lectura: {publishedArticles[currentArticleIndex].readTime} min</span>
                        <span>Publicado: {formatDate(publishedArticles[currentArticleIndex].createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contenido principal del informe */}
                <div className={styles.reportContent}>
                  <h2>📋 Contenido Principal del Informe</h2>
                  <div 
                    className={styles.content}
                    dangerouslySetInnerHTML={{ __html: report.content }}
                  />
                </div>
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
                  {publishedArticles.length > 0 && (
                    <div className={styles.infoItem}>
                      <strong>Artículos:</strong> {publishedArticles.length} publicados
                    </div>
                  )}
                </div>

                {/* Lista de artículos en sidebar */}
                {publishedArticles.length > 0 && (
                  <div className={styles.sidebarCard}>
                    <h3>📚 Artículos del Informe</h3>
                    <div className={styles.sidebarArticlesList}>
                      {publishedArticles.map((article, index) => (
                        <button
                          key={article._id}
                          onClick={() => handleArticleSelect(index)}
                          className={`${styles.sidebarArticleItem} ${index === currentArticleIndex ? styles.activeSidebarArticle : ''}`}
                        >
                          <div className={styles.sidebarArticleInfo}>
                            <span className={styles.sidebarArticleOrder}>Artículo {article.order}</span>
                            <h4 className={styles.sidebarArticleTitle}>{article.title}</h4>
                            <span className={styles.sidebarArticleReadTime}>{article.readTime} min</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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

    // Obtener el rol del usuario
    await dbConnect();
    const user = await User.findOne({ email: session.user.email }).select('role');
    const userRole = user?.role || 'normal';
    
    console.log('👤 [REPORT] Usuario:', session.user.email, 'Rol:', userRole);

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
      readTime: Math.ceil((reportDoc.content?.length || 0) / 1000) || 1,
      // Procesar artículos si existen
      articles: reportDoc.articles ? reportDoc.articles.map((article: any) => ({
        ...article,
        _id: article._id.toString(),
        readTime: Math.ceil((article.content?.length || 0) / 1000) || 1
      })) : []
    };

    return {
      props: {
        report: processedReport,
        currentUser: session.user,
        userRole: userRole,
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