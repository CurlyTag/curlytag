// Token types describe the stable shape of the lexer output.
export const TokenType = Object.freeze({
    IDENTIFIER: 'identifier',
    NUMBER: 'number',
    STRING: 'string',
    OPERATOR: 'operator',
    PUNCTUATION: 'punctuation',
    END: 'end',
});

export const supportedTokenTypes = Object.freeze(Object.values(TokenType));
