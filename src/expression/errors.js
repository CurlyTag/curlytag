import { supportedOperators, supportedPunctuation } from './syntax/index.js';

/**
 * @typedef {object} SourceLocation
 * @property {number} line One-based line number.
 * @property {number} column One-based column number.
 * @property {string} text Complete source line containing the position.
 */

/**
 * Converts an absolute source position into a line, column, and source line.
 * For example, position `8` in `"first\nvalue"` points to line 2, column 3.
 *
 * @param {string} source Full source text.
 * @param {number} position Absolute UTF-16 offset in the source.
 * @returns {SourceLocation} Human-readable location of the position.
 */
const locate = (source, position) => {
    let line = 1;
    let lineStart = 0;

    for (let index = 0; index < position; index++) {
        // Every line break moves the position to the next line and resets its column.
        if (source[index] === '\n') {
            line++;
            lineStart = index + 1;
        }
    }

    const lineEnd = source.indexOf('\n', position);

    return {
        line,
        column: position - lineStart + 1,
        text: source.slice(lineStart, lineEnd === -1 ? source.length : lineEnd),
    };
};

/**
 * A syntax error with its exact source position and a readable source frame.
 *
 * The final message looks like this:
 * `1 | price @ 2`
 * `  |       ^`
 */
export class SourceError extends SyntaxError {
    /**
     * @param {string} name Error class name.
     * @param {object} details Information used to build the diagnostic.
     * @param {string} details.source Full source text.
     * @param {number} details.position Absolute UTF-16 offset of the problem.
     * @param {string} details.found Text found at that position.
     * @param {string} details.code Stable error code, for example `LEX001`.
     * @param {string} details.summary Short explanation of the problem.
     * @param {string} details.hint Friendly suggestion for fixing it.
     */
    constructor(name, { source, position, found, code, summary, hint }) {
        const location = locate(source, position);
        const gutterWidth = String(location.line).length;
        const emptyGutter = ' '.repeat(gutterWidth);
        const pointerPadding = ' '.repeat(location.column - 1);

        // Build a Rust-style diagnostic with the relevant line and a caret under the problem.
        const message = [
            `error[${code}]: ${summary}`,
            ` --> line ${location.line}, column ${location.column}`,
            `${emptyGutter} |`,
            `${String(location.line).padStart(gutterWidth)} | ${location.text}`,
            `${emptyGutter} | ${pointerPadding}^`,
            `${emptyGutter} = ${hint}`
        ].join('\n');

        super(message);

        this.name = name;
        this.code = code;
        this.source = source;
        this.position = position;
        this.line = location.line;
        this.column = location.column;
        this.found = found;
    }
}

export class LexerError extends SourceError {
    constructor(details) {
        super('LexerError', details);
    }
}

/**
 * Creates `LEX002` when a quoted string reaches the boundary without a closing quote.
 * For example, `"hello` is missing its final `"`.
 *
 * @param {string} source Full source text.
 * @param {number} position Position of the opening quote.
 * @param {string} quote Opening quote, either `"` or `'`.
 * @returns {LexerError} Error pointing to the opening quote.
 */
export const unterminatedString = (source, position, quote) =>
    new LexerError({
        source,
        position,
        found: quote,
        code: 'LEX002',
        summary: `unterminated string starting with ${JSON.stringify(quote)}`,
        hint: `add a closing ${JSON.stringify(quote)} before the end of the expression`,
    });

/**
 * Creates `LEX003` when the source contains only the beginning of a template closer.
 * For example, one `}` is not enough to complete the output closer `}}`.
 *
 * @param {string} source Full source text.
 * @param {number} position Position of the incomplete closer.
 * @param {string} closer Complete closer expected by the lexer.
 * @returns {LexerError} Error pointing to the incomplete closer.
 */
export const incompleteCloser = (source, position, closer) =>
    new LexerError({
        source,
        position,
        found: source[position],
        code: 'LEX003',
        summary: `incomplete template closer ${JSON.stringify(closer)}`,
        hint: `write the complete ${JSON.stringify(closer)} delimiter to close the expression`,
    });

/**
 * Creates `LEX004` when a mapping reaches the boundary without its closing `}`.
 * For example, `{name: "Ada"` leaves the opening `{` unmatched.
 *
 * @param {string} source Full source text.
 * @param {number} position Position of the unmatched opening `{`.
 * @returns {LexerError} Error pointing to the opening `{`.
 */
export const unclosedMapping = (source, position) =>
    new LexerError({
        source,
        position,
        found: '{',
        code: 'LEX004',
        summary: 'unclosed mapping starting with "{"',
        hint: 'add a closing "}" before the end of the expression',
    });

/**
 * Creates `LEX001` when no reader understands the current character.
 * For example, `@` is unexpected in `price @ 2`.
 *
 * @param {string} source Full source text.
 * @param {number} position Position of the unsupported character.
 * @returns {LexerError} Error pointing to the unsupported character.
 */
export const unexpectedCharacter = (source, position) => {
    const found = source[position];

    return new LexerError({
        source,
        position,
        found,
        code: 'LEX001',
        summary: `unexpected character ${JSON.stringify(found)}`,
        hint: `expected an identifier (starting with an ASCII letter or "_"), a number, a quoted string, whitespace, an operator (${supportedOperators.join(' ')}), or punctuation (${supportedPunctuation.join(' ')})`,
    });
};
