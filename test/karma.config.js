var webpackConfig = require('../config/webpack.config.js');
webpackConfig.entry = {};

// Karma configuration
module.exports = function(config) {
    config.set({
        client: {
            mocha: {
                timeout: 30000 // 30 seconds - upped from 10 seconds
            }
        },
        // ... normal karma configuration
        files: [

            // all files ending in ".spec"
            {pattern: 'src/**/*.js', watched: true},
            {pattern: '**/*.browserspec.js', watched: false},
            {pattern: '**/*.spec.js', watched: false}

            // each file acts as entry point for the webpack configuration
        ],
        frameworks: ['mocha'],
        browsers: ['Chrome'],
        autoWatchBatchDelay: 2000,

        preprocessors: {
            // add webpack as preprocessor
            'src/**/*.js': ['webpack'],
            '**/*.browserspec.js': ['webpack'],
            '**/*.spec.js': ['webpack']
        },
        reporters: ['mocha'],
        webpack: webpackConfig,

        webpackMiddleware: {
            // webpack-dev-middleware configuration
            // i. e.
            stats: 'errors-only'
        },
        logLevel: config.LOG_INFO,
        browserConsoleLogOptions: {
            level: 'log',
            terminal: true,
        },
    });
};
