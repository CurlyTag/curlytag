import { describe, expect, test } from 'vite-plus/test';
import { curlytag } from '#curlytag';

describe('html', () => {
    describe('unescape', () => {
        test('prevents existing entities from being escaped twice', () => {
            expect(curlytag.parse('{{ html | unescape }}', { html: '&lt;b&gt;' })).toBe(
                '&lt;b&gt;'
            );
        });

        test.each([
            [ '&amp;', '&amp;' ],
            [ '&#38;', '&amp;' ],
            [ '&lt;', '&lt;' ],
            [ '&#60;', '&lt;' ],
            [ '&gt;', '&gt;' ],
            [ '&#62;', '&gt;' ],
            [ '&apos;', '&#39;' ],
            [ '&#39;', '&#39;' ],
            [ '&quot;', '&quot;' ],
            [ '&#34;', '&quot;' ]
        ])('normalizes %s', (entity, expected) => {
            expect(curlytag.parse('{{ html | unescape }}', { html: entity })).toBe(expected);
        });

        test('handles mixed and repeated entities', () => {
            expect(
                curlytag.parse('{{ html | unescape }}', {
                    html: '&lt;b&gt;Tom &amp; Jerry&lt;/b&gt;'
                })
            ).toBe('&lt;b&gt;Tom &amp; Jerry&lt;/b&gt;');
        });

        test('leaves plain text unchanged', () => {
            expect(curlytag.parse('{{ html | unescape }}', { html: 'plain text' })).toBe(
                'plain text'
            );
        });

        test('handles null and undefined values', () => {
            expect(curlytag.parse('{{ html | unescape }}', { html: null })).toBe('');
            expect(curlytag.parse('{{ html | unescape }}', { html: undefined })).toBe('');
        });
    });
});
