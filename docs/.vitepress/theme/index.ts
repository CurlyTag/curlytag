import DefaultTheme from 'vitepress/theme';
import { markRaw } from 'vue';
import Layout from './Layout';
import PlaygroundApp from './PlaygroundApp';
import './style.css';

export default {
    extends: DefaultTheme,
    Layout: markRaw(Layout),
    enhanceApp({ app }: { app: any }) {
        app.component('PlaygroundApp', PlaygroundApp);
    },
};
