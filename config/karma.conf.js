// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

const isTest = process.env.NODE_ENV === 'test';
const browser = [isTest ? 'PhantomJS' : 'Chrome'];

module.exports = function (config) {
  config.set({
    basePath: '../',
    frameworks: ['jasmine', '@angular/cli'],
    plugins: [
      require('karma-jasmine'),
      require('karma-phantomjs-launcher'),
      require('karma-chrome-launcher'),
      require('karma-phantomjs-launcher'),
      require('karma-spec-reporter'),
      require('karma-junit-reporter'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular/cli/plugins/karma')
    ],
    client:{
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    files: [
      { pattern: './src/test.ts', watched: false }
    ],
    preprocessors: {
      './src/test.ts': ['@angular/cli']
    },
    mime: {
      'text/x-typescript': ['ts','tsx']
    },
    coverageIstanbulReporter: {
      reports: [ 'html', 'lcovonly' ],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: config.angularCli && config.angularCli.codeCoverage
      ? ['spec', 'junit', 'coverage-istanbul']
      : ['spec', 'junit', 'kjhtml'],
    specReporter: {
      maxLogLines: 5,              // limit number of lines logged per test
      suppressErrorSummary: false, // print error summary
      suppressFailed: false,       // print information about failed tests
      suppressPassed: false,       // print information about passed tests
      suppressSkipped: true,       // do not print information about skipped tests
      showSpecTiming: false,       // do not print the time elapsed for each spec
      failFast: true               // test would finish with error when a first fail occurs.
    },
    junitReporter: {
      outputDir: 'reports',
      outputFile: 'junit-report.xml',
      useBrowserName: false
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: true,
    browsers: browser,
    singleRun: false
  });
};
