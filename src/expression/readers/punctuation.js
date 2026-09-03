import { supportedPunctuation } from '../syntax/punctuation.js';

const punctuationSet = new Set(supportedPunctuation);

/**
 * Reads a supported punctuation mark at the given source position.
 *
 * @param {string} source Full source text.
 * @param {number} start Position at which punctuation may appear.
 * @param {number} [stop=source.length] Exclusive boundary that must not be crossed.
 * @returns {{ value: string, nextPosition: number } | null} The punctuation, or `null` when none starts here.
 */
export const readPunctuation = (source, start, stop = source.length) => {
    if (start >= stop) {
        return null;
    }

    const value = source[start];

    if (!punctuationSet.has(value)) {
        return null;
    }

    return {
        value,
        nextPosition: start + 1,
    };
};
