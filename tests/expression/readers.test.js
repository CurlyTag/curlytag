import { describe, expect, test } from 'vite-plus/test';
import { readIdentifier } from '../../src/expression/readers/identifier.js';
import { readNumber } from '../../src/expression/readers/number.js';
import { readOperator } from '../../src/expression/readers/operator.js';
import { readPunctuation } from '../../src/expression/readers/punctuation.js';
import { readString } from '../../src/expression/readers/string.js';

describe('expression readers', () => {
    test('reads an identifier without consuming the next token', () => {
        expect(readIdentifier('::user_2.name', 2)).toEqual({
            value: 'user_2',
            nextPosition: 8,
        });
    });

    test('keeps a range operator outside a decimal number', () => {
        expect(readNumber('1.5..2', 0)).toEqual({
            value: 1.5,
            nextPosition: 3,
        });
    });

    test('chooses the longest operator inside the hard boundary', () => {
        expect(readOperator('!==', 0)).toEqual({
            value: '!==',
            nextPosition: 3,
        });
        expect(readOperator('!==', 0, 2)).toEqual({
            value: '!=',
            nextPosition: 2,
        });
    });

    test('returns null when punctuation is not present', () => {
        expect(readPunctuation('[item', 0)).toEqual({
            value: '[',
            nextPosition: 1,
        });
        expect(readPunctuation('item', 0)).toBeNull();
    });

    test('returns an unescaped string value and its source position', () => {
        expect(readString('::"say \\"hello\\""::', 2)).toEqual({
            value: 'say "hello"',
            nextPosition: 17,
        });
    });
});
