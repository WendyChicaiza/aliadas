import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En GitHub Pages la app vive en /aliadas/, por eso la ruta base cambia solo al compilar.
// En Render (sitio en la raíz) se define VITE_BASE=/ al construir.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? process.env.VITE_BASE || '/aliadas/' : '/',
  plugins: [react()]
}));