import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import recommendedConfig from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    recommendedConfig,
    {
        name: 'Main Config',
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'prettier/prettier': ['error', {}, { usePrettierrc: true }],

            'no-unused-vars': 'off', // Ensure eslint doesn't care about unused variables.
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                },
            ],
        },
    },
    {
        files: ['**/*.mjs', '**/*.cjs', '**/*.js'],
        extends: [tseslint.configs.disableTypeChecked],
    },
    {
        // DO NOT ADD ANY PROPERTIES TO THIS OBJECT
        ignores: ['node_modules', 'build', 'assets'],
    },
);
