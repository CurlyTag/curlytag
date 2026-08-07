import DefaultTheme from 'vitepress/theme';
import { Fragment, defineComponent, h } from 'vue';
import DocsActions from './DocsActions';

const DefaultLayout = DefaultTheme.Layout;

export default defineComponent({
    name: 'CurlyTagLayout',
    setup(_, { slots }) {
        return () =>
            h(Fragment, null, [
                h('div', { class: 'bg-mesh', 'aria-hidden': 'true' }),
                h(DefaultLayout, null, {
                    ...slots,
                    'doc-before': () => [h(DocsActions), slots['doc-before']?.()],
                }),
            ]);
    },
});
