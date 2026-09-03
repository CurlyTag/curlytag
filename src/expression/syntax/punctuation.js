/**
 * @typedef {'grouping' | 'array' | 'mapping' | 'access' | 'separator' | 'filter' | 'argument' | 'assignment'} PunctuationGroup
 */

const definePunctuation = (group, braceDepth = 0) =>
    Object.freeze(braceDepth === 0 ? { group } : { group, braceDepth });

// Add every structural symbol here. Lexer lookup, diagnostics use this registry.
export const punctuationRegistry = Object.freeze({
    '(': definePunctuation('grouping'),
    ')': definePunctuation('grouping'),
    '[': definePunctuation('array'),
    ']': definePunctuation('array'),
    '{': definePunctuation('mapping', 1),
    '}': definePunctuation('mapping', -1),
    '.': definePunctuation('access'),
    ',': definePunctuation('separator'),
    '|': definePunctuation('filter'),
    ':': definePunctuation('argument'),
    '=': definePunctuation('assignment'),
});

export const supportedPunctuation = Object.freeze(Object.keys(punctuationRegistry));

export const getPunctuationDefinition = (value) =>
    Object.hasOwn(punctuationRegistry, value)
        ? punctuationRegistry[value]
        : null;
