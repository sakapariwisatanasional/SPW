import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/spwn': {
          target: 'https://script.google.com/macros/s/AKfycbzuR8k2KbXHb6om2eNaIGM3yBBBsZtEFoLKji1H2dAWp4a6v8nrBAbwQj_S5S-SPBtXOg/exec',
          changeOrigin: true,
          followRedirects: true,
          rewrite: () => '',
        },
      },
    },
  };
});
