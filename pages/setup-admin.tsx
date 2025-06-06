import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Key, CheckCircle, AlertTriangle } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';

export default function SetupAdminPage({ session, hasAdmins }: any) {
  const [securityCode, setSecurityCode] = useState('');
  const [targetEmail, setTargetEmail] = useState(session?.user?.email || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/setup-first-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          securityCode: securityCode.trim(),
          targetEmail: targetEmail.trim()
        })
      });

      const data = await response.json();
      setResult({ ...data, success: response.ok });

    } catch (error) {
      setResult({
        success: false,
        message: 'Error de conexión. Intenta nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Si ya existen administradores, mostrar mensaje
  if (hasAdmins) {
    return (
      <>
        <Head>
          <title>Setup Admin - Ya Configurado</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-600">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Sistema Ya Configurado
            </h1>
            <p className="text-slate-300 mb-6">
              El sistema ya tiene administradores configurados. Esta página de setup ya no es necesaria.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Configurar Primer Administrador</title>
        <meta name="description" content="Configuración inicial del sistema de administración" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-600"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Configurar Primer Administrador
            </h1>
            <p className="text-slate-400 text-sm">
              Configura el administrador inicial del sistema
            </p>
          </div>

          {/* Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-amber-200 font-medium mb-1">Solo Primera Vez</p>
                <p className="text-amber-300/80">
                  Esta configuración solo funciona cuando no hay administradores en el sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email del Usuario */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Email del Usuario a Promover
              </label>
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="usuario@ejemplo.com"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                El usuario debe estar registrado en la aplicación
              </p>
            </div>

            {/* Código de Seguridad */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                <Key className="w-4 h-4 inline mr-2" />
                Código de Seguridad
              </label>
              <input
                type="password"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa el código de seguridad"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                Código por defecto: <code className="bg-slate-600 px-1 rounded">SETUP_FIRST_ADMIN_2024</code>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Configurando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Configurar Administrador
                </>
              )}
            </button>
          </form>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-500/10 border-green-500/20 text-green-200'
                  : 'bg-red-500/10 border-red-500/20 text-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="text-sm">
                  <p className="font-medium mb-1">
                    {result.success ? '¡Éxito!' : 'Error'}
                  </p>
                  <p className="opacity-90">{result.message}</p>
                  
                  {result.success && result.admin && (
                    <div className="mt-3 p-3 bg-slate-700/50 rounded border border-slate-600">
                      <p className="text-xs text-slate-300 mb-2">Nuevo Administrador:</p>
                      <p className="font-medium">{result.admin.name}</p>
                      <p className="text-xs text-slate-400">{result.admin.email}</p>
                    </div>
                  )}

                  {result.success && (
                    <div className="mt-4">
                      <Link 
                        href="/admin/notifications"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs transition-colors"
                      >
                        Ir al Panel de Administración
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Info */}
          <div className="mt-8 pt-6 border-t border-slate-600">
            <h3 className="text-sm font-medium text-slate-200 mb-3">Información:</h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• El usuario debe estar registrado en la aplicación</li>
              <li>• Solo funciona si no hay administradores existentes</li>
              <li>• El código de seguridad está en las variables de entorno</li>
              <li>• Una vez configurado, esta página se deshabilitará</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // Si no hay sesión, redirigir al login
  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }

  // Verificar si ya existen administradores
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: User } = await import('@/models/User');
    
    await dbConnect();
    const adminCount = await User.countDocuments({ role: 'admin' });

    return {
      props: {
        session,
        hasAdmins: adminCount > 0
      },
    };
  } catch (error) {
    console.error('Error verificando administradores:', error);
    return {
      props: {
        session,
        hasAdmins: false
      },
    };
  }
}; 