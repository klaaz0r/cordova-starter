var PluginError = require('gulp-util').PluginError
var gutil = require('gulp-util')
var through = require('through2')
var path = require('path')
var convict = require('convict')
var Vinyl = require('vinyl')
var fs = require('fs')

var PLUGIN_NAME = 'gulp-convict'
var ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'

module.exports = function(options) {
  return through.obj(function(file, encoding, callback) {

    if (file.isNull()) {
      return callback(null, file)
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'))
    }

    if (file.isBuffer()) {

      var fileName = path.basename(file.path, '.js')
      //compare filename to NODE_ENV
      if (fileName === ENV) {
        //load the default schema
        var config = convict(require(options.schema).default)
        //get the data from the input
        var envSchema = require(file.path).default
        //load the env
        config.load(envSchema)
        // write the config
        var configObj = JSON.stringify(config.get(), null, 2)

        if (options.log) {
          gutil.log('config', gutil.colors.magenta(configObj))
        }

        var file = new Vinyl({
          path: 'config.json',
          contents: new Buffer(configObj)
        })

        return callback(null, file)
      }
      //do nothing, wrong env schema
      return callback(null, null)
    }
  })
}
