const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  // Define API URL based on build mode
  const API_BASE_URL = isProduction 
    ? 'https://api.mindtube.duckdns.org/api/v1'
    : 'http://localhost:8000/api/v1';
    
  // Define Frontend URL based on build mode
  const FRONTEND_URL = isProduction
    ? 'https://dashboard.mindtube.duckdns.org'
    : 'http://localhost:5173';
    
  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'inline-source-map', // Add source maps for development
    entry: {
    background: './background.js',
    content: './content.js',
    popup: './popup.js',
    page_script: './page_script.js',
    iframe: './js/iframe.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.API_BASE_URL': JSON.stringify(API_BASE_URL),
      'process.env.FRONTEND_URL': JSON.stringify(FRONTEND_URL),
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
    })
  ]
  // Optional: If you have modules that webpack shouldn't parse,
  // for example, pre-minified vendor scripts like d3.min.js or markmap,
  // you might need to add a 'module.noParse' rule or use 'externals'.
  // For now, we'll keep it simple.
  // module: {
  //   noParse: /d3\.min\.js|markmap-lib\.min\.js|markmap-view\.min\.js/,
  // },
  };
};