import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

// Flat config (ESLint 9), aligned with the FlyByWire aircraft repo's approach:
// Prettier owns all formatting; ESLint enforces code-quality rules only.
export default tseslint.config(
    {
        ignores: ['build/', 'node_modules/'],
    },
    js.configs.recommended,
    tseslint.configs.base,
    tseslint.configs.eslintRecommended,
    prettierRecommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            'no-unused-vars': 'off',
            // The subcommand-router switches consistently declare within case clauses (each case returns/breaks)
            'no-case-declarations': 'off',
            '@typescript-eslint/no-unused-vars': ['error', {
                varsIgnorePattern: '_.*',
                argsIgnorePattern: '_.*',
                caughtErrorsIgnorePattern: '_.*',
            }],
        },
    },
);
