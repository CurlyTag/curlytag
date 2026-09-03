import { supportedOperators } from '../syntax/operators.js';

const operatorSet = new Set(supportedOperators);

const collectOperatorLengths = () => {
    const lengths = new Set();

    for (const operator of supportedOperators) {
        lengths.add(operator.length);
    }

    // Try longer operators first so "!==" is not split into "!" and "==".
    return [...lengths].sort((left, right) => right - left);
};

const operatorLengths = Object.freeze(collectOperatorLengths());

/**
 * Reads the longest supported operator at the given source position.
 *
 * @param {string} source Full source text.
 * @param {number} start Position at which an operator may begin.
 * @param {number} [stop=source.length] Exclusive boundary that must not be crossed.
 * @returns {{ value: string, nextPosition: number } | null} The operator, or `null` when none starts here.
 */
export const readOperator = (source, start, stop = source.length) => {
    for (const length of operatorLengths) {
        if (start + length > stop) {
            continue;
        }

        const value = source.slice(start, start + length);

        if (operatorSet.has(value)) {
            return {
                value,
                nextPosition: start + length,
            };
        }
    }

    return null;
};
