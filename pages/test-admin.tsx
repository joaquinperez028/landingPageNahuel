import { GetServerSideProps } from 'next';
import { verifyAdminAccess, AdminVerificationResult } from '@/lib/adminAuth';

interface TestAdminPageProps {
  verification: AdminVerificationResult;
  timestamp: string;
}

export default function TestAdminPage({ verification, timestamp }: TestAdminPageProps) {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Test Admin Access</h1>
      <p><strong>Timestamp:</strong> {timestamp}</p>
      
      <div style={{ 
        padding: '20px', 
        marginBottom: '20px',
        backgroundColor: verification.isAdmin ? '#d4edda' : '#f8d7da',
        border: `1px solid ${verification.isAdmin ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '8px'
      }}>
        <h3>📊 Resultado de Verificación</h3>
        <p><strong>Es válido:</strong> {verification.isValid ? '✅ Sí' : '❌ No'}</p>
        <p><strong>Es admin:</strong> {verification.isAdmin ? '✅ Sí' : '❌ No'}</p>
        
        {verification.user && (
          <div style={{ marginTop: '15px' }}>
            <h4>👤 Datos del Usuario:</h4>
            <p><strong>Email:</strong> {verification.user.email}</p>
            <p><strong>Nombre:</strong> {verification.user.name}</p>
            <p><strong>Rol:</strong> {verification.user.role}</p>
            <p><strong>ID:</strong> {verification.user._id}</p>
          </div>
        )}
        
        {verification.redirectTo && (
          <div style={{ marginTop: '15px', color: '#721c24' }}>
            <p><strong>⚠️ Se redirigirá a:</strong> {verification.redirectTo}</p>
          </div>
        )}
      </div>
      
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6',
        borderRadius: '8px'
      }}>
        <h4>📋 Estado</h4>
        {verification.isAdmin ? (
          <p style={{ color: 'green' }}>
            ✅ <strong>Acceso de administrador confirmado!</strong><br/>
            Si ves este mensaje, la verificación de admin funciona correctamente.
          </p>
        ) : (
          <p style={{ color: 'red' }}>
            ❌ <strong>Acceso denegado</strong><br/>
            La verificación falló. Revisa los logs del servidor para más detalles.
          </p>
        )}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <a 
          href="/admin/dashboard" 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '5px',
            marginRight: '10px'
          }}
        >
          🏠 Ir al Dashboard
        </a>
        
        <a 
          href="/refresh-session" 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '5px'
          }}
        >
          🔄 Refresh Session
        </a>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log('🧪 [TEST ADMIN] Iniciando verificación...');
  
  const verification = await verifyAdminAccess(context);
  
  console.log('🧪 [TEST ADMIN] Resultado:', verification);
  
  // No redirigir automáticamente para poder ver el resultado
  return {
    props: {
      verification,
      timestamp: new Date().toISOString()
    }
  };
}; 