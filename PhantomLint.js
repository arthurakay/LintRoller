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
    /**
     * @property
     */
    verbose  : true,

    /**
     * @property
     */
    fileTree : null,

    /**
     * @property
     */
    files    : [],

    /**
     * @property
     */
    jsLint   : 'assets/jslint.js',

    /**
     * @property
     */
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
     * @param {object} config
     */
    applyLintOptions : function(config) {
        var i;

        if (!config) { return false; }

        for (i in config) {
            this.lintOptions[i] = config[i];
        }
    },

    /**
     * @method
     * @param {object} config
     * @cfg {string} filepath A relative filepath to the folder containing JS files
     * @cfg {object} lintOptions A configuration object to add/override the default options for JS Lint
     * @cfg {boolean} verbose false to hide verbose output in your terminal (defaults to true)
     * @cfg {string} jsLint A relative filepath to the local JSLint file to use (defaults to ./assets/jslint.js)
     */
    init : function(config) {
        //APPLY CONFIG OPTIONS
        this.applyLintOptions(config.lintOptions);
        if (config.verbose !== undefined) { this.verbose = config.verbose; }
        if (config.jsLint !== undefined) { this.jsLint = config.jsLint; }

        this.log('JSLint? ' + phantom.injectJs(this.jsLint), true);
        if (!JSLINT) { phantom.exit(1); }

        this.fileTree = this.getFiles(config.filepath);

        this.parseTree(this.fileTree, config.filepath);
        this.log('Filesystem has been parsed. Looping through available files...');

        this.lintFiles();

        this.announceSuccess();
    },

    /**
     * @method
     */
    announceErrors: function() {
        this.log('\nFix Your Errors!\n\n', true);
        phantom.exit(1);
    },

    /**
     * @method
     */
    announceSuccess: function() {
        this.log('\nSuccessfully linted yo shit.\n\n', true);
        phantom.exit(0);
    },

    /**
     * @method
     * @param {string} path
     */
    getFiles : function(path) {
        var tree = filesystem.list(path);

        this.log('FILES FOUND AT PATH:');
        this.log(tree);

        return tree;
    },

    /**
     * @method
     * @param {array} list
     * @param {string} path
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
     * @method
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

    /**
     * @method
     * @param {string} msg
     * @param {boolean} override
     */
    log : function(msg, override) {
        if (this.verbose || override) {
            console.log(msg);
        }
    }
};
