import { describe, expect, test } from 'vite-plus/test';
import { curlytag } from '#curlytag';

describe('string', () => {
    test('upper', () => {
        expect(curlytag.parse('{{ name | upper }}', { name: 'alice' })).toBe('ALICE');
    });

    test('lower', () => {
        expect(curlytag.parse('{{ name | lower }}', { name: 'ALICE' })).toBe('alice');
    });

    test('replace', () => {
        expect(
            curlytag.parse('{{ greeting | replace: "world", "earth" }}', {
                greeting: 'hello world'
            })
        ).toBe('hello earth');
    });

    test('trim', () => {
        expect(curlytag.parse('{{ text | trim }}', { text: '  hi  ' })).toBe('hi');
    });

    test('truncate', () => {
        expect(curlytag.parse('{{ name | upper | truncate: 3, "." }}', { name: 'alice' })).toBe(
            'AL.'
        );
    });

    test('striptag removes basic html tags', () => {
        expect(curlytag.parse('{{ html | striptag }}', { html: '<p>hello</p>' })).toBe('hello');
    });

    test('striptag removes script block including contents', () => {
        expect(
            curlytag.parse('{{ html | striptag }}', { html: "<script>alert('xss')</script>hello" })
        ).toBe('hello');
    });

    test('striptag removes style block including contents', () => {
        expect(
            curlytag.parse('{{ html | striptag }}', {
                html: '<style>body{color:red}</style>hello'
            })
        ).toBe('hello');
    });

    test('striptag removes html comments', () => {
        expect(curlytag.parse('{{ html | striptag }}', { html: '<!-- comment -->hello' })).toBe(
            'hello'
        );
    });

    test('striptag leaves plain text untouched', () => {
        expect(curlytag.parse('{{ html | striptag }}', { html: 'just text' })).toBe('just text');
    });

    test('striptag removes multiline script with attributes including contents', () => {
        const html = '<script type="module">\nconsole.log("hi");\n</script>hello';
        expect(curlytag.parse('{{ html | striptag }}', { html })).toBe('hello');
    });

    test('striptag removes multiline style with attributes including contents', () => {
        const html = '<style type="text/css">\nbody { color: red; }\n</style>hello';
        expect(curlytag.parse('{{ html | striptag }}', { html })).toBe('hello');
    });
});
