var filesystem = require('fs'),
    JSLINT;

/**
 * @class PhantomLint
 * @author Arthur Kay (http://www.akawebdesign.com)
 * @singleton
 * @version 1.0
 *
 * GitHub Project: https://github.com/arthurakay/PhantomLint
 */
PhantomLint = {
    verbose  : true,
    fileTree : null,
    files    : [],

    jsLint   : 'assets/jslint.js',

    lintOptions : {
        nomen    : true, //if names may have dangling _
        plusplus : true, //if increment/decrement should be allowed
        sloppy   : true, //if the 'use strict'; pragma is optional
        vars     : true, //if multiple var statements per function should be allowed
        white    : true, //if sloppy whitespace is tolerated
        undef    : true  //if variables can be declared out of order
    },

    /**
     * @method
     * @param list
     */
    init : function(config) {
        this.log('JSLint? ' + phantom.injectJs(this.jsLint), true);
        if (!JSLINT) { phantom.exit(); }

        this.fileTree = this.getFiles(config.filepath);

        this.parseTree(this.fileTree, config.filepath);
        this.log('Filesystem has been parsed. Looping through available files...');

        this.lintFiles();

        this.announceSuccess();
    },

    announceErrors: function() {
        this.log('\nFix Your Errors!\n\n', true);
        phantom.exit();
    },

    announceSuccess: function() {
        this.log('\nSuccessfully linted yo shit.\n\n', true);
        phantom.exit();
    },

    /**
     * 
     */
    getFiles : function(path) {
        var tree = filesystem.list(path);

        this.log('FILES FOUND AT PATH:');
        this.log(tree);

        return tree;
    },

    /**
     * @method
     * @param list
     */
    parseTree : function(list, path) {
        var x     = 0,
            regex = /.*\.js$/i,
            childPath, childTree;

        for (; x < list.length; x++) {
            if (filesystem.isFile(path + list[x])) {
                this.log(list[x] + ' IS A FILE');
                /**
                 * We only want JS files
                 */
                if (regex.test(list[x])) {
                    this.files.push(path + list[x]);
                    this.log(list[x] + ' IS A JS FILE. Added to the list.');
                }
                else {
                    this.log(list[x] + ' IS NOT A JS FILE');
                }
            }
            else {
                this.log(list[x] + ' IS NOT A FILE');

                /**
                 * If not a file
                 *   - check against parent paths
                 *   - recurse into child paths
                 */
                if (list[x] === '.' || list[x] === '..') {
                    this.log(list[x] + ' IS A RELATIVE DIRECTORY PATH');
                }
                else {
                    childPath = path + list[x] + '/'
                    childTree = this.getFiles(childPath);
                    this.parseTree(childTree, childPath);
                }
            }
        }
    },

    /**
     * 
     */
    lintFiles : function() {
        var j = 0,
            file, js;

        /**
         * Loop through all files
         */
        for (; j < this.files.length; j++) {

            file = this.files[j];
            js   = filesystem.read(file);

            var i           = 0,
                result      = JSLINT(js, this.lintOptions),
                totalErrors = JSLINT.errors.length,
                error;

            if (!result) {
                for  (; i < totalErrors; i++)  {
                    error = JSLINT.errors[i];

                    if (error) {
                        /**
                         * Output error and stop
                         */
                        this.log(
                            [
                                file,
                                error.line,
                                error.character,
                                error.reason
                            ].join(':'),
                            true
                        );
                        this.announceErrors();
                    }
                }
            }
        }
    },

    log : function(msg, override) {
        if (this.verbose || override) {
            console.log(msg);
        }
    }
};
