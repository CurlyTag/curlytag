import { defineConfig } from 'vitepress';
import { fileURLToPath } from 'node:url';
import { enThemeConfig } from './en';

export default defineConfig({
    rewrites: {
        'en/:rest*': ':rest*',
    },

    lang: 'en-US',
    title: 'CurlyTag',
    description: 'Open Source JavaScript Template Engine',
    cleanUrls: true,
    lastUpdated: true,

    head: [['link', { rel: 'icon', href: '/favicon.ico' }]],

    locales: {
        root: {
            label: 'English',
            lang: 'en-US',
        },
    },

    themeConfig: enThemeConfig,

    vite: {
        resolve: {
            alias: {
                '#curlytag': fileURLToPath(new URL('../../../curlytag.js', import.meta.url)),
                '#fixtures': fileURLToPath(new URL('../../../tests/fixtures', import.meta.url)),
                '#playground': fileURLToPath(new URL('../../../playground', import.meta.url)),
            },
        },
    },
});
