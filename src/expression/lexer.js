import {
    isAsciiDigit,
    isIdentifierStart,
    isQuote,
    isWhitespace
} from './characters.js';
import {
    isIncompleteCloserAt,
    readCloserAt,
    validateCloser,
    validateSourceRange
} from './boundaries.js';
import {
    incompleteCloser,
    unclosedMapping,
    unexpectedCharacter
} from './errors.js';
import {
    readIdentifier,
    readNumber,
    readOperator,
    readPunctuation,
    readString
} from './readers/index.js';
import { getPunctuationDefinition, TokenType } from './syntax/index.js';

/**
 * Tokenizes an expression range without slicing it from its original source.
 * Value tokens contain `value`; the final `end` token contains `nextPosition` and `trim`.
 *
 * @param {string} source Full expression or template source.
 * @param {number} [start=0] Inclusive absolute UTF-16 offset at which to start.
 * @param {number} [stop=source.length] Exclusive hard boundary for the lexer.
 * @param {string | null} [closer=null] Optional template closer, such as `}}` or `%}`.
 * @returns {Array<{
 *     type: (typeof TokenType)[keyof typeof TokenType],
 *     value?: string | number,
 *     start: number,
 *     end: number,
 *     nextPosition?: number,
 *     trim?: boolean
 * }>} Tokens with spans relative to the original source.
 * @throws {TypeError} When the source, a boundary, or the optional closer has an invalid type.
 * @throws {RangeError} When the requested range is outside the source or is reversed.
 * @throws {SyntaxError} When the expression contains invalid or incomplete syntax.
 */
export const lex = (source, start = 0, stop, closer = null) => {
    // The lexer can only read text, for example "price + 2".
    if (typeof source !== 'string') {
        throw new TypeError('Expression source must be a string');
    }

    const stopPosition = stop === undefined ? source.length : stop;

    validateSourceRange(source, start, stopPosition);
    validateCloser(closer);

    const tokens = [];
    let position = start;
    let braceDepth = 0;
    let braceStart = -1;
    let closerMatch = null;

    while (position < stopPosition) {
        // In "{{ price }}", stop before "}}" instead of reading it as punctuation.
        // A closer only counts outside a mapping, so "{{ {name: value} }}" still works.
        const currentCloser = braceDepth === 0
            ? readCloserAt(source, position, closer, stopPosition)
            : null;

        // Keep the closer metadata so the final end token can guide the template scanner.
        if (currentCloser) {
            closerMatch = currentCloser;

            break;
        }

        const character = source[position];

        // Spaces and line breaks separate tokens but are not tokens themselves: "price + 2".
        if (isWhitespace(character)) {
            position++;

            continue;
        }

        // A quote starts one complete string token, for example "hello world".
        if (isQuote(character)) {
            const tokenStart = position;
            const string = readString(source, tokenStart, stopPosition);

            tokens.push({
                type: TokenType.STRING,
                value: string.value,
                start: tokenStart,
                end: string.nextPosition,
            });

            position = string.nextPosition;

            continue;
        }

        // A letter or "_" starts an identifier such as "user" or "user_2".
        if (isIdentifierStart(character)) {
            const tokenStart = position;
            const identifier = readIdentifier(source, tokenStart, stopPosition);

            tokens.push({
                type: TokenType.IDENTIFIER,
                value: identifier.value,
                start: tokenStart,
                end: identifier.nextPosition,
            });

            position = identifier.nextPosition;

            continue;
        }

        // A digit starts an integer or decimal number such as "42" or "3.14".
        if (isAsciiDigit(character)) {
            const tokenStart = position;
            const number = readNumber(source, tokenStart, stopPosition);

            tokens.push({
                type: TokenType.NUMBER,
                value: number.value,
                start: tokenStart,
                end: number.nextPosition,
            });

            position = number.nextPosition;

            continue;
        }

        const operator = readOperator(source, position, stopPosition);

        // Operators can use several characters; "!==" must become one token, not three.
        if (operator) {
            tokens.push({
                type: TokenType.OPERATOR,
                value: operator.value,
                start: position,
                end: operator.nextPosition,
            });

            position = operator.nextPosition;

            continue;
        }

        const punctuation = readPunctuation(source, position, stopPosition);

        // Punctuation gives expressions structure, as "." does in "user.name".
        if (punctuation) {
            const definition = getPunctuationDefinition(punctuation.value);
            const braceChange = definition.braceDepth ?? 0;

            // Outside a mapping, one `}` is only half of the output closer `}}`.
            if (
                braceDepth === 0
                && braceChange < 0
                && isIncompleteCloserAt(source, position, closer, stopPosition)
            ) {
                throw incompleteCloser(source, position, closer);
            }

            tokens.push({
                type: TokenType.PUNCTUATION,
                value: punctuation.value,
                start: position,
                end: punctuation.nextPosition,
            });

            // Remember the first `{`; nested mappings cannot outlive this outer mapping.
            if (braceDepth === 0 && braceChange > 0) {
                braceStart = position;
            }

            braceDepth = Math.max(0, braceDepth + braceChange);

            // Once the outer mapping is closed, there is no unmatched opening `{` to report.
            if (braceDepth === 0) {
                braceStart = -1;
            }

            position = punctuation.nextPosition;

            continue;
        }

        throw unexpectedCharacter(source, position);
    }

    // A mapping that reaches the hard boundary still needs its closing `}`.
    if (braceDepth > 0) {
        throw unclosedMapping(source, braceStart);
    }

    tokens.push({
        type: TokenType.END,
        start: position,
        end: position,
        nextPosition: closerMatch?.nextPosition ?? position,
        trim: closerMatch?.trim ?? false,
    });

    return tokens;
};
