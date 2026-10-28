import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    root: __dirname,
    server: {
        port: 5173,
        proxy: {
            '/v1/auth': 'http://localhost:3000',
            '/v1/projects': 'http://localhost:3001',
            '/v1/tasks': 'http://localhost:3002',
            '/v1/notifications': { target: 'http://localhost:3003', ws: true },
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
});