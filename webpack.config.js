const webpack = require('webpack')
const path = require('path')

const context = path.join(process.cwd(), 'app')
const outputPath = path.join(process.cwd(), 'www')

const plugins = env => env === 'develop' ? [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new webpack.DllReferencePlugin({
    context: process.cwd(),
    manifest: require(path.join(outputPath, 'main.json'))
  })
] : []

// const entry = env => env === 'develop' ? [
//   // 'webpack/hot/dev-server',
//   // // forces page reload if HMR needs it
//   // 'webpack-hot-middleware/client?reload=true',
//   './index.js'
// ] : ['./index.js']

const loaders = env => env === 'develop' ? [
  'babel-loader',
  'eslint-loader'
] : ['babel-loader']

module.exports = env => {
  return {
    context: context,
    entry: './index.js',
    output: {
      path: outputPath,
      publicPath: '/',
      filename: 'app.js'
    },
    module: {
      loaders: [{
        test: /\.js$/,
        loaders: loaders(env),
        include: __dirname,
        exclude: /node_modules/
      }]
    },
    plugins: plugins(env)
  }
}
