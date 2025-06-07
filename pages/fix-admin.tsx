import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function FixAdminPage() {
  const { data: session, status } = useSession();
  const [checkResult, setCheckResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/refresh-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setCheckResult(result);
      console.log('📊 Resultado de verificación:', result);
    } catch (error) {
      console.error('❌ Error al verificar sesión:', error);
      setCheckResult({
        success: false,
        message: 'Error al verificar sesión'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('🔄 Cerrando sesión...');
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div style={{ 
      padding: '40px 20px', 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>🔧 Arreglar Rol de Administrador</h1>
      
      {status === 'loading' ? (
        <p style={{ textAlign: 'center' }}>Cargando sesión...</p>
      ) : !session ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>❌ <strong>No hay sesión activa</strong></p>
          <p>Por favor, inicia sesión primero.</p>
        </div>
      ) : (
        <div>
          {/* Información actual */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #dee2e6'
          }}>
            <h3>📋 Tu Sesión Actual</h3>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Nombre:</strong> {session.user.name}</p>
            <p><strong>Rol actual:</strong> <span style={{ 
              color: session.user.role === 'admin' ? 'green' : 'orange',
              fontWeight: 'bold'
            }}>{session.user.role || 'normal'}</span></p>
          </div>

          {/* Botón de verificación */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button 
              onClick={handleCheckSession}
              disabled={loading}
              style={{ 
                padding: '12px 24px', 
                fontSize: '16px',
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '🔄 Verificando...' : '🔍 Verificar Estado de Admin'}
            </button>
          </div>

          {/* Resultado de la verificación */}
          {checkResult && (
            <div style={{ 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              backgroundColor: checkResult.success ? '#d4edda' : '#f8d7da',
              border: `1px solid ${checkResult.success ? '#c3e6cb' : '#f5c6cb'}`,
              color: checkResult.success ? '#155724' : '#721c24'
            }}>
              <h4>📊 Resultado de Verificación</h4>
              <p><strong>Estado:</strong> {checkResult.message}</p>
              
              {checkResult.success && (
                <>
                  <div style={{ marginTop: '15px' }}>
                    <h5>🔐 Tu Sesión:</h5>
                    <p>Rol: <strong>{checkResult.currentSession?.role}</strong></p>
                  </div>
                  
                  <div style={{ marginTop: '15px' }}>
                    <h5>🗄️ En Base de Datos:</h5>
                    <p>Rol: <strong>{checkResult.databaseUser?.role}</strong></p>
                  </div>

                  {checkResult.needsUpdate && (
                    <div style={{ 
                      marginTop: '20px', 
                      padding: '15px', 
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffeaa7',
                      borderRadius: '6px',
                      color: '#856404'
                    }}>
                      <h5>⚡ Acción Requerida:</h5>
                      <ol>
                        {checkResult.instructions?.map((instruction: string, index: number) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                      
                      <button 
                        onClick={handleLogout}
                        style={{ 
                          marginTop: '10px',
                          padding: '10px 20px', 
                          backgroundColor: '#dc3545', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        🚪 Cerrar Sesión y Re-login
                      </button>
                    </div>
                  )}

                  {!checkResult.needsUpdate && checkResult.databaseUser?.role === 'admin' && (
                    <div style={{ 
                      marginTop: '20px', 
                      padding: '15px', 
                      backgroundColor: '#d1ecf1',
                      border: '1px solid #bee5eb',
                      borderRadius: '6px',
                      color: '#0c5460'
                    }}>
                      <p>✅ <strong>Tu sesión ya está correcta!</strong></p>
                      <p>Deberías ver las opciones de administrador en el menú.</p>
                      <p>Si no las ves, intenta recargar la página.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Información adicional */}
          <div style={{ 
            backgroundColor: '#e9ecef', 
            padding: '15px', 
            borderRadius: '6px',
            fontSize: '14px',
            color: '#6c757d'
          }}>
            <h5>ℹ️ Información</h5>
            <p>Esta página verifica si tu cuenta tiene permisos de administrador y si tu sesión actual refleja esos permisos.</p>
            <p>Si hay una discrepancia, necesitarás cerrar sesión y volver a iniciar sesión para que NextAuth genere un nuevo token con el rol correcto.</p>
          </div>
        </div>
      )}
    </div>
  );
} 