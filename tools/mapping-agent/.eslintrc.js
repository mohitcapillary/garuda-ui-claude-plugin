module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
    complexity: ['error', { max: 10 }],
    camelcase: ['error', { properties: 'always' }],
    'no-var': 'error',
    'max-len': ['error', { code: 100, ignoreStrings: true, ignoreTemplateLiterals: true }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  env: {
    node: true,
    es2019: true,
  },
};
