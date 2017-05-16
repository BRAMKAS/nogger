const path = require('path');
const pkg = require('./package.json');

const SRC_DIR = path.resolve(__dirname, 'src');
const PUBLIC_DIR = path.resolve(__dirname, 'public');

module.exports = {
  context: SRC_DIR,
  entry: `.${path.sep}main.js`,
  output: {
    path: PUBLIC_DIR,
    filename: 'bundle.js',
  },
  devtool: 'eval-source-map', // switch to cheap-module-eval-source-map or eval if it gets too slow
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css/,
        loader: 'css-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|vue)$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(ttf|eot|woff|png|jpg|gif|svg)$/,
        loader: 'file-loader?[name].[ext]?[hash]',
      },
    ],
  },
};
