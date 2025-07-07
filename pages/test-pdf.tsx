import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';

interface TestPDFProps {
  pdfId: string;
  fileName: string;
}

export default function TestPDF({ pdfId, fileName }: TestPDFProps) {
  const [viewUrl] = useState(`/api/pdf-db/view/${pdfId}?fileName=${encodeURIComponent(fileName)}`);
  const [downloadUrl] = useState(`/api/pdf-db/download/${pdfId}?fileName=${encodeURIComponent(fileName)}`);
  const [error, setError] = useState<string | null>(null);

  const testDirectAccess = async () => {
    try {
      const response = await fetch(viewUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        setError(`Error ${response.status}: ${errorText}`);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      console.log('Content-Length:', response.headers.get('content-length'));
      console.log('Response status:', response.status);
      
      if (contentType === 'application/pdf') {
        setError(null);
        alert('✅ PDF se está sirviendo correctamente!');
      } else {
        setError(`Tipo de contenido incorrecto: ${contentType}`);
      }
    } catch (err) {
      setError(`Error de red: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Prueba de PDF desde Base de Datos</h1>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Información del PDF</h3>
        <p><strong>ID:</strong> {pdfId}</p>
        <p><strong>Archivo:</strong> {fileName}</p>
        <p><strong>URL de visualización:</strong> <code>{viewUrl}</code></p>
        <p><strong>URL de descarga:</strong> <code>{downloadUrl}</code></p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={testDirectAccess}
          style={{ 
            padding: '0.5rem 1rem', 
            marginRight: '1rem',
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔍 Probar Acceso Directo
        </button>
        
        <a 
          href={viewUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            padding: '0.5rem 1rem', 
            marginRight: '1rem',
            backgroundColor: '#28a745', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          👁️ Abrir en Nueva Pestaña
        </a>
        
        <a 
          href={downloadUrl}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#ffc107', 
            color: 'black', 
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          📥 Descargar
        </a>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h3>📋 Iframe Test</h3>
        <iframe
          src={viewUrl}
          style={{ 
            width: '100%', 
            height: '600px', 
            border: '1px solid #ccc', 
            borderRadius: '4px' 
          }}
          onLoad={() => {
            console.log('✅ Iframe cargado exitosamente');
          }}
          onError={(e) => {
            console.error('❌ Error cargando iframe:', e);
            setError('Error cargando PDF en iframe');
          }}
        />
      </div>

      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#d1ecf1', 
        color: '#0c5460', 
        borderRadius: '4px',
        fontSize: '0.9rem'
      }}>
        <h4>🔧 Debug Info</h4>
        <p>Revisa la consola del navegador y los logs del servidor para más información.</p>
        <p>Si el iframe aparece en blanco, intenta:</p>
        <ul>
          <li>Abrir el PDF en una nueva pestaña</li>
          <li>Verificar los headers de respuesta en las herramientas de desarrollador</li>
          <li>Revisar los logs del servidor en la terminal</li>
        </ul>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getServerSession(context.req, context.res, authOptions);
    
    if (!session?.user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Usar el PDF de prueba que creaste
    const pdfId = '686c4bf360338490810a95a0';
    const fileName = 'tablas.pdf';

    return {
      props: {
        pdfId,
        fileName,
      },
    };
  } catch (error) {
    console.error('Error en getServerSideProps:', error);
    
    return {
      notFound: true,
    };
  }
}; 