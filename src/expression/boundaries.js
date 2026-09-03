/**
 * Helpers that define which part of the original source the lexer may read.
 *
 * A hard range uses absolute `[start, stop)` positions. An optional closer lets
 * the lexer find a template ending such as `}}` or `%}` while it reads tokens.
 */

// CurlyTag uses `-` before a closer for whitespace control: `-}}` or `-%}`.
const trimMarker = '-';

/**
 * Checks that `[start, stop)` is a valid range inside the original source.
 * For example, `[7, 12)` selects `value` from `"prefix value suffix"`.
 *
 * @param {string} source Full expression or template source.
 * @param {number} start Inclusive absolute UTF-16 offset.
 * @param {number} stop Exclusive absolute UTF-16 offset.
 * @returns {void}
 * @throws {TypeError} When either boundary is not an integer.
 * @throws {RangeError} When the range is reversed or falls outside the source.
 */
export const validateSourceRange = (source, start, stop) => {
    // Source positions must be whole numbers because they are used as string indexes.
    if (!Number.isInteger(start) || !Number.isInteger(stop)) {
        throw new TypeError('Lexer start and stop positions must be integers');
    }

    // `start === source.length` is valid and represents an empty range at the end.
    if (start < 0 || start > source.length) {
        throw new RangeError(`Lexer start ${start} is outside source bounds 0…${source.length}`);
    }

    // `stop` cannot move backwards or let a reader cross the end of the source.
    if (stop < start || stop > source.length) {
        throw new RangeError(
            `Lexer stop ${stop} must be between start ${start} and source end ${source.length}`
        );
    }
};

/**
 * Checks an optional template closer before lexing begins.
 * Valid examples are `null`, `}}`, and `%}`; an empty string would match everywhere.
 *
 * @param {string | null} closer Template closer, or `null` when only `stop` is used.
 * @returns {void}
 * @throws {TypeError} When the closer is neither `null` nor a non-empty string.
 */
export const validateCloser = (closer) => {
    // An empty closer is rejected because every source position starts with an empty string.
    if (closer !== null && (typeof closer !== 'string' || closer.length === 0)) {
        throw new TypeError('Lexer closer must be null or a non-empty string');
    }
};

/**
 * Reads a complete template closer at the current absolute position.
 * It returns enough information for the template scanner to continue after the
 * closer without knowing how whitespace control is written.
 *
 * @param {string} source Full expression or template source.
 * @param {number} position Absolute UTF-16 offset currently inspected by the lexer.
 * @param {string | null} closer Template closer selected for this lexer run.
 * @param {number} [stop=source.length] Exclusive hard boundary that must not be crossed.
 * @returns {{ trim: boolean, nextPosition: number } | null} Closer metadata, or `null` when none starts here.
 */
export const readCloserAt = (source, position, closer, stop = source.length) => {
    // With no closer, the lexer relies only on its hard `stop` boundary.
    if (closer === null) {
        return null;
    }

    // For example, `}}` at position 10 continues at position 12 without trimming.
    if (position + closer.length <= stop && source.startsWith(closer, position)) {
        return {
            trim: false,
            nextPosition: position + closer.length,
        };
    }

    // For `-}}`, include `-` in the consumed boundary and report that trimming is enabled.
    if (
        position + 1 + closer.length <= stop
        && source[position] === trimMarker
        && source.startsWith(closer, position + 1)
    ) {
        return {
            trim: true,
            nextPosition: position + 1 + closer.length,
        };
    }

    return null;
};

/**
 * Reports that only the beginning of a closer is present at this position.
 * For example, one `}` is an incomplete form of the output closer `}}`.
 *
 * @param {string} source Full expression or template source.
 * @param {number} position Absolute UTF-16 offset currently inspected by the lexer.
 * @param {string | null} closer Template closer selected for this lexer run.
 * @param {number} [stop=source.length] Exclusive hard boundary that must not be crossed.
 * @returns {boolean} Whether the readable range ends with a non-empty closer prefix.
 */
export const isIncompleteCloserAt = (source, position, closer, stop = source.length) => {
    if (closer === null) {
        return false;
    }

    let matchedLength = 0;

    while (
        matchedLength < closer.length
        && position + matchedLength < stop
        && source[position + matchedLength] === closer[matchedLength]
    ) {
        matchedLength++;
    }

    return matchedLength > 0 && matchedLength < closer.length;
};
