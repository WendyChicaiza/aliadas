import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En GitHub Pages la app vive en /aliadas/, por eso la ruta base cambia solo al compilar.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/aliadas/' : '/',
  plugins: [react()]
}));