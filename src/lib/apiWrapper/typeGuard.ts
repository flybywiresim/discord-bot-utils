/**
 * Generic type guard.
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Check if a value is `null`.
 * @param value The value to check.
 * @returns `true` if the value is `null`, `false` otherwise.
 */
export const isNull: TypeGuard<null> = (value: unknown): value is null => value === null;

/**
 * Check if a value is a true JavaScript object.
 * @param value The value to check.
 * @returns `true` if the value is a true JavaScript object, `false` otherwise.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
 */
export const isTrueObject: TypeGuard<object> = (value: unknown): value is object => (typeof value === 'object' && value !== null && !isArray(value));

/**
 * Check if a value is an array. This is a simple wrapper for [Array.isArray()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray).
 * @param value The value to check.
 * @returns `true` if the value is an array, `false` otherwise.
 */
export const isArray: TypeGuard<any[]> = (value: unknown): value is any[] => Array.isArray(value);

/**
 * Check if a value is undefined.
 * @param value The value to check.
 * @returns `true` if the value is an array, `false` otherwise.
 */
export const isUndefined: TypeGuard<undefined> = (value: unknown): value is undefined => typeof value === 'undefined';

/**
 * Check if a value is a boolean.
 * @param value The value to check.
 * @returns `true` if the value is an array, `false` otherwise.
 */
export const isBoolean: TypeGuard<boolean> = (value: unknown): value is boolean => typeof value === 'boolean';

/**
 * Check if a value is a number.
 * @param value The value to check.
 * @returns `true` if the value is an array, `false` otherwise.
 */
export const isNumber: TypeGuard<number> = (value: unknown): value is number => typeof value === 'number';

/**
 * Check if a value is a bigint.
 * @param value The value to check.
 * @returns `true` if the value is an array, `false` otherwise.
 */
export const isBigInt: TypeGuard<bigint> = (value: unknown): value is bigint => typeof value === 'bigint';

/**
 * Check if the value is a string.
 * @param value The value to check.
 * @returns `true` if the value is an array, `false` otherwise.
 */
export const isString: TypeGuard<string> = (value: unknown): value is string => typeof value === 'string';
