import { defineConfig } from 'vite-plus';

export default defineConfig({
    root: 'playground',
    resolve: {
        alias: {
            '#curlytag': new URL('./curlytag.js', import.meta.url).pathname,
            '#fixtures': new URL('./tests/fixtures', import.meta.url).pathname,
        },
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
    server: {
        host: '127.0.0.1',
    },
    staged: {
        '*': 'vp check --fix',
    },
    lint: {},
    test: {
        include: ['../tests/**/*.test.js'],
    },
    fmt: {
        singleQuote: true,
        ignorePatterns: ['**/*.md', 'playground/examples/**/template.html'],
    },
});
