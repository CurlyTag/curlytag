import { describe, expect, test } from 'vite-plus/test';
import { template } from '#curlytag';

describe('string', () => {
    test('upper', () => {
        expect(template.parse('{{ name | upper }}', { name: 'alice' })).toBe('ALICE');
    });

    test('lower', () => {
        expect(template.parse('{{ name | lower }}', { name: 'ALICE' })).toBe('alice');
    });

    test('replace', () => {
        expect(
            template.parse('{{ greeting | replace: "world", "earth" }}', {
                greeting: 'hello world',
            }),
        ).toBe('hello earth');
    });

    test('trim', () => {
        expect(template.parse('{{ text | trim }}', { text: '  hi  ' })).toBe('hi');
    });

    test('truncate', () => {
        expect(template.parse('{{ name | upper | truncate: 3, "." }}', { name: 'alice' })).toBe(
            'AL.',
        );
    });
});
