import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader } from 'lucide-react';

export default function DebugMercadoPago() {
  const { data: session } = useSession();
  const [debugResult, setDebugResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDebug = async () => {
    setIsLoading(true);
    setDebugResult(null);

    try {
      const response = await fetch('/api/debug-mercadopago');
      const data = await response.json();
      setDebugResult(data);
    } catch (error) {
      console.error('Error:', error);
      setDebugResult({ error: 'Error de conexión' });
    } finally {
      setIsLoading(false);
    }
  };

  const testCheckout = async () => {
    if (!session) {
      alert('Debes iniciar sesión primero');
      return;
    }

    setIsLoading(true);
    setDebugResult(null);

    try {
      const response = await fetch('/api/payments/mercadopago/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          type: 'subscription',
          service: 'TraderCall',
          amount: 15000,
          currency: 'ARS'
        }),
      });

      const data = await response.json();
      setDebugResult(data);

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Error:', error);
      setDebugResult({ error: 'Error de conexión' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Debug MercadoPago - Página Principal</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Estado de la sesión:</h2>
        <p>Usuario: {session?.user?.email || 'No autenticado'}</p>
        <p>Estado: {session ? 'Autenticado' : 'No autenticado'}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Debug del sistema:</h2>
        <button
          onClick={runDebug}
          disabled={isLoading}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '1rem'
          }}
        >
          {isLoading ? (
            <>
              <Loader size={16} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
              Procesando...
            </>
          ) : (
            'Ejecutar Debug'
          )}
        </button>

        <button
          onClick={testCheckout}
          disabled={isLoading || !session}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            backgroundColor: isLoading || !session ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading || !session ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? (
            <>
              <Loader size={16} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
              Procesando...
            </>
          ) : (
            'Probar Checkout (TraderCall)'
          )}
        </button>
      </div>

      {debugResult && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Resultado:</h2>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(debugResult, null, 2)}
          </pre>
        </div>
      )}

             <div style={{
         backgroundColor: '#fff3cd',
         border: '1px solid #ffeaa7',
         padding: '1rem',
         borderRadius: '8px'
       }}>
         <h3>🔍 Diagnóstico para Vercel:</h3>
         <p>Esta página te ayudará a identificar el problema con MercadoPago en la página principal.</p>
         <ul>
           <li><strong>Debug del sistema:</strong> Verifica variables de entorno de Vercel y sesión</li>
           <li><strong>Probar Checkout:</strong> Intenta crear un checkout real usando las credenciales de Vercel</li>
           <li><strong>Resultado:</strong> Muestra la respuesta detallada del servidor</li>
         </ul>
         <p><strong>⚠️ Importante:</strong> Las variables de entorno están configuradas en Vercel, no en tu entorno local.</p>
       </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 