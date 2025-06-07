import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function RefreshSessionPage() {
  const { data: session, status, update } = useSession();
  const [updating, setUpdating] = useState(false);

  const handleForceUpdate = async () => {
    setUpdating(true);
    console.log('🔄 Forzando actualización de sesión...');
    
    try {
      await update(); // Esto fuerza a NextAuth a ejecutar los callbacks
      console.log('✅ Sesión actualizada');
    } catch (error) {
      console.error('❌ Error al actualizar sesión:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Cerrando sesión...');
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔄 Refresh Session Debug</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>📊 Estado Actual</h3>
        <p><strong>Status:</strong> {status}</p>
        {session && (
          <>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Nombre:</strong> {session.user.name}</p>
            <p><strong>Rol:</strong> <span style={{ 
              color: session.user.role === 'admin' ? 'green' : 'orange',
              fontWeight: 'bold'
            }}>{session.user.role || 'undefined'}</span></p>
            <p><strong>ID:</strong> {session.user.id || 'undefined'}</p>
          </>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleForceUpdate}
          disabled={updating}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            marginRight: '10px',
            cursor: updating ? 'not-allowed' : 'pointer',
            opacity: updating ? 0.6 : 1
          }}
        >
          {updating ? '🔄 Actualizando...' : '🔄 Forzar Update de Sesión'}
        </button>

        <button 
          onClick={handleLogout}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🚪 Logout y Re-login
        </button>
      </div>

      <div style={{ 
        padding: '15px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <h4>📋 Instrucciones:</h4>
        <ol>
          <li>Abre la consola del navegador (F12)</li>
          <li>Haz clic en "Forzar Update de Sesión"</li>
          <li>Observa los logs que aparecen en la consola</li>
          <li>Si el rol sigue como undefined, usa "Logout y Re-login"</li>
        </ol>
        <p><em>Los logs te dirán si el JWT callback está obteniendo el rol correcto de la BD.</em></p>
      </div>
    </div>
  );
} 