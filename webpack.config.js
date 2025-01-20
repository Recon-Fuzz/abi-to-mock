const path = require('path');

module.exports = {
  target: 'web',
  entry: './src/browser.ts',
  output: {
    filename: 'browser.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'umd',
      name: 'AbiToMock',
    },
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      fs: false,
      path: false,
      process: false
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};