import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: [
            'dist/**',
            'dist-frontend/**',
            'node_modules/**',
            'frontend/**',
            'spec/**',
            'tests/**',
            'tests-e2e/**',
            '**/*.js',
            '**/*.cjs',
        ],
    },
    {
        files: ['**/*.cjs'],
        languageOptions: {
            globals: {
                module: 'readonly',
                require: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                process: 'readonly',
                exports: 'writable',
            },
        },
    },
    {
        files: ['**/*.ts'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-namespace': [
                'error',
                {
                  allowDeclarations: true,
                },
              ],
        },
    },
);
