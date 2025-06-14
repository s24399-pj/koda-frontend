import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

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
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/__tests__/setup.ts',
    },
})
