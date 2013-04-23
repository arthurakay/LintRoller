//Assumes the script is run from the module's root
process.chdir('hooks');

var LintRoller = require('../src/LintRoller');

var config = {
    verbose          : false,
    stopOnFirstError : false,

    //recursively include JS files in these folders
    filepaths        : [
        '../'
    ],

    //but ignore anything in these folders
    exclusions       : [
        '../node_modules/',
        '../assets/',
        '../docs/'
    ],

    linters : [
        {
            type    : 'jsLint',
            options : {
                sloppy : false,
                node   : true
            }
        },
        {
            type    : 'jsHint',
            options : {
                strict : true,
                node   : true
            }
        },
        {
            type : 'esprima'
        },
        {
            type : 'w3c_html'
        }
    ]
};

try {
    LintRoller.init(config);
}
catch (e) {
    console.log('\nAn error has been caught:\n\n');
    console.log(e);
    process.exit(1);
}