/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['image.mux.com', 'lh3.googleusercontent.com', 'via.placeholder.com'],
  },
  // Removed env config to prevent build-time validation errors
}

module.exports = nextConfig 