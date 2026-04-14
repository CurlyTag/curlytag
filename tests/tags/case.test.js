import { describe, expect, test } from 'vite-plus/test';
import { template } from '#curlytag';

describe('case / when / endcase', () => {
    test('matches correct when branch', () => {
        const tpl =
            '{% case color %}{% when "red" %}R{% when "green" %}G{% when "blue" %}B{% endcase %}';
        expect(template.parse(tpl, { color: 'green' })).toBe('G');
    });

    test('non-matching produces no output', () => {
        const tpl = '{% case color %}{% when "red" %}R{% when "green" %}G{% endcase %}';
        expect(template.parse(tpl, { color: 'blue' })).toBe('');
    });

    test('else acts as default branch', () => {
        const tpl = '{% case color %}{% when "red" %}R{% else %}?{% endcase %}';
        expect(template.parse(tpl, { color: 'purple' })).toBe('?');
    });

    test('when accepts multiple values', () => {
        const tpl = '{% case color %}{% when "red", "crimson" %}R{% endcase %}';
        expect(template.parse(tpl, { color: 'crimson' })).toBe('R');
    });
});
