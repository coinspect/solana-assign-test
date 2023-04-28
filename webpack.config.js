const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const DIST = path.resolve(__dirname, 'dist');

const webpack = require('webpack');

module.exports = {
  devtool: 'eval-source-map',
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: DIST,
    publicPath: DIST,
  },
  devServer: {
      static: { directory: DIST },
    port: 9011,
    devMiddleware: {
        writeToDisk: true,
    },
  },
  
  resolve: {
    extensions: [ '.ts', '.js' ],
	fallback: {
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer"),
            "json-diff": require.resolve("json-diff"),
            "assert": require.resolve("assert/"),
            "util": require.resolve("util/"),
            "os": require.resolve("os-browserify/browser"),
            "bigint-buffer": require.resolve("bigint-buffer")
        }
  },
  plugins: [

    // Work around for Buffer is undefined:
    // https://github.com/webpack/changelog-v5/issues/10
    new webpack.ProvidePlugin({
	    Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
	    process: 'process/browser',
    }),

    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),

    // for build scripts
    new CopyPlugin({
      patterns: [
        {
          flatten: true,
          from: './src/*',
          globOptions: {
            ignore: ['**/*.js'],
          },
        },
      ],
    }),
  ],
};
