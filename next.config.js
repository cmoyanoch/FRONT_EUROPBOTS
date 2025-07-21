/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        domains: ['localhost'],
    },
    // Configuración para páginas dinámicas
    experimental: {
        // Deshabilitar generación estática para páginas con cookies
        staticPageGenerationTimeout: 0,
    },
    // Configuración de caché para assets estáticos
    generateBuildId: async () => {
        return `build-${Date.now()}`
    },
    // Headers para control de caché
    async headers() {
        return [
            {
                source: '/_next/static/css/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/static/js/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ]
    },
}

module.exports = nextConfig 