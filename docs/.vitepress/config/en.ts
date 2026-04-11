import type { DefaultTheme } from 'vitepress';
import { commonThemeConfig, createNav, createSidebar } from './shared';

export const enThemeConfig: DefaultTheme.Config = {
    ...commonThemeConfig,
    nav: createNav('', {
        guide: 'Guide',
        playground: 'Playground',
        current: 'Current',
        latest: 'main (GitHub)',
    }),
    sidebar: createSidebar('', {
        guide: 'Guide',
        gettingStarted: 'Getting Started',
        output: 'Output',
        tags: 'Tags',
        filters: 'Filters',
        customFilters: 'Custom Filters',
        playground: 'Playground',
        development: 'Development',
    }),
    langMenuLabel: 'Languages',
};
