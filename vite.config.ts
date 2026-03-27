import { defineConfig } from 'vite-plus';

export default defineConfig({
    resolve: {
        alias: {
            '#curlytag': new URL('./curlytag.js', import.meta.url).pathname,
            '#fixtures': new URL('./tests/fixtures', import.meta.url).pathname,
        },
    },
    server: {
        host: '127.0.0.1',
    },
    staged: {
        '*': 'vp check --fix',
    },
    lint: {},
    fmt: {
        singleQuote: true,
        ignorePatterns: ['**/*.md'],
    },
});
