import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default defineConfig(
  // Global ignores — vendor, build output, and the large committed image/PDF
  // asset directories (see AGENTS.md asset-footprint note). Not scoped to any
  // `files` pattern, so these apply repo-wide regardless of extension.
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.tsbuildinfo',
      'server/data/**',
      '**/src/assets/**',
      '.omo/**',
      '.codegraph/**',
      '.claude/**',
    ],
  },

  // server/ is still plain ESM JavaScript (ports to TS in a later wave).
  // NOTE: `extends` (native to ESLint's defineConfig) propagates this
  // block's `files` into each extended config — required because
  // js.configs.recommended/tseslint.configs.recommended carry no `files`
  // of their own and would otherwise apply repo-wide.
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Express handler/middleware signatures are framework-mandated (e.g.
      // the trailing `next` of a 4-arg error handler in server/src/index.js
      // is required for Express to recognize it as error-handling
      // middleware even though it's never called). Unused positional
      // params here are not real bugs, so don't flag them; unused local
      // vars/imports are still caught.
      'no-unused-vars': ['error', { args: 'none', varsIgnorePattern: '^_' }],
      // The `let x = {}; try { x = parse(...) } catch { x = {} }` pattern
      // used throughout server/src/db.js consumers pre-dates this config
      // and is superseded by Drizzle in Wave 2 — not worth a source edit
      // to a file that's about to be rewritten.
      'no-useless-assignment': 'off',
    },
  },

  // TypeScript + TSX everywhere in the repo (the 3 apps and packages/*).
  // Same `extends`-propagation as above scopes typescript-eslint's
  // recommended (non-type-checked) parser/plugin/rules to .ts/.tsx only.
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Match the codebase's existing leading-underscore convention for
      // intentionally-unused params/vars (e.g. GameHeader's `_props`),
      // consistent with every app's tsconfig already setting
      // noUnusedParameters/noUnusedLocals to false.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // React Hooks rules of hooks for the 3 React apps' components only.
  {
    files: ['admin/**/*.tsx', 'formulario/**/*.tsx', 'formulario2/**/*.tsx'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  }
);
