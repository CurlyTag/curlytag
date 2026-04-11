declare module '*.css';

declare module '*?raw' {
    const content: string;
    export default content;
}

declare module '#playground/playground.js' {
    export function init(root?: Document | HTMLElement): void | (() => void);
}

declare module 'node:url' {
    export function fileURLToPath(url: string | URL): string;
}
