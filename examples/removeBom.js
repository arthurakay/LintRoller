var LintRoller = require('../src/LintRoller.js');

var config = {
    verbose    : false,

    logFile          : {
        name : './error.log',
        type : 'text'
    },

    //recursively include JS files in these folders
    filepaths  : [
        '../'
    ],

    //but ignore anything in these folders
    exclusions : [
        '../node_modules/',
        '../assets/',
        '../docs/'
    ],

    linters : [
        {
            type : 'jsLint'
        }
    ]
};

LintRoller.util.removeBOM(config);