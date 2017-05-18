const path = require('path');

const SRC_DIR = path.resolve(__dirname, 'src');
const PUBLIC_DIR = path.resolve(__dirname, 'public');

const production = process.env.NODE_ENV === 'production';

module.exports = {
  context: SRC_DIR,
  entry: `.${path.sep}main.js`,
  output: {
    path: PUBLIC_DIR,
    filename: 'bundle.js',
  },
  devtool: production ? 'source-map' : 'eval-source-map', // switch to cheap-module-eval-source-map or eval if it gets too slow
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'url-loader',
        options: {
          limit: 25000,
        },
      },
    ],
  },
};
