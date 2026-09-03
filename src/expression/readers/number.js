import { isAsciiDigit } from '../characters.js';

/**
 * Reads an integer or decimal number that starts at the given source position.
 *
 * @param {string} source Full source text.
 * @param {number} start Position of the number's first digit.
 * @param {number} [stop=source.length] Exclusive boundary that must not be crossed.
 * @returns {{ value: number, nextPosition: number }} The number and the first position after it.
 */
export const readNumber = (source, start, stop = source.length) => {
    let position = start + 1;

    while (position < stop && isAsciiDigit(source[position])) {
        position++;
    }

    const hasDecimalPart = position + 1 < stop
        && source[position] === '.'
        && source[position + 1] !== '.'
        && isAsciiDigit(source[position + 1]);

    if (hasDecimalPart) {
        position++;

        while (position < stop && isAsciiDigit(source[position])) {
            position++;
        }
    }

    return {
        value: Number(source.slice(start, position)),
        nextPosition: position,
    };
};
