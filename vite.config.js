import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// '/' for the home-server deployment; the GitHub Pages workflow sets
// VITE_BASE=/ComPoundEd/ since project pages live under a subpath.
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Compounded',
        short_name: 'Compounded',
        description:
          'A dog-themed game for kids to practice and master their multiplication tables.',
        theme_color: '#f59e0b',
        background_color: '#fff7ea',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
});
