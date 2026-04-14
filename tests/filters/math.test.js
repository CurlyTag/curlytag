import { describe, expect, test } from 'vite-plus/test';
import { template } from '#curlytag';

describe('math', () => {
    test('plus and minus', () => {
        expect(template.parse('{{ n | plus: 5 }}', { n: 10 })).toBe('15');
        expect(template.parse('{{ n | minus: 3 }}', { n: 10 })).toBe('7');
    });

    test('round', () => {
        expect(template.parse('{{ n | round: 2 }}', { n: 3.14159 })).toBe('3.14');
    });

    test('abs', () => {
        expect(template.parse('{{ n | abs }}', { n: -42 })).toBe('42');
    });
});
