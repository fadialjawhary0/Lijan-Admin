// import { defineConfig } from 'vite';
// import tailwindcss from '@tailwindcss/vite';

// import react from '@vitejs/plugin-react';

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
// });

import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'server',
      configureServer: server => {
        server.middlewares.use((req, res, next) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          next();
        });
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 5174,
  },
  build: {
    emptyOutDir: true,
  },
  base: '/committee-admin/',
});
