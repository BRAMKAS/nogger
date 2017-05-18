module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  extends: 'airbnb-base',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  env: {
    browser: true,
    node: false,
  },
  globals: {
    'componentHandler': true,
    window: true,
  },
  // check if imports actually resolve
  /*'settings': {
   'import/resolver': {
   'webpack': {
   'config': 'build/webpack.base.conf.js'
   }
   }
   },*/
  // add your custom rules here
  'rules': {
    // don't require .vue extension when importing

    'import/extensions': ['error', 'always', {
      'js': 'never',
      'vue': 'never'
    }],
    // allow debugger during development
    'max-len': ['error', 120],
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'linebreak-style': 0,
    'no-param-reassign': [2, { 'props': false }],
    'no-console': ["warn", { allow: ["warn", "error"] }],
    'no-underscore-dangle': ['error', { 'allow': ['_id'] }],
    'import/no-extraneous-dependencies': 0,
  }
};
