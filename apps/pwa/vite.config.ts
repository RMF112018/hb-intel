/* eslint-disable @hbc/hbc/enforce-hbc-tokens -- TODO: use HBC tokens (Phase 4b.11) */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'HB Intel',
        short_name: 'HB Intel',
        description: 'Construction intelligence platform',
        theme_color: '#004B87',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@hbc/models': path.resolve(__dirname, '../../packages/models/src'),
      '@hbc/data-access': path.resolve(__dirname, '../../packages/data-access/src'),
      '@hbc/query-hooks': path.resolve(__dirname, '../../packages/query-hooks/src'),
      '@hbc/auth': path.resolve(__dirname, '../../packages/auth/src'),
      // Subpath alias must come before the root @hbc/shell alias — Vite matches aliases
      // in order, so the more specific entry wins over the bare package alias.
      '@hbc/shell/dev-toolbar': path.resolve(__dirname, '../../packages/shell/src/devToolbar/index.ts'),
      '@hbc/shell': path.resolve(__dirname, '../../packages/shell/src'),
      '@hbc/ui-kit': path.resolve(__dirname, '../../packages/ui-kit/src'),
    },
  },
  define: {
    'process.env.HBC_ADAPTER_MODE': JSON.stringify(
      process.env.VITE_ADAPTER_MODE ?? (mode === 'development' ? 'mock' : 'proxy'),
    ),
    'process.env.HBC_AUTH_MODE_OVERRIDE': JSON.stringify(
      process.env.VITE_AUTH_MODE ?? (mode === 'development' ? 'mock' : 'msal'),
    ),
  },
  server: {
    port: 4000,
  },
}));
