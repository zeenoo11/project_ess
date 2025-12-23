import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // Essential for itch.io to find assets in the same directory
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
    },
    server: {
        port: 3000,
        open: true,
    },
});
