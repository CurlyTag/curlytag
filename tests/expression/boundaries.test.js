import { describe, expect, test } from 'vite-plus/test';
import {
    isIncompleteCloserAt,
    readCloserAt
} from '../../src/expression/boundaries.js';

describe('expression boundaries', () => {
    test('returns the position after a plain closer', () => {
        expect(readCloserAt('value }}', 6, '}}')).toEqual({
            trim: false,
            nextPosition: 8,
        });
    });

    test('returns whitespace-control metadata for a trimmed closer', () => {
        expect(readCloserAt('value -}}', 6, '}}')).toEqual({
            trim: true,
            nextPosition: 9,
        });
    });

    test('does not read a closer beyond the hard boundary', () => {
        expect(readCloserAt('}}', 0, '}}', 1)).toBeNull();
        expect(readCloserAt('-}}', 0, '}}', 1)).toBeNull();
    });

    test('does not treat "~" as whitespace control', () => {
        expect(readCloserAt('value ~}}', 6, '}}')).toBeNull();
    });

    test('recognizes an incomplete closer prefix inside the readable range', () => {
        expect(isIncompleteCloserAt('} rest', 0, '}}')).toBe(true);
        expect(isIncompleteCloserAt('}} rest', 0, '}}')).toBe(false);
        expect(isIncompleteCloserAt('}}', 0, '}}', 1)).toBe(true);
        expect(isIncompleteCloserAt('value', 0, null)).toBe(false);
    });
});
