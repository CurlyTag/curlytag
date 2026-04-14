import { describe, expect, test } from 'vite-plus/test';
import { template } from '#curlytag';

describe('unless', () => {
    test('renders when condition is falsy', () => {
        expect(template.parse('{% unless hidden %}visible{% endunless %}', { hidden: false })).toBe(
            'visible',
        );
    });

    test('skips when condition is truthy', () => {
        expect(template.parse('{% unless hidden %}visible{% endunless %}', { hidden: true })).toBe(
            '',
        );
    });
});
