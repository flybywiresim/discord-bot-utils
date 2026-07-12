import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

// Flat config (ESLint 10), aligned with the FlyByWire aircraft repo's approach:
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
            // ESLint 10 promotes this to recommended; the codebase deliberately uses defensive
            // init-then-reassign (e.g. `let errorText = ''` before an exhaustive if/else, or a
            // default before a try/modal read), so the flagged assignments are intentional, not bugs.
            'no-useless-assignment': 'off',
            '@typescript-eslint/no-unused-vars': ['error', {
                varsIgnorePattern: '_.*',
                argsIgnorePattern: '_.*',
                caughtErrorsIgnorePattern: '_.*',
            }],
        },
    },
);
