import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

export default tseslint.config(
    {ignores: ['dist', 'node_modules', 'build']},
    {
        extends: [js.configs.recommended],
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.node
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'prettier': prettierPlugin
        },
        rules: {
            'no-console': 'off',
            'no-unused-vars': 'off',
            'no-undef': 'warn',
            'prefer-const': 'warn',
            'no-empty': 'warn',
            'prettier/prettier': 'warn',
            ...reactHooks.configs.recommended.rules,
            'react-hooks/rules-of-hooks': 'warn',
            'react-hooks/exhaustive-deps': 'warn',
            'react-refresh/only-export-components': [
                'warn',
                {allowConstantExport: true},
            ],
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [...tseslint.configs.recommended],
        rules: {
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/ban-types': 'warn',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/no-var-requires': 'warn',
        },
    },
    {
        files: ['**/*.__tests__.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}', '**/tests/**'],
        rules: {
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            'prefer-const': 'off',
            'no-console': 'off',
        },
    },
    prettierConfig
)