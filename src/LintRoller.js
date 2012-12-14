/*
 Copyright (c) 2011 Arthur Kay

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is furnished
 to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/**
 * @class LintRoller
 * @author Arthur Kay (http://www.akawebdesign.com)
 * @singleton
 * @version 2.1.0
 *
 * GitHub Project: https://github.com/arthurakay/LintRoller
 */
LintRoller = {
    /**
     * @cfg {Array} filepaths
     * REQUIRED. An array of relative filepaths to the folders containing JS files
     */

    /**
     * @cfg {Array} exclusions
     * REQUIRED. An array of relative filepaths to the folders containing JS files that should NOT be linted
     */

    /**
     * @cfg
     * True to show verbose ouput in the terminal.
     */
    verbose : true,

    /**
     * @cfg
     * True to stop linting your code when the first error is encountered.
     */
    stopOnFirstError : true,

    /**
     * @cfg
     * An object containing an "options" property (False to disable usage.).
     *
     *   - "options" is an object containing the optional lint flags.
     */
    jsLint : {
        lib : null,

        options : {
            nomen    : true, //if names may have dangling _
            plusplus : true, //if increment/decrement should be allowed
            sloppy   : true, //if the 'use strict'; pragma is optional
            vars     : true, //if multiple var statements per function should be allowed
            white    : true, //if sloppy whitespace is tolerated
            undef    : true, //if variables can be declared out of order,
            node     : true, //if Node.js globals should be predefined
            browser  : true, //if the standard browser globals should be predefined
            stupid   : true  //if really stupid practices are tolerated... namely blocking synchronous operations
        }
    },

    /**
     * @cfg
     * An object containing an "options" property (False to disable usage.).
     *
     *   - "options" is an object containing the optional lint flags.
     *
     */
    jsHint : {
        lib : null,

        options : {

        }
    },

    /**
     * @cfg
     * A relative filepath to where error messages will be logged.
     */
    logFile : 'error_log.txt',

    /**
     * Call this method to de-lint your JavaScript codebase.
     */
    init : function (config) {
        //APPLY CONFIG OPTIONS
        this.initConfigs(config);

        this.parseTree(config.filepaths);
        this.log('\nFilesystem has been parsed. Looping through available files...');

        this.clearLogFile();
        this.lintFiles();

        this.announceSuccess();
    },

    /**
     * @private
     */
    files : [],

    /**
     * @private
     */
    linters : [],

    /**
     * @private
     */
    initConfigs : function (config) {
        var i;

        if (!config) {
            return false;
        }

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                switch (i) {
                    case 'jsLint':
                    case 'jsHint':
                        if (typeof config[i] !== 'boolean') {
                            this.applyLintOptions(this[i], config.options);
                            break;
                        }

                        this[i] = config[i];
                        break;

                    default:
                        this[i] = config[i];
                        break;
                }

            }
        }

        this.setLinters();
    },

    /**
     * @private
     */
    setLinters : function () {
        if (this.jsLint) {
            this.log('Loading JSLint... ', true);
            this.linters.push(this.jsLint.lib);
        }

        if (this.jsHint) {
            this.log('Loading JSHint... ', true);
            this.linters.push(this.jsHint.lib);
        }

        if (this.linters.length === 0) {
            process.exit(1);
        }
    },

    /**
     * @private
     */
    applyLintOptions : function (linter, options) {
        var i;

        if (!options) {
            return false;
        }

        for (i in options) {
            if (options.hasOwnProperty(i)) {
                linter.options[i] = options[i];
            }
        }
    },

    /**
     * @private
     */
    announceErrors : function (errorList) {
        if (typeof this.logFile === 'string') {
            this.logToFile(errorList);
        }

        this.log('\nFix Your Errors! Check the log file for more information.\n\n', true);
        process.exit(1);
    },

    /**
     * @private
     */
    announceSuccess : function () {
        this.log('\nSuccessfully linted yo shit.\n\n', true);
        process.exit(0);
    },

    /**
     * @private
     */
    getFiles : function (path) {
        var tree = this.fs.readdirSync(path);

        this.log('\nFILES FOUND AT PATH: ' + path);
        this.log(tree);

        return tree;
    },

    /**
     * @private
     */
    parseTree : function (pathConfig) {
        var i = 0,
            regex = /\.js$/i,
            path = [];

        if (typeof pathConfig === 'string') {
            path[0] = pathConfig;
        }
        else {
            path = pathConfig; //should be an array of strings
        }

        for (i; i < path.length; i++) {
            var currPath = path[i];
            var exclude = false;

            this.log('\n*** currPath: ' + currPath);

            if (this.exclusions) {
                this.log('Checking exclusion paths...');

                var j = 0;
                for (j; j < this.exclusions.length; j++) {
                    if (currPath === this.exclusions[j]) {
                        exclude = true;
                    }
                }
            }

            if (exclude) {
                this.log('Excluding path: ' + currPath);
            }
            else {
                var list = this.getFiles(currPath);
                var x = 0;

                for (x; x < list.length; x++) {
                    var spacer = '    ',
                        childPath, childTree;

                    var stats = this.fs.statSync(currPath + list[x]);

                    if (stats.isFile()) {
                        this.log(spacer + list[x] + ' IS A FILE');
                        /*
                         * We only want JS files
                         */
                        if (regex.test(list[x])) {
                            this.files.push(currPath + list[x]);
                            this.log(spacer + list[x] + ' IS A JS FILE. Added to the list.');
                        }
                        else {
                            this.log(spacer + list[x] + ' IS NOT A JS FILE');
                        }
                    }
                    else {
                        this.log(spacer + list[x] + ' IS NOT A FILE');

                        /*
                         * If not a file
                         *   - check against parent paths
                         *   - recurse into child paths
                         */
                        if (list[x] === '.' || list[x] === '..') {
                            this.log(spacer + list[x] + ' IS A RELATIVE DIRECTORY PATH');
                        }
                        else {
                            childPath = currPath + list[x] + '/';
                            this.parseTree(childPath);
                        }
                    }
                }
            }
        }
    },

    /**
     * @private
     */
    lintFiles : function () {
        var x = 0,
            jsLintErrors = [],
            jsHintErrors = [],
            errorList = [],
            errors = 0,
            j,
            linter;

        this.log('\n' + this.files.length + ' JS files found.', true);

        /*
         * Loop through all files with each linter
         */
        for (x; x < this.linters.length; x++) {
            linter = this.linters[x];

            if (linter === this.jsLint.lib) {
                this.log('Running JSLint against code...', false);
                jsLintErrors = this.runLinter(this.jsLint);

                errors += jsLintErrors.length;
                jsLintErrors.splice(0, 0, '=============== Running JSLint... ===============\n\n');
            }
            else if (linter === this.jsHint.lib) {
                this.log('Running JSHint against code...', false);
                jsHintErrors = this.runLinter(this.jsHint);

                errors += jsHintErrors.length;
                jsHintErrors.splice(0, 0, '=============== Running JSHint... ===============\n\n');
            }
        }

        if (errors > 0) {
            errorList = errorList.concat(jsLintErrors, jsHintErrors);
            this.announceErrors(errorList);
        }

    },

    /**
     * @private
     */
    runLinter : function (linter) {
        var j = 0,
            errorList = [],
            file, js;

        for (j; j < this.files.length; j++) {

            file = this.files[j];
            js = this.fs.readFileSync(file, 'utf8');

            var i = 0,
                result = linter.lib(js, linter.options),
                totalErrors = linter.lib.errors.length,
                error;

            if (!result) {
                for (i; i < totalErrors; i++) {
                    error = linter.lib.errors[i];

                    if (error) {
                        errorList.push(
                            file,
                            '    Line #: ' + error.line,
                            '    Char #: ' + error.character,
                            '    Reason: ' + error.reason,
                            '',
                            ''
                        );

                        if (this.stopOnFirstError) {
                            break;
                        }
                    }
                }

                if (this.stopOnFirstError && errorList.length > 0) {
                    this.announceErrors(errorList);
                }
            }
        }

        return errorList;
    },


    /**
     * @private
     */
    logToFile : function (errorList) {
        this.log('\nWriting ' + ((errorList.length - this.linters.length ) / 6) + ' errors to new log file.', true);

        var header = 'LintRoller : Output for ' + new Date() + '\n\n';
        errorList.splice(0, 0, header);

        var output = errorList.join().replace(/,/g, '\n');

        this.fs.writeFileSync(this.logFile, output);
    },

    clearLogFile : function () {
        try {
            this.log('\nDeleting old log file...', true);
            this.fs.unlinkSync(this.logFile);
            this.log('Done.', true);
        }
        catch (err) {
            this.log('No log file currently exists.', true);
        }
    },

    /**
     * @private
     */
    log : function (msg, override) {
        if (this.verbose || override) {
            console.log(msg);
        }
    }

};

var initModules = function (me) {
    //filesystem API
    me.fs = require('fs');

    if (me.jsLint) {
        me.jsLint.lib = require('jslint');
    }

    if (me.jsHint) {
        me.jsHint.lib = require('jshint').JSHINT;
    }

    //other utilities
    var util = require('./util');
    me.util = util.init(me);
};

initModules(LintRoller);

module.exports = LintRoller;