import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // Aliasy dla bibliotek Node.js używanych przez SockJS
            process: 'process/browser',
            stream: 'stream-browserify',
            util: 'util',
        },
    },
    define: {
        // Dodanie globalnych definicji
        global: 'window',
    },
});