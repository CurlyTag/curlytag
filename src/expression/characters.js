export const isAsciiDigit = (character) => character >= '0' && character <= '9';

export const isAsciiLetter = (character) =>
    (character >= 'a' && character <= 'z')
    || (character >= 'A' && character <= 'Z');

export const isIdentifierStart = (character) =>
    isAsciiLetter(character) || character === '_';

export const isIdentifierPart = (character) =>
    isIdentifierStart(character) || isAsciiDigit(character);

export const isQuote = (character) => character === '"' || character === "'";

export const isWhitespace = (character) =>
    character === ' '
    || character === '\t'
    || character === '\n'
    || character === '\r';
