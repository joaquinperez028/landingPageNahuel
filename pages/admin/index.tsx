import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';

const AdminRedirect: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#1f2937',
      color: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        <h1>Redirigiendo al Dashboard...</h1>
        <p>Si no eres redirigido automáticamente, haz clic <a href="/admin/dashboard" style={{ color: '#3b82f6' }}>aquí</a></p>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const verification = await verifyAdminAccess(context);
  
  if (!verification.isAdmin) {
    return {
      redirect: {
        destination: verification.redirectTo || '/',
        permanent: false,
      },
    };
  }

  // Redirigir automáticamente al dashboard
  return {
    redirect: {
      destination: '/admin/dashboard',
      permanent: false,
    },
  };
};

export default AdminRedirect; 