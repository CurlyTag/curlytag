import { useData } from 'vitepress';
import arrowDownSLineIcon from 'remixicon/icons/Arrows/arrow-down-s-line.svg?raw';
import externalLinkLineIcon from 'remixicon/icons/System/external-link-line.svg?raw';
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';

const markdownModules = import.meta.glob('../../**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>;

const repoBlobRoot = 'https://github.com/curlytag/curlytag/blob/main/docs/';

const markdownByRelativePath = Object.fromEntries(
    Object.entries(markdownModules).map(([path, content]) => [path.replace('../../', ''), content]),
);

const resolveMarkdownPath = (relativePath: string) => {
    const normalizedPath = relativePath.replace(/^\/+/, '');

    const candidates = normalizedPath.startsWith('en/')
        ? [normalizedPath, normalizedPath.slice(3)]
        : [`en/${normalizedPath}`, normalizedPath];

    return (
        candidates.find(
            (candidate) => candidate.length > 0 && markdownByRelativePath[candidate] !== undefined,
        ) ?? normalizedPath
    );
};

const withIconClass = (svg: string, className: string) =>
    svg.replace('<svg', `<svg class="${className}" aria-hidden="true"`);

const copyText = async (text: string) => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement('textarea');

    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
};

export default defineComponent({
    name: 'DocsActions',
    setup() {
        const { frontmatter, page } = useData();
        const label = ref('Copy Markdown');
        const menuOpen = ref(false);
        const root = ref<HTMLElement | null>(null);
        let resetTimer: number | null = null;
        let rawMarkdownUrl: string | null = null;

        const hidden = computed(() => frontmatter.value.pageClass === 'page-playground');
        const relativePath = computed(() => page.value.relativePath);
        const markdownPath = computed(() => resolveMarkdownPath(relativePath.value));
        const markdownSource = computed(() => markdownByRelativePath[markdownPath.value] ?? '');
        const githubUrl = computed(() => `${repoBlobRoot}${markdownPath.value}`);

        const revokeRawMarkdownUrl = () => {
            if (!rawMarkdownUrl) return;

            URL.revokeObjectURL(rawMarkdownUrl);
            rawMarkdownUrl = null;
        };

        const resetLabel = () => {
            label.value = 'Copy Markdown';
            resetTimer = null;
        };

        const closeMenu = () => {
            menuOpen.value = false;
        };

        const onPointerDown = (event: PointerEvent) => {
            if (!menuOpen.value) return;

            const target = event.target;

            if (!(target instanceof Node)) return;
            if (root.value?.contains(target)) return;

            closeMenu();
        };

        const onCopy = async () => {
            try {
                if (!markdownSource.value) throw new Error('Nothing to copy');

                await copyText(markdownSource.value);
                label.value = 'Copied';
            } catch {
                label.value = 'Copy failed';
            }

            if (resetTimer !== null) window.clearTimeout(resetTimer);
            resetTimer = window.setTimeout(resetLabel, 1600);
        };

        const onOpenRawMarkdown = () => {
            if (!markdownSource.value) {
                closeMenu();
                return;
            }

            revokeRawMarkdownUrl();

            rawMarkdownUrl = URL.createObjectURL(
                new Blob([markdownSource.value], {
                    type: 'text/markdown;charset=utf-8',
                }),
            );

            window.open(rawMarkdownUrl, '_blank', 'noopener,noreferrer');
            closeMenu();

            window.setTimeout(() => {
                revokeRawMarkdownUrl();
            }, 60_000);
        };

        onMounted(() => {
            window.addEventListener('pointerdown', onPointerDown);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('pointerdown', onPointerDown);
            if (resetTimer !== null) window.clearTimeout(resetTimer);
            revokeRawMarkdownUrl();
        });

        return () => {
            if (hidden.value) return null;

            return h('div', { ref: root, class: 'docs-actions' }, [
                h(
                    'button',
                    {
                        class: 'docs-actions__button docs-actions__button--copy',
                        type: 'button',
                        onClick: onCopy,
                    },
                    [
                        h(
                            'span',
                            {
                                class: 'docs-actions__button-text',
                                'aria-live': 'polite',
                            },
                            label.value,
                        ),
                        h(
                            'span',
                            {
                                class: 'docs-actions__button-sizer',
                                'aria-hidden': 'true',
                            },
                            'Copy Markdown',
                        ),
                    ],
                ),
                h('div', { class: 'docs-actions__menu' }, [
                    h(
                        'button',
                        {
                            class: 'docs-actions__button docs-actions__button--ghost',
                            type: 'button',
                            'aria-expanded': String(menuOpen.value),
                            'aria-haspopup': 'menu',
                            onClick: () => {
                                menuOpen.value = !menuOpen.value;
                            },
                        },
                        [
                            h('span', { class: 'docs-actions__button-label' }, 'Open'),
                            h('span', {
                                class: `docs-actions__chevron${menuOpen.value ? ' is-open' : ''}`,
                                innerHTML: withIconClass(
                                    arrowDownSLineIcon,
                                    'docs-actions__chevron-svg',
                                ),
                            }),
                        ],
                    ),
                    menuOpen.value
                        ? h('div', { class: 'docs-actions__popover', role: 'menu' }, [
                              h(
                                  'a',
                                  {
                                      class: 'docs-actions__item',
                                      href: githubUrl.value,
                                      target: '_blank',
                                      rel: 'noopener noreferrer',
                                      role: 'menuitem',
                                      onClick: closeMenu,
                                  },
                                  [
                                      h(
                                          'span',
                                          { class: 'docs-actions__item-label' },
                                          'Open in GitHub',
                                      ),
                                      h('span', {
                                          class: 'docs-actions__item-icon',
                                          innerHTML: withIconClass(
                                              externalLinkLineIcon,
                                              'docs-actions__item-icon-svg',
                                          ),
                                      }),
                                  ],
                              ),
                              h(
                                  'button',
                                  {
                                      class: 'docs-actions__item',
                                      type: 'button',
                                      role: 'menuitem',
                                      onClick: onOpenRawMarkdown,
                                  },
                                  [
                                      h(
                                          'span',
                                          { class: 'docs-actions__item-label' },
                                          'Open Raw Markdown',
                                      ),
                                      h('span', {
                                          class: 'docs-actions__item-icon',
                                          innerHTML: withIconClass(
                                              externalLinkLineIcon,
                                              'docs-actions__item-icon-svg',
                                          ),
                                      }),
                                  ],
                              ),
                          ])
                        : null,
                ]),
            ]);
        };
    },
});
