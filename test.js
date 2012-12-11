var PhantomLint = require('./PhantomLint.js');

var config = {
    verbose          : false,
    stopOnFirstError : false,
    logFile          : './error.log',

    //recursively include JS files in these folders
    filepaths  : [
        './'
    ],

    //but ignore anything in these folders
    exclusions : [
        './node_modules/',
        './assets/',
        './docs/'
    ],

    jsLint : {
        optons : {}
    },

    //optionally disable a linter
    jsHint : false
};

PhantomLint.init(config);