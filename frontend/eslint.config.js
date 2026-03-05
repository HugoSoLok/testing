import js from '@eslint/js'
import typescript from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default [
  js.configs.recommended,
  ...typescript.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['src/**/*.ts', 'src/**/*.vue', 'tests/**/*.ts'],
    languageOptions: {
      parserOptions: {
        parser: typescript.parser,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['dist/', 'coverage/', 'node_modules/', 'playwright-report/'],
  },
]
