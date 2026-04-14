import { describe, expect, test } from 'vite-plus/test';
import { template } from '#curlytag';

describe('if / elseif / else', () => {
    test('renders truthy branch', () => {
        expect(template.parse('{% if show %}yes{% endif %}', { show: true })).toBe('yes');
    });

    test('skips falsy branch', () => {
        expect(template.parse('{% if show %}yes{% endif %}', { show: false })).toBe('');
    });

    test('else branch', () => {
        expect(template.parse('{% if show %}yes{% else %}no{% endif %}', { show: false })).toBe(
            'no',
        );
    });

    test('elseif branch', () => {
        const tpl = '{% if a %}A{% elseif b %}B{% else %}C{% endif %}';
        expect(template.parse(tpl, { a: false, b: true })).toBe('B');
    });

    test('invalid syntax is silently ignored', () => {
        expect(template.parse('{% if %}yes{% endif %}')).toBe('');
    });

    test('invalid syntax with else produces empty string', () => {
        expect(template.parse('{% if %}yes{% else %}no{% endif %}')).toBe('');
    });

    test('invalid syntax with elseif produces empty string', () => {
        expect(template.parse('{% if %}yes{% elseif b %}B{% endif %}', { b: true })).toBe('');
    });

    test('invalid syntax with content before and after', () => {
        expect(template.parse('before{% if %}yes{% endif %}after')).toBe('beforeafter');
    });

    test('valid if after invalid if works correctly', () => {
        expect(
            template.parse('{% if %}bad{% endif %}{% if show %}good{% endif %}', {
                show: true,
            }),
        ).toBe('good');
    });
});
