/* eslint-disable @typescript-eslint/no-require-imports */

const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  entry: {
    index: './src/client/index.tsx',
  },
  output: {
    filename: 'scripts/[name].bundle.js',
    path: path.resolve(__dirname, 'build/client'),
  },
  mode: process.env.NODE_ENV || 'production',
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/client/assets/index.html',
      //favicon: "./client/assets/icons/favicon.png"
    }),
    new HtmlWebpackPlugin({
      filename: '404.html',
      template: './src/client/assets/404.html',
      inject: false,
      //favicon: "./client/assets/icons/favicon.png"
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css'
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript'
            ],
            plugins: [
              [
                '@babel/plugin-transform-runtime',
                {
                  'regenerator': true
                }
              ]
            ]
          }
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.css$/i,
        use: [
          process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[hash].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              // Options to lower image quality for faster network exchanges
              //webp: { 
              //  quality: 30,
              //}
              name: 'images/[hash].[ext]',
            },
          },
        ],
      },
    ]
  },
  optimization: {
    minimizer: [
      '...',
      new CssMinimizerPlugin(),
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  devServer: {
    publicPath: '/',
    proxy: {
      '/api': { target: 'http://localhost:3000' },
    },
    hot: true,
  },
};
