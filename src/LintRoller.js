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
 * @version 2.2.5
 *
 * GitHub Project: http://arthurakay.github.com/LintRoller/
 */
"use strict";
var LintRoller = {
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
     * An array of lint module config objects. See the classes under LintRoller.linters for more information.
     */
    linters : [],

    /**
     * @cfg
     * An object containing:
     *
     *   - "name": the relative filepath to where error messages will be logged
     *   - "type": the type of output ("text", "json", or "xml")
     */
    logFile : {
        name : 'error_log.txt',
        type : 'text'
    },

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
    },

    /**
     * @private
     */
    files : [],

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
                if (i === 'linters') {
                    this.setLinters(config[i]);
                }
                else if (i === 'logFile') {
                    //TODO: hard-coding this for now... may revisit later
                    this.logFile.name = config[i].name;
                    this.logFile.type = config[i].type;
                }
                else {
                    this[i] = config[i];
                }
            }
        }
    },

    /**
     * @private
     */
    setLinters : function (linters) {
        if (!(linters instanceof Array) || linters.length === 0) {
            process.exit(1);
        }

        var i = 0,
            linter, linterCfg;

        for (i; i < linters.length; i++) {
            linterCfg = linters[i];

            this.log('Initializing linter: ' + linterCfg.type, true);

            linter = require('./linters/' + linterCfg.type.toLowerCase());
            linter.applyLintOptions(linterCfg.options);
            linter.name = linterCfg.type.toLowerCase();

            this.linters.push(linter);
        }
    },

    /**
     * @private
     */
    announceErrors : function (errorList) {
        if (typeof this.logFile.name === 'string') {
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
                        childPath;

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
        var me = this,
            errorList = {},
            errors = 0;

        this.log('\n' + this.files.length + ' JS files found.', true);

        /*
         * Loop through all files with each linter
         */
        this.async.each(
            this.linters,

            function (linter, callback) {
                linter.runLinter(
                    me,
                    function (newErrors) {
                        errors += newErrors.length; //ignore the first record, which is a title

                        errorList[linter.name] = newErrors;

                        callback(null);
                    }
                );
            },

            function (e) {
                errorList.totalErrors = errors;

                if (errors > 0) {
                    me.announceErrors(errorList);
                }
                else {
                    me.announceSuccess();
                }
            }
        );
    },

    /**
     * @private
     */
    logToFile : function (errorList) {
        errorList.title = 'LintRoller : Output for ' + new Date();
        this.log('\nWriting ' + errorList.totalErrors + ' errors to new log file.', true);

        var output;

        switch (this.logFile.type.toUpperCase()) {
            case 'JSON':
                output = JSON.stringify(errorList);
                break;

            case 'XML':
                this.log('\nNot currently supporting XML output...');
                //break;
                return;

            default:
                output = errorList.title + '\n\n';
                output += this.formatTextOutput(errorList);
                break;
        }

        this.fs.writeFileSync(this.logFile.name, output);
    },

    formatTextOutput : function (errorList) {
        var output = '',
            i, x, error;

        for (i in errorList) {
            if (errorList.hasOwnProperty(i)) {
                switch (i) {
                    case 'jslint':
                    case 'jshint':
                    case 'esprima':
                        output += '=============== Running ' + i.toUpperCase() + ' ===============' + '\n\n';

                        for (x = 0; x < errorList[i].length; x++) {
                            error = errorList[i][x];
                            output += error.file + '\n' +
                                      '    Line #: ' + error.line + '\n' +
                                      '    Char #: ' + error.character + '\n' +
                                      '    Reason: ' + error.reason + '\n\n';
                        }
                        break;

                    case 'w3c_html':
                        output += '=============== Running ' + i.toUpperCase() + ' ===============' + '\n\n';

                        for (x = 0; x < errorList[i].length; x++) {
                            error = errorList[i][x];
                            output += error.file + '\n' +
                                      '    Message: ' + error.message + '\n' +
                                      '    Context: ' + error.context + '\n\n';
                        }
                        break;

                    default:
                        break;
                }
            }
        }

        return output;
    },

    clearLogFile : function () {
        try {
            this.log('\nDeleting old log file...', true);
            this.fs.unlinkSync(this.logFile.name);
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

    //async lib
    me.async = require('async');

    //other utilities
    var util = require('./util');
    me.util = util.init(me);
};

initModules(LintRoller);

module.exports = LintRoller;