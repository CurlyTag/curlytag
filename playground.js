import { template } from '#curlytag';
import { EditorView, basicSetup } from 'codemirror';
import { ViewPlugin, Decoration } from '@codemirror/view';
import { EditorState, Compartment, RangeSetBuilder } from '@codemirror/state';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';

// ── CodeMirror Theme ────────────────────────────────────────────────────────

const cmTheme = EditorView.theme({
    '&': {
        fontSize: 'inherit',
        height: '100%',
        background: 'transparent',
    },
    '.cm-scroller': {
        fontFamily: 'var(--font-mono)',
        lineHeight: '1.6',
        overflow: 'auto',
    },
    '.cm-content': {
        padding: '12px 0',
        caretColor: 'var(--ct-text)',
    },
    '.cm-line': {
        padding: '0 14px',
    },
    '.cm-gutters': {
        display: 'none',
    },
    '&.cm-focused': {
        outline: 'none',
    },
    '&.cm-focused .cm-cursor': {
        borderLeftColor: 'var(--ct-text)',
    },
    '.cm-selectionBackground': {
        background: 'color-mix(in srgb, var(--ct-accent) 22%, transparent) !important',
    },
    '.cm-activeLine': {
        background: 'transparent',
    },
    '.cm-activeLineGutter': {
        background: 'transparent',
    },
});

// ── Whitespace Plugin ───────────────────────────────────────────────────────

const wsSpaceDeco = Decoration.mark({ class: 'cm-ws-space' });
const wsTabDeco = Decoration.mark({ class: 'cm-ws-tab' });

const buildWhitespaceDeco = (view) => {
    const builder = new RangeSetBuilder();

    for (const { from, to } of view.visibleRanges) {
        const text = view.state.doc.sliceString(from, to);

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];

            if (ch === ' ') builder.add(from + i, from + i + 1, wsSpaceDeco);
            else if (ch === '\t') builder.add(from + i, from + i + 1, wsTabDeco);
        }
    }

    return builder.finish();
};

const whitespacePlugin = ViewPlugin.fromClass(
    class {
        constructor(view) {
            this.decorations = buildWhitespaceDeco(view);
        }
        update(u) {
            if (u.docChanged || u.viewportChanged) this.decorations = buildWhitespaceDeco(u.view);
        }
    },
    { decorations: (v) => v.decorations },
);

// ── DOM refs ────────────────────────────────────────────────────────────────

const sourceEl = document.getElementById('output-source-code');
const popover = document.getElementById('examples-panel');
const editorControls = {
    template: {
        copyButton: document.querySelector('[data-editor-action="copy-template"]'),
        resetButton: document.querySelector('[data-editor-action="reset-template"]'),
    },
    data: {
        copyButton: document.querySelector('[data-editor-action="copy-data"]'),
        resetButton: document.querySelector('[data-editor-action="reset-data"]'),
    },
};

// ── Editor factory ──────────────────────────────────────────────────────────

const createEditor = (parent, langExt, onChange) => {
    const langCompartment = new Compartment();

    return new EditorView({
        parent,
        state: EditorState.create({
            doc: '',
            extensions: [
                basicSetup,
                langCompartment.of(langExt()),
                cmTheme,
                whitespacePlugin,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) onChange();
                }),
            ],
        }),
    });
};

// ── Editor state ────────────────────────────────────────────────────────────

const originalDocs = { template: '', data: '' };

let renderTimer;

const scheduleRender = () => {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 80);
};

const renderNow = () => {
    clearTimeout(renderTimer);
    return render();
};

const tplView = createEditor(document.getElementById('template-editor'), html, () => {
    syncResetButton('template');
    scheduleRender();
});

const dataView = createEditor(document.getElementById('data-editor'), json, () => {
    syncResetButton('data');
    scheduleRender();
});

// ── Editor helpers ──────────────────────────────────────────────────────────

const getEditorView = (kind) => (kind === 'template' ? tplView : dataView);

const getEditorDoc = (kind) => getEditorView(kind).state.doc.toString();

const replaceEditorDoc = (kind, value) => {
    const view = getEditorView(kind);

    view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
    });
};

const syncResetButton = (kind) => {
    editorControls[kind].resetButton.hidden = getEditorDoc(kind) === originalDocs[kind];
};

const syncEditorActions = () => {
    syncResetButton('template');
    syncResetButton('data');
};

const flashButton = (button, label) => {
    const previousLabel = button.textContent;

    button.textContent = label;
    window.setTimeout(() => {
        button.textContent = previousLabel;
    }, 1200);
};

const copyEditorDoc = async (kind) => {
    try {
        await navigator.clipboard.writeText(getEditorDoc(kind));
        flashButton(editorControls[kind].copyButton, 'Copied');
    } catch {
        flashButton(editorControls[kind].copyButton, 'Failed');
    }
};

const resetEditorDoc = (kind) => {
    replaceEditorDoc(kind, originalDocs[kind]);
    getEditorView(kind).focus();
    renderNow();
};

// ── Shiki ───────────────────────────────────────────────────────────────────

const highlighterPromise = import('shiki').then(({ createHighlighter }) =>
    createHighlighter({
        themes: ['github-light', 'github-dark'],
        langs: ['html'],
    }),
);

const getShikiTheme = () => {
    const darkChecked = document.getElementById('theme-dark').checked;
    const lightChecked = document.getElementById('theme-light').checked;

    if (darkChecked) return 'github-dark';
    if (lightChecked) return 'github-light';

    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'github-dark'
        : 'github-light';
};

const markWhitespace = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;

    while ((node = walker.nextNode())) textNodes.push(node);

    for (const tn of textNodes) {
        if (!/ |\t/.test(tn.nodeValue)) continue;

        const frag = document.createDocumentFragment();

        for (const ch of tn.nodeValue) {
            if (ch === ' ' || ch === '\t') {
                const s = document.createElement('span');

                s.className = ch === ' ' ? 'shiki-ws-space' : 'shiki-ws-tab';
                s.textContent = ch;
                frag.appendChild(s);
            } else {
                frag.appendChild(document.createTextNode(ch));
            }
        }

        tn.replaceWith(frag);
    }
};

const highlightOutput = async (code) => {
    const highlighter = await highlighterPromise;

    sourceEl.innerHTML = highlighter.codeToHtml(code || ' ', {
        lang: 'html',
        theme: getShikiTheme(),
    });

    markWhitespace(sourceEl);
};

// ── Render ──────────────────────────────────────────────────────────────────

const render = async () => {
    const tplCode = tplView.state.doc.toString();
    const dataCode = dataView.state.doc.toString();
    let data;

    try {
        data = JSON.parse(dataCode);
    } catch {
        await highlightOutput('');
        sourceEl.innerHTML = '<div class="panel__error">⚠ Invalid JSON in Data panel</div>';
        return;
    }

    try {
        const result = template.parse(tplCode, data);

        await highlightOutput(result);
    } catch (e) {
        await highlightOutput(String(e.message));
    }
};

// ── Examples ────────────────────────────────────────────────────────────────

const examples = {
    category: {
        template: `<div class="row mb-3">

  {% if thumb or images %}
    <div class="col-sm">
      <div class="image magnific-popup">
        {% if thumb %}
          <a href="{{ popup }}" title="{{ heading_title }}"><img src="{{ thumb }}" title="{{ heading_title }}" alt="{{ heading_title }}" class="img-thumbnail mb-3"/></a>
        {% endif %}

        {% if images %}
          <div>
            {% for image in images %}
              <a href="{{ image.popup }}" title="{{ heading_title }}"><img src="{{ image.thumb }}" title="{{ heading_title }}" alt="{{ heading_title }}" class="img-thumbnail" style="width: 74px"/></a>&nbsp;
            {% endfor %}
          </div>
        {% endif %}

      </div>
    </div>
  {% endif %}

  <div class="col-sm">
    <h1>{{ heading_title }}</h1>

    <ul class="list-unstyled mb-1">
      {% if manufacturer %}
        <li>{{ text_manufacturer }}: <strong><a href="{{ manufacturers }}">{{ manufacturer }}</a></strong></li>
      {% endif %}

      <li>{{ text_model }}: <strong>{{ model }}</strong></li>
      {% for product_code in product_codes %}
        <li>{{ product_code.code }}: <strong>{{ product_code.value }}</strong></li>
      {% endfor %}

      {% if reward %}
        <li>{{ text_reward }}: <strong>{{ reward }}</strong></li>
      {% endif %}

      <li>{{ text_stock }}: <strong><span class="text-{% if stock %}success{% else %}danger{% endif %}">{{ stock_status }}</span></strong></li>
    </ul>

    {% if review_status %}
      <div class="rating">
        {% for i in 1..5 %}
          {% if rating < i %}
            <span class="fa-stack"><i class="fa-regular fa-star fa-stack-1x"></i></span>
          {% else %}
            <span class="fa-stack"><i class="fa-solid fa-star fa-stack-1x"></i><i class="fa-regular fa-star fa-stack-1x"></i></span>
          {% endif %}
        {% endfor %}
      </div>
    {% endif %}

    {% if price %}
      <ul class="list-unstyled">
        {% if not special %}
          <li><h2><span class="price-new"><x-currency code="{{ currency }}" amount="{{ price }}"></x-currency></span></h2></li>
        {% else %}
          <li><span class="price-old"><x-currency code="{{ currency }}" amount="{{ price }}"></x-currency></span></li>
          <li><h2><span class="price-new"><x-currency code="{{ currency }}" amount="{{ special }}"></x-currency></span></h2></li>
        {% endif %}

        {% if tax %}
          <li>{{ text_tax }} <x-currency code="{{ currency }}" amount="{{ tax }}"></x-currency></li>
        {% endif %}

        {% if points %}
          <li>{{ text_points }} {{ points }}</li>
        {% endif %}

        {% if discounts %}
          <li><hr></li>
          {% for discount in discounts %}
            <li>{{ discount.quantity }}{{ text_discount }} <x-currency code="{{ currency }}" amount="{{ discount.price }}"></x-currency></li>
          {% endfor %}
        {% endif %}
      </ul>
    {% endif %}

    <form>
      <div class="btn-group">
        <button type="submit" formaction="{{ wishlist_add }}" class="btn btn-light btn-lg" title="{{ button_wishlist }}"><i class="fa-solid fa-heart"></i></button>
        <button type="submit" formaction="{{ compare_add }}" class="btn btn-light btn-lg" title="{{ button_compare }}"><i class="fa-solid fa-arrow-right-arrow-left"></i></button>
      </div>
      <input type="hidden" name="product_id" value="{{ product_id }}"/>
    </form>
  </div>
</div>`,
        data: {
            heading_title: 'Wireless Headphones Pro',
            thumb: 'https://placehold.co/268x268',
            popup: '#',
            images: [
                { thumb: 'https://placehold.co/74x74', popup: '#' },
                { thumb: 'https://placehold.co/74x74', popup: '#' },
            ],
            manufacturer: 'SoundCo',
            manufacturers: '#',
            text_manufacturer: 'Brand',
            model: 'WH-PRO-100',
            text_model: 'Model',
            product_codes: [{ code: 'SKU', value: 'WH-PRO-100-BLK' }],
            reward: null,
            text_reward: 'Reward Points',
            stock: true,
            stock_status: 'In Stock',
            text_stock: 'Availability',
            review_status: true,
            rating: 4,
            price: '79.99',
            special: '59.99',
            currency: 'USD',
            tax: '6.00',
            text_tax: 'Ex Tax:',
            points: 60,
            text_points: 'Reward Points:',
            discounts: [
                { quantity: '2+', price: '54.99' },
                { quantity: '5+', price: '49.99' },
            ],
            text_discount: ' units @ ',
            wishlist_add: '#',
            compare_add: '#',
            button_wishlist: 'Add to Wish List',
            button_compare: 'Compare this Product',
            product_id: 42,
        },
    },
    loop: {
        template: `<h3>Team</h3>
<ul>
{% for member in team %}
  <li>{{ loop.index }}. {{ member }}</li>
{% endfor %}
</ul>`,
        data: {
            team: ['Alice', 'Bob', 'Charlie', 'Diana'],
        },
    },
    conditions: {
        template: `{% if role == 'admin' %}
  <span>🔑 Admin access</span>
{% elseif role == 'editor' %}
  <span>✏️ Editor access</span>
{% else %}
  <span>👤 Viewer access</span>
{% endif %}`,
        data: {
            role: 'admin',
        },
    },
    filters: {
        template: `{{ title | upper }}
{{ greeting | replace: 'Hello', 'Hey' }}
{{ price | round: 2 }}
{{ tags | join: ' · ' }}`,
        data: {
            title: 'curlytag filters',
            greeting: 'Hello, Developer!',
            price: 42.1234,
            tags: ['html', 'css', 'js'],
        },
    },
    set: {
        template: `{% set greeting = name + ' 👋' %}
<p>{{ greeting | upper }}</p>

{% set items = 3 %}
{% if items > 0 %}
  <p>You have {{ items }} new items</p>
{% endif %}`,
        data: {
            name: 'Developer',
        },
    },
    nested: {
        template: `<h3>{{ title }}</h3>

{% for user in users %}
<div>
  <strong>{{ user.name }}</strong>
  {% if user.active %}
    <span>✅ active</span>
  {% else %}
    <span>⏸ inactive</span>
  {% endif %}

  {% for role in user.roles %}
    <span>[{{ role | upper }}]</span>
  {% endfor %}
</div>
{% endfor %}`,
        data: {
            title: 'User Directory',
            users: [
                { name: 'Alice', active: true, roles: ['admin', 'dev'] },
                { name: 'Bob', active: false, roles: ['viewer'] },
                { name: 'Carol', active: true, roles: ['editor', 'dev'] },
            ],
        },
    },
};

// ── Load example ─────────────────────────────────────────────────────────────

let activeBtn = null;

const loadExample = (key) => {
    const ex = examples[key];

    if (!ex) return;

    const templateSource = ex.template;
    const dataSource = JSON.stringify(ex.data, null, 2);

    originalDocs.template = templateSource;
    originalDocs.data = dataSource;

    replaceEditorDoc('template', templateSource);
    replaceEditorDoc('data', dataSource);
    syncEditorActions();

    activeBtn?.classList.remove('examples__item--active');
    activeBtn = popover.querySelector(`[data-example="${key}"]`);
    activeBtn?.classList.add('examples__item--active');

    renderNow();
};

// ── Event listeners ──────────────────────────────────────────────────────────

for (const themeToggle of document.querySelectorAll('input[name="theme"]')) {
    themeToggle.addEventListener('change', render);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (document.getElementById('theme-auto').checked) render();
});

popover.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-example]');

    if (!btn) return;

    loadExample(btn.dataset.example);
    popover.hidePopover();
});

document.addEventListener('click', (e) => {
    const actionButton = e.target.closest('[data-editor-action]');

    if (!actionButton) return;

    const [action, kind] = actionButton.dataset.editorAction.split('-');

    if (action === 'copy') {
        copyEditorDoc(kind);
        return;
    }

    if (action === 'reset') resetEditorDoc(kind);
});

// ── Init ─────────────────────────────────────────────────────────────────────

loadExample('category');
