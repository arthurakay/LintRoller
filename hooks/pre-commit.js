var LintRoller = require('../lintroller');

var config = {
    verbose          : false,
    stopOnFirstError : false,

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

    jsLint : {
        optons : {}
    },

    //optionally disable a linter
    jsHint : false
};

try {
    LintRoller.init(config);
}
catch (e) {
    console.log('\nAn error has been caught:\n\n');
    console.log(e);
    process.exit(1);
}