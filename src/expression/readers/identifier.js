import { isIdentifierPart } from '../characters.js';

/**
 * Reads an identifier that starts at the given source position.
 *
 * @param {string} source Full source text.
 * @param {number} start Position of the identifier's first character.
 * @param {number} [stop=source.length] Exclusive boundary that must not be crossed.
 * @returns {{ value: string, nextPosition: number }} The identifier and the first position after it.
 */
export const readIdentifier = (source, start, stop = source.length) => {
    let position = start + 1;

    while (position < stop && isIdentifierPart(source[position])) {
        position++;
    }

    return {
        value: source.slice(start, position),
        nextPosition: position,
    };
};
