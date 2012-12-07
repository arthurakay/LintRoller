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
        './assets/jshint-master/'
    ],

    jsLint : {
        file   : './assets/jslint.js',
        optons : {}
    },

    //optionally disable a linter
    jsHint : false
};

phantom.injectJs('PhantomLint.js');
PhantomLint.init(config);