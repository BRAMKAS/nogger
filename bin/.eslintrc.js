module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  extends: [
    'airbnb-base',
  ],
  env: {
    node: true,
  },
  rules: {
    'linebreak-style': 0,
    'no-param-reassign': 0,
    'no-console': 0,
  }
};