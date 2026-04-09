import { playwright } from 'vite-plus/test/browser-playwright';
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
        projects: [
            {
                resolve: {
                    alias: {
                        '#curlytag': new URL('./curlytag.js', import.meta.url).pathname,
                        '#fixtures': new URL('./tests/fixtures', import.meta.url).pathname,
                    },
                },
                test: {
                    name: 'node',
                    include: ['../tests/**/*.test.js'],
                    exclude: ['../tests/**/*.browser.test.js'],
                },
            },
            {
                resolve: {
                    alias: {
                        '#curlytag': new URL('./curlytag.js', import.meta.url).pathname,
                    },
                },
                test: {
                    name: 'browser',
                    include: ['../tests/**/*.browser.test.js'],
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright(),
                        instances: [{ browser: 'chromium' }],
                    },
                },
            },
        ],
    },
    fmt: {
        singleQuote: true,
        ignorePatterns: ['**/*.md', 'playground/examples/**/template.html'],
    },
});
