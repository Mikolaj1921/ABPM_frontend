module.exports = {
  root: true,
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules'],
      },
    },
  },
  extends: [
    'airbnb',
    'plugin:react-native/all',
    'plugin:react/recommended',
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    'react-native/react-native': true,
    browser: true,
    node: true,
  },
  plugins: ['react-native', 'prettier', 'react'],
  rules: {
    indent: 'off',
    'no-nested-ternary': 'off',
    'linebreak-style': 'off',
    'import/prefer-default-export': 'off',
    'no-console': 'off',
    'react-native/no-raw-text': 'off',
    'react/jsx-filename-extension': ['warn', { extensions: ['.js'] }],
    'react/prop-types': 'off',
    'react-native/no-inline-styles': 'off',
    'prettier/prettier': 'error',
    'no-trailing-spaces': 'error',
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'eol-last': ['error', 'always'],
    'no-multi-spaces': ['error', { ignoreEOLComments: true }],
    'no-use-before-define': ['error', { variables: false }],
    'global-require': 'off',
    'react-native/sort-styles': 'off',
    'react-native/no-color-literals': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: ['arrow-function', 'function-declaration'],
      },
    ],
  },
};
