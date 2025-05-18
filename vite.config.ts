import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    css: {
        postcss: {
            plugins: [tailwind(), autoprefixer()],
        },
        devSourcemap: false,
    },
    plugins: [
        vue(),
        legacy(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            workbox: {
                maximumFileSizeToCacheInBytes: 4194304 // 4 MiB
            },
            manifest: {
                name: 'FeastRight Recipe Scraper',
                short_name: 'FeastRight',
                description: 'A beautiful, modern recipe scraping and management app.',
                start_url: '/',
                display: 'standalone',
                background_color: '#18181b',
                theme_color: '#18181b',
                orientation: 'portrait-primary',
                icons: [
                    {
                        src: '/Chef/Chef_192x192.webp',
                        sizes: '192x192',
                        type: 'image/webp'
                    },
                    {
                        src: '/Chef/Chef_192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/Chef/Chef_512x512.webp',
                        sizes: '512x512',
                        type: 'image/webp'
                    },
                    {
                        src: '/Chef/Chef_512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        target: 'esnext',
        minify: true, // Use esbuild (default, safest)
    }
});
