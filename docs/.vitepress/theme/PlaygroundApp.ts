import '#playground/playground.css';
import playgroundMarkup from '#playground/playground-markup.html?raw';
import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';

export default defineComponent({
    name: 'PlaygroundApp',
    setup() {
        const container = ref<HTMLElement | null>(null);
        let cleanup: null | (() => void) = null;

        onMounted(async () => {
            const { init } = await import('#playground/playground.js');

            cleanup = init(container.value ?? undefined) ?? null;
        });

        onBeforeUnmount(() => {
            cleanup?.();
            cleanup = null;
        });

        return () =>
            h('div', { ref: container, class: 'playground-root', innerHTML: playgroundMarkup });
    },
});
