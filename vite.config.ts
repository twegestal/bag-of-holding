/// <reference types="vitest" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),

      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['d20-black.webp', 'icons/180.png'],

        workbox: {
          navigateFallback: '/index.html',

          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 5,
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },

        devOptions: {
          enabled: false,
        },
      }),
    ],

    base: env.VITE_BASE || '/',

    server: {
      host: true,
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },

    preview: {
      port: 4173,
      strictPort: true,
    },

    build: {
      target: 'es2022',
      sourcemap: false,
    },

    optimizeDeps: {
      include: [
        '@mantine/core',
        '@mantine/hooks',
        '@mantine/notifications',
        '@mantine/modals',
        '@mantine/dates',
        'dayjs',
      ],
    },

    test: {
      globals: true,
      environment: 'happy-dom',
    },
  };
});
