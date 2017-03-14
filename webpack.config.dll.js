const webpack = require('webpack')
const path = require('path')

const outputPath = path.join(process.cwd(), 'www')

module.exports = entries => {
  return {
    context: process.cwd(),
    entry: entries,
    output: {
      filename: '[name].dll.js',
      path: outputPath,
      library: '[name]',
    },
    plugins: [
      new webpack.DllPlugin({
        name: '[name]',
        path: path.join(outputPath, '[name].json')
      })
    ]
  }
}
