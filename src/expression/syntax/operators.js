/**
 * @typedef {'arithmetic' | 'range' | 'comparison' | 'logical' | 'conditional' | 'access'} OperatorGroup
 */

const defineOperator = (group) => Object.freeze({ group });

// Add every symbolic operator here. Lexer lookup, diagnostics, and the playground use this registry.
export const operatorRegistry = Object.freeze({
    '+': defineOperator('arithmetic'),
    '-': defineOperator('arithmetic'),
    '*': defineOperator('arithmetic'),
    '**': defineOperator('arithmetic'),
    '/': defineOperator('arithmetic'),
    '%': defineOperator('arithmetic'),
    '..': defineOperator('range'),
    '==': defineOperator('comparison'),
    '!=': defineOperator('comparison'),
    '===': defineOperator('comparison'),
    '!==': defineOperator('comparison'),
    '>': defineOperator('comparison'),
    '<': defineOperator('comparison'),
    '>=': defineOperator('comparison'),
    '<=': defineOperator('comparison'),
    '&&': defineOperator('logical'),
    '||': defineOperator('logical'),
    '!': defineOperator('logical'),
    '?': defineOperator('conditional'),
    '??': defineOperator('conditional'),
    '?.': defineOperator('access'),
});

export const supportedOperators = Object.freeze(Object.keys(operatorRegistry));

export const getOperatorDefinition = (value) =>
    Object.hasOwn(operatorRegistry, value) ? operatorRegistry[value] : null;

export const isComparisonOperator = (value) =>
    getOperatorDefinition(value)?.group === 'comparison';
