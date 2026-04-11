FROM mcr.microsoft.com/devcontainers/javascript-node:24

RUN curl -fsSL https://vite.plus | bash \
    && curl -fsSL https://bun.sh/install | bash \
    && curl -fsSL https://deno.land/install.sh | sh \
    && npx playwright install chromium --with-deps
