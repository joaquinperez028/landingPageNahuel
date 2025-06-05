import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode: number;
  hasGetInitialPropsRun: boolean;
  err?: Error;
}

function Error({ statusCode, hasGetInitialPropsRun, err }: ErrorProps) {
  console.error('🚨 Error page rendered:', { statusCode, hasGetInitialPropsRun, err });
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1>
        {statusCode
          ? `Error ${statusCode} - Algo salió mal`
          : 'Error del cliente'}
      </h1>
      <p>
        {statusCode === 404
          ? 'Esta página no se pudo encontrar.'
          : 'Ocurrió un error en el servidor. Intenta recargar la página.'}
      </p>
      {process.env.NODE_ENV === 'development' && err && (
        <details style={{ marginTop: '20px', width: '100%', maxWidth: '600px' }}>
          <summary>Detalles del error (solo en desarrollo)</summary>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {err.stack}
          </pre>
        </details>
      )}
      <button 
        onClick={() => window.location.reload()} 
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Recargar página
      </button>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode ?? 500 : 404;
  
  console.error('🚨 Error getInitialProps:', { statusCode, err: err?.message });
  
  return { statusCode, hasGetInitialPropsRun: true, err };
};

export default Error; 