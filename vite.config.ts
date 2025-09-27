import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['images/*.png', 'images/*.jpg', 'images/*.webp'],
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'Bima',
        short_name: 'Bima',
        start_url: '.',
        display: 'standalone',
        background_color: '#fff',
        theme_color: '#00c8ffff',
        icons: [
          {
            src: '/192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],

        
        screenshots: [
    {
      "src": "/Desktop.png",
      "sizes": "1280x644",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/mobile.png",
      "sizes": "457x662",
      "type": "image/png",
      "form_factor": "narrow"
    }
        
        ]
      },
       workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,webp,svg}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // ⬅️ 4MB
      },
    }),
  ],
});