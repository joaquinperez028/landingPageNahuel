/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['image.mux.com', 'lh3.googleusercontent.com', 'via.placeholder.com'],
  },
  // Transpile react-hot-toast para solucionar problemas de ES modules
  transpilePackages: ['react-hot-toast'],
  experimental: {
    esmExternals: false, // Deshabilitar ES modules externos para compatibilidad
  },
  // Configuración adicional para manejar ES modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig 