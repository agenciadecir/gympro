import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Desactivar Turbopack en producción
  experimental: {
    turboServer: false,
  },
  // Forzar webpack
  webpack: (config) => {
    return config
  },
}

export default nextConfig