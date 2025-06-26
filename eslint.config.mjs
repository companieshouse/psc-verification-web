import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import tsParser from '@typescript-eslint/parser'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import checkFile from 'eslint-plugin-check-file'
import unusedImports from 'eslint-plugin-unused-imports'
import { eslintConfigStandard } from './eslint.standard.mjs'

export default defineConfig([
  eslintConfigStandard,
  {
    files: ['src/**/*.*', 'test/**/*.*'],

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.commonjs,
        ...globals.jest
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {}
      }
    },

    plugins: {
      js,
      '@typescript-eslint': typescriptEslint,
      'check-file': checkFile,
      'unused-imports': unusedImports
    },

    extends: ['js/recommended'],

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      indent: ['error', 4, {
        SwitchCase: 1
      }],

      quotes: ['error', 'double', {
        allowTemplateLiterals: true
      }],

      semi: [2, 'always'],
      'no-unused-vars': 'off',
      'padded-blocks': 'off',

      'check-file/filename-naming-convention': ['error', {
        'src/!(bin)/**/*.*': 'CAMEL_CASE',
        'test/**/*.*': 'CAMEL_CASE'
      }, {
        ignoreMiddleExtensions: true
      }],

      'check-file/folder-naming-convention': ['error', {
        'src/**/': 'KEBAB_CASE',
        'test/**/': 'KEBAB_CASE'
      }],

      'sort-imports': ['error', {
        ignoreDeclarationSort: true
      }],

      'unused-imports/no-unused-imports': 'error'
    }
  }
])
