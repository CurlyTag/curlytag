import { unterminatedString } from '../errors.js';

/**
 * Reads a quoted string and unescapes its matching quote and backslashes.
 *
 * @param {string} source Full source text.
 * @param {number} start Position of the opening quote.
 * @param {number} [stop=source.length] Exclusive boundary that must not be crossed.
 * @returns {{ value: string, nextPosition: number }} The string value and the first position after its closing quote.
 * @throws {SyntaxError} When the string has no closing quote before the boundary.
 */
export const readString = (source, start, stop = source.length) => {
    const quote = source[start];
    let position = start + 1;
    let value = '';

    while (position < stop) {
        const character = source[position];

        if (character === quote) {
            return {
                value,
                nextPosition: position + 1,
            };
        }

        if (character === '\\') {
            const escaped = position + 1 < stop ? source[position + 1] : undefined;

            if (escaped === quote || escaped === '\\') {
                value += escaped;
                position += 2;

                continue;
            }
        }

        value += character;
        position++;
    }

    throw unterminatedString(source, start, quote);
};
