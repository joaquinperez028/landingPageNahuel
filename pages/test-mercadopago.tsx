import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader } from 'lucide-react';

export default function TestMercadoPago() {
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testCheckout = async () => {
    if (!session) {
      alert('Debes iniciar sesión primero');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('/api/payments/mercadopago/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          type: 'subscription',
          service: 'CashFlow',
          amount: 25000,
          currency: 'ARS'
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Error de conexión' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test MercadoPago Integration</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Estado de la sesión:</h2>
        <p>Usuario: {session?.user?.email || 'No autenticado'}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Test de Checkout:</h2>
        <button 
          onClick={testCheckout}
          disabled={isProcessing || !session}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            backgroundColor: isProcessing ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isProcessing ? 'not-allowed' : 'pointer'
          }}
        >
          {isProcessing ? (
            <>
              <Loader size={16} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
              Procesando...
            </>
          ) : (
            'Probar Checkout CashFlow ($25,000 ARS)'
          )}
        </button>
      </div>

      {result && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Resultado:</h2>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '8px',
            overflow: 'auto'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h2>Variables de entorno necesarias:</h2>
        <ul>
          <li><strong>MERCADOPAGO_ACCESS_TOKEN:</strong> Token de acceso de MercadoPago</li>
          <li><strong>MP_PUBLIC_KEY:</strong> Clave pública de MercadoPago</li>
          <li><strong>NEXTAUTH_URL:</strong> URL de la aplicación</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7', 
        padding: '1rem', 
        borderRadius: '8px' 
      }}>
        <h3>⚠️ Nota importante:</h3>
        <p>
          Para que MercadoPago funcione correctamente, necesitas configurar las variables de entorno 
          en tu archivo <code>.env.local</code> o en las variables de entorno de tu sistema.
        </p>
        <p>
          Las variables deben incluir credenciales válidas de MercadoPago (puedes usar las de prueba 
          para desarrollo).
        </p>
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