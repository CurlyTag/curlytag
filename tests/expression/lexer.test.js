import { describe, expect, test } from 'vite-plus/test';
import { LexerError } from '../../src/expression/errors.js';
import { lex } from '../../src/expression/lexer.js';
import {
    getOperatorDefinition,
    getPunctuationDefinition,
    TokenType
} from '../../src/expression/syntax/index.js';

const endToken = (position, nextPosition = position, trim = false) => ({
    type: 'end',
    start: position,
    end: position,
    nextPosition,
    trim,
});

describe('expression lexer', () => {
    test('returns an empty end span for an empty expression', () => {
        expect(lex('')).toEqual([endToken(0)]);
    });

    test('splits a simple arithmetic expression into tokens', () => {
        expect(lex('price * 2 + 10')).toEqual([
            { type: 'identifier', value: 'price', start: 0, end: 5 },
            { type: 'operator', value: '*', start: 6, end: 7 },
            { type: 'number', value: 2, start: 8, end: 9 },
            { type: 'operator', value: '+', start: 10, end: 11 },
            { type: 'number', value: 10, start: 12, end: 14 },
            endToken(14)
        ]);
    });

    test('allows underscores and digits in identifiers', () => {
        expect(lex('_product2')).toEqual([
            { type: 'identifier', value: '_product2', start: 0, end: 9 },
            endToken(9)
        ]);
    });

    test('leaves parser words as identifiers', () => {
        const tokens = lex('and or not in true false null').slice(0, -1);

        expect(tokens.map((token) => token.type)).toEqual([
            'identifier',
            'identifier',
            'identifier',
            'identifier',
            'identifier',
            'identifier',
            'identifier'
        ]);
        expect(tokens.map((token) => token.value)).toEqual([
            'and',
            'or',
            'not',
            'in',
            'true',
            'false',
            'null'
        ]);
    });

    test('reads single-quoted and double-quoted strings', () => {
        expect(lex('"hello" \'world\'')).toEqual([
            { type: 'string', value: 'hello', start: 0, end: 7 },
            { type: 'string', value: 'world', start: 8, end: 15 },
            endToken(15)
        ]);
    });

    test('keeps operators and keywords inside one string token', () => {
        expect(lex('"not and or + 1..5"')).toEqual([
            { type: 'string', value: 'not and or + 1..5', start: 0, end: 19 },
            endToken(19)
        ]);
    });

    test('unescapes the matching quote and backslash', () => {
        expect(lex('"say \\"hello\\""')[0].value).toBe('say "hello"');
        expect(lex('"C:\\\\tmp"')[0].value).toBe('C:\\tmp');
    });

    test('keeps a source span independent from an unescaped string value', () => {
        const source = '"say \\"hello\\""';
        const [token] = lex(source);

        expect(source.slice(token.start, token.end)).toBe(source);
        expect(token.value).toBe('say "hello"');
    });

    test('recognizes the five basic arithmetic operators', () => {
        expect(lex('a+b-c*d/2%1').map((token) => token.value)).toEqual([
            'a',
            '+',
            'b',
            '-',
            'c',
            '*',
            'd',
            '/',
            2,
            '%',
            1,
            undefined
        ]);
    });

    test('recognizes every comparison operator', () => {
        const tokens = lex('a == b != c > d < e >= f <= g');
        const values = tokens
            .filter((token) => token.type === TokenType.OPERATOR)
            .map((token) => token.value);

        expect(values).toEqual(['==', '!=', '>', '<', '>=', '<=']);
    });

    test('recognizes safe aliases from the previous JavaScript evaluator', () => {
        const tokens = lex('a && b || !c ? d ?? e : user?.name === other !== fallback ** 2');
        const values = tokens
            .filter((token) => token.type === TokenType.OPERATOR)
            .map((token) => token.value);

        expect(values).toEqual(['&&', '||', '!', '?', '??', '?.', '===', '!==', '**']);
    });

    test('derives operator and punctuation groups from their registries', () => {
        expect(getOperatorDefinition('>=')).toEqual({ group: 'comparison' });
        expect(getOperatorDefinition('??')).toEqual({ group: 'conditional' });
        expect(getPunctuationDefinition('.')).toEqual({ group: 'access' });
        expect(getPunctuationDefinition('=')).toEqual({ group: 'assignment' });
    });

    test('uses the longest matching comparison operator', () => {
        expect(lex('price >= 10')).toEqual([
            { type: 'identifier', value: 'price', start: 0, end: 5 },
            { type: 'operator', value: '>=', start: 6, end: 8 },
            { type: 'number', value: 10, start: 9, end: 11 },
            endToken(11)
        ]);
    });

    test('recognizes every structural punctuation symbol', () => {
        const tokens = lex('({result = items[0].name, value | filter: 2})');
        const values = tokens
            .filter((token) => token.type === TokenType.PUNCTUATION)
            .map((token) => token.value);

        expect(values).toEqual(['(', '{', '=', '[', ']', '.', ',', '|', ':', '}', ')']);
    });

    test('lexes the assignment separator used by assign and set tags', () => {
        expect(lex('x = 42')).toEqual([
            { type: 'identifier', value: 'x', start: 0, end: 1 },
            { type: 'punctuation', value: '=', start: 2, end: 3 },
            { type: 'number', value: 42, start: 4, end: 6 },
            endToken(6)
        ]);
    });

    test('keeps member access punctuation between identifiers', () => {
        expect(lex('user.name')).toEqual([
            { type: 'identifier', value: 'user', start: 0, end: 4 },
            { type: 'punctuation', value: '.', start: 4, end: 5 },
            { type: 'identifier', value: 'name', start: 5, end: 9 },
            endToken(9)
        ]);
    });

    test('lexes deeply nested member access as a repeated token pattern', () => {
        expect(lex('user.profile.name')).toEqual([
            { type: 'identifier', value: 'user', start: 0, end: 4 },
            { type: 'punctuation', value: '.', start: 4, end: 5 },
            { type: 'identifier', value: 'profile', start: 5, end: 12 },
            { type: 'punctuation', value: '.', start: 12, end: 13 },
            { type: 'identifier', value: 'name', start: 13, end: 17 },
            endToken(17)
        ]);
    });

    test('reads a decimal number as one token', () => {
        expect(lex('1.5')).toEqual([
            { type: 'number', value: 1.5, start: 0, end: 3 },
            endToken(3)
        ]);
    });

    test('keeps a range operator separate from its numbers', () => {
        expect(lex('1..5')).toEqual([
            { type: 'number', value: 1, start: 0, end: 1 },
            { type: 'operator', value: '..', start: 1, end: 3 },
            { type: 'number', value: 5, start: 3, end: 4 },
            endToken(4)
        ]);
    });

    test('supports decimal numbers on both sides of a range', () => {
        expect(lex('1.5..2.5').map((token) => token.value)).toEqual([
            1.5,
            '..',
            2.5,
            undefined
        ]);
    });

    test('lexes a bounded expression with absolute source spans', () => {
        const source = 'header\n{{ price + 2 }}\nfooter';
        const start = source.indexOf('price');
        const stop = source.indexOf(' }}');

        expect(lex(source, start, stop)).toEqual([
            { type: 'identifier', value: 'price', start: 10, end: 15 },
            { type: 'operator', value: '+', start: 16, end: 17 },
            { type: 'number', value: 2, start: 18, end: 19 },
            endToken(19)
        ]);
    });

    test('reports absolute template coordinates inside a bounded expression', () => {
        const source = 'first\n{{ price @ 2 }}';
        const start = source.indexOf('price');
        const stop = source.indexOf(' }}');
        let error;

        try {
            lex(source, start, stop);
        } catch (caught) {
            error = caught;
        }

        expect(error).toMatchObject({
            code: 'LEX001',
            position: 15,
            line: 2,
            column: 10,
            found: '@',
        });
        expect(error.message).toContain('2 | {{ price @ 2 }}');
    });

    test('ignores a closer inside a quoted string', () => {
        const source = '{{ "a }} b" }}';
        const start = source.indexOf('"');
        const tokens = lex(source, start, source.length, '}}');
        const string = tokens[0];
        const end = tokens.at(-1);

        expect(string).toMatchObject({
            type: 'string',
            value: 'a }} b',
        });
        expect(end).toEqual(endToken(
            source.lastIndexOf('}}'),
            source.length
        ));
    });

    test('does not confuse compact mapping braces with an output closer', () => {
        const source = '{{ {a: {b: 1}}}}';
        const tokens = lex(source, 2, source.length, '}}');
        const punctuation = tokens
            .filter((token) => token.type === TokenType.PUNCTUATION)
            .map((token) => token.value);
        const end = tokens.at(-1);

        expect(punctuation).toEqual(['{', ':', '{', ':', '}', '}']);
        expect(end).toEqual(endToken(source.length - 2, source.length));
    });

    test('returns closer metadata for output and tag whitespace control', () => {
        const output = '{{ value -}}';
        const outputTokens = lex(output, 2, output.length, '}}');

        expect(outputTokens.at(-1)).toEqual(endToken(
            output.indexOf('-}}'),
            output.length,
            true
        ));
        expect(outputTokens.some((token) => token.type === TokenType.OPERATOR)).toBe(false);

        const tag = '{% if value -%}';
        const tagTokens = lex(tag, 2, tag.length, '%}');

        expect(tagTokens.at(-1)).toEqual(endToken(
            tag.indexOf('-%}'),
            tag.length,
            true
        ));
    });

    test('does not treat "~" before an output closer as whitespace control', () => {
        const source = '{{ value ~}}';

        expect(() => lex(source, 2, source.length, '}}')).toThrowError(
            /unexpected character "~"/
        );
    });

    test('never reads an output closer beyond the hard boundary', () => {
        expect(() => lex('}}', 0, 1, '}}')).toThrowError(/incomplete template closer/);
        expect(() => lex('x}}suffix', 0, 2, '}}')).toThrowError(/incomplete template closer/);

        const tokens = lex('-}}', 0, 1, '}}');

        expect(tokens).toEqual([
            { type: 'operator', value: '-', start: 0, end: 1 },
            endToken(1)
        ]);
        expect(tokens.at(-1).nextPosition).toBeLessThanOrEqual(1);
    });

    test('reports an incomplete output closer before consuming the remaining template', () => {
        const source = '{{ {a: 1 }} hello world {{ price }} footer';
        const position = source.indexOf('}}') + 1;
        let error;

        try {
            lex(source, 2, source.length, '}}');
        } catch (caught) {
            error = caught;
        }

        expect(error).toBeInstanceOf(LexerError);
        expect(error).toMatchObject({
            code: 'LEX003',
            position,
            found: '}',
        });
        expect(error.message).toContain('write the complete "}}" delimiter');
    });

    test('reports an unclosed mapping from its opening brace', () => {
        const source = '{{ {a: 1';
        let error;

        try {
            lex(source, 2, source.length, '}}');
        } catch (caught) {
            error = caught;
        }

        expect(error).toBeInstanceOf(LexerError);
        expect(error).toMatchObject({
            code: 'LEX004',
            position: source.indexOf('{', 2),
            found: '{',
        });
        expect(error.message).toContain('add a closing "}"');
    });

    test('validates an optional closer', () => {
        expect(() => lex('value', 0, 5, '')).toThrowError(TypeError);
        expect(() => lex('value', 0, 5, 42)).toThrowError(TypeError);
    });

    test('does not let a string reader cross the hard stop boundary', () => {
        const source = '{{ "missing }} "later" }}';
        const start = source.indexOf('"');
        const stop = source.indexOf(' }}');

        expect(() => lex(source, start, stop)).toThrowError(/unterminated string/);
    });

    test('validates explicit source boundaries', () => {
        expect(() => lex('abc', -1)).toThrowError(RangeError);
        expect(() => lex('abc', 0, 4)).toThrowError(RangeError);
        expect(() => lex('abc', 2, 1)).toThrowError(RangeError);
        expect(() => lex('abc', 0.5, 2)).toThrowError(TypeError);
    });

    test('preserves source spans while ignoring whitespace', () => {
        expect(lex('  price\n  2')).toEqual([
            { type: 'identifier', value: 'price', start: 2, end: 7 },
            { type: 'number', value: 2, start: 10, end: 11 },
            endToken(11)
        ]);
    });

    test('recognizes spaces, tabs, carriage returns, and newlines as whitespace', () => {
        expect(lex('\tprice\r\n')).toEqual([
            { type: 'identifier', value: 'price', start: 1, end: 6 },
            endToken(8)
        ]);
    });

    test('reports an unsupported character with source context', () => {
        let error;

        try {
            lex('price @ 2');
        } catch (caught) {
            error = caught;
        }

        expect(error).toBeInstanceOf(LexerError);
        expect(error).toMatchObject({
            code: 'LEX001',
            position: 6,
            line: 1,
            column: 7,
            found: '@',
        });
        expect(error.message).toContain('1 | price @ 2\n  |       ^');
        expect(error.message).toContain(
            'expected an identifier (starting with an ASCII letter or "_")'
        );
    });

    test('leaves a standalone dot for the parser to validate', () => {
        expect(lex('1.')).toEqual([
            { type: 'number', value: 1, start: 0, end: 1 },
            { type: 'punctuation', value: '.', start: 1, end: 2 },
            endToken(2)
        ]);
    });

    test('reports an unterminated string from its opening quote', () => {
        let error;

        try {
            lex('"hello');
        } catch (caught) {
            error = caught;
        }

        expect(error).toBeInstanceOf(LexerError);
        expect(error).toMatchObject({
            code: 'LEX002',
            position: 0,
            line: 1,
            column: 1,
            found: '"',
        });
        expect(error.message).toContain('add a closing');
    });

    test('requires a string source', () => {
        expect(() => lex(null)).toThrowError(new TypeError('Expression source must be a string'));
    });
});
