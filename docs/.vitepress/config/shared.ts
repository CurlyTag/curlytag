import type { DefaultTheme } from 'vitepress';

export const currentVersion = 'v0.1.0';
export const mainDocsUrl = 'https://github.com/curlytag/curlytag/tree/main/docs/en';

const withBase = (base: string, path: string) => `${base}${path}`;

export const createVersionNav = (
    base: string,
    labels: {
        current: string;
        latest: string;
    },
): DefaultTheme.NavItemWithChildren => ({
    text: currentVersion,
    items: [
        {
            text: `${currentVersion} (${labels.current})`,
            link: withBase(base, '/guide/getting-started'),
        },
        {
            text: labels.latest,
            link: mainDocsUrl,
        },
    ],
});

export const createNav = (
    base: string,
    labels: {
        guide: string;
        playground: string;
        current: string;
        latest: string;
    },
): DefaultTheme.NavItem[] => [
    createVersionNav(base, { current: labels.current, latest: labels.latest }),
    {
        text: labels.guide,
        link: withBase(base, '/guide/getting-started'),
        activeMatch: `${base}/guide/`,
    },
    { text: labels.playground, link: withBase(base, '/playground') },
    { text: 'npm', link: 'https://www.npmjs.com/package/@curlytag/curlytag' },
];

export const createSidebar = (
    base: string,
    labels: {
        guide: string;
        gettingStarted: string;
        output: string;
        tags: string;
        filters: string;
        customFilters: string;
        playground: string;
        development: string;
    },
): DefaultTheme.SidebarItem[] => [
    {
        text: labels.guide,
        items: [
            { text: labels.gettingStarted, link: withBase(base, '/guide/getting-started') },
            { text: labels.output, link: withBase(base, '/guide/output') },
            { text: labels.tags, link: withBase(base, '/guide/tags') },
            { text: labels.filters, link: withBase(base, '/guide/filters') },
            { text: labels.customFilters, link: withBase(base, '/guide/custom-filters') },
        ],
    },
    { text: labels.playground, link: withBase(base, '/playground') },
    { text: labels.development, link: withBase(base, '/development') },
];

export const commonThemeConfig: Pick<
    DefaultTheme.Config,
    'footer' | 'logo' | 'search' | 'siteTitle' | 'socialLinks'
> = {
    logo: '/logo.svg',
    siteTitle: 'CurlyTag',
    socialLinks: [{ icon: 'github', link: 'https://github.com/curlytag/curlytag' }],
    footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright © CurlyTag contributors',
    },
    search: { provider: 'local' },
};
