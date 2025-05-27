import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            process: 'process/browser',
            stream: 'stream-browserify',
            util: 'util',
        },
    },
    define: {
        global: 'window',
    },
});