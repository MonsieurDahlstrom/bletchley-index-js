module.exports = function (config) {
  var cfg = {
    basePath: '.',
  	frameworks: ['mocha', 'chai', 'sinon'],
    browsers: ['ChromeHeadless'],
    reporters: ['mocha', 'coverage'],
    files: [
      "tests/unit/**/*.spec.js",
  		"src/**/*.js"
  	],
    preprocessors: {
      'src/**/*.js': ['babel'],
      'test/**/*.js': ['babel']
    },
    babelPreprocessor: {
      options: {
        presets: ['env'],
        sourceMap: 'inline'
      },
      filename: function (file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function (file) {
        return file.originalPath;
      }
    },
    browserDisconnectTimeout:30000,
  	browserNoActivityTimeout:30000,
  	processKillTimeout:30000
  }
  config.set(cfg);
}
