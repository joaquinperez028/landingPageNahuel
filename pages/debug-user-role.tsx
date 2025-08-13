import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface DebugUserRoleProps {
  session: any;
}

export default function DebugUserRolePage({ session }: DebugUserRoleProps) {
  const [userRole, setUserRole] = useState<string>('loading...');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!session?.user?.email) return;
      
      try {
        const response = await fetch(`/api/users/role?email=${session.user.email}`);
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role || 'normal');
          setDebugInfo(data);
        } else {
          setUserRole('error');
        }
      } catch (error) {
        console.error('Error verificando rol:', error);
        setUserRole('error');
      }
    };

    checkUserRole();
  }, [session]);

  return (
    <>
      <Head>
        <title>Debug User Role | Nahuel Lozano</title>
      </Head>

      <Navbar />

      <main className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">🔍 Debug User Role</h1>
          
          <div className="bg-gray-900 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Información de Sesión</h2>
            <div className="space-y-2">
              <p><strong>Email:</strong> {session?.user?.email || 'No disponible'}</p>
              <p><strong>Nombre:</strong> {session?.user?.name || 'No disponible'}</p>
              <p><strong>Rol en sesión:</strong> {session?.user?.role || 'No disponible'}</p>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Rol desde API</h2>
            <div className="space-y-2">
              <p><strong>Estado:</strong> {userRole}</p>
              <p><strong>Es admin:</strong> {userRole === 'admin' ? '✅ Sí' : '❌ No'}</p>
            </div>
          </div>

          {debugInfo && (
            <div className="bg-gray-900 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4">Información de Debug</h2>
              <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Acciones</h2>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Recargar página
              </button>
              
              <button
                onClick={() => {
                  const email = session?.user?.email;
                  if (email) {
                    window.open(`/api/users/role?email=${email}`, '_blank');
                  }
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded ml-4"
              >
                Probar API directamente
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}; 