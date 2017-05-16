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
  globals: {
    describe: true,
    it: true,
    expect: true,
  },
  rules: {
    'linebreak-style': 0,
    'no-param-reassign': 0,
  }
};