"use strict";
var JSHINT = require('jshint').JSHINT;

/**
 * @class LintRoller.linters.JSHint
 *
 * Created automatically if a { type : 'jsHint' } config is passed to the linters array.
 */
var linter = {

    /**
     * @property
     * JSHint
     */
    lib : JSHINT,

    /**
     * @cfg
     * An object containing lint validation options
     */
    options : {

    },

    /**
     * @private
     */
    applyLintOptions : function (options) {
        var i;

        if (!options) {
            return false;
        }

        for (i in options) {
            if (options.hasOwnProperty(i)) {
                this.options[i] = options[i];
            }
        }
    },

    /**
     * @private
     */
    runLinter : function (parentModule, callback) {
        var me = this,
            errorList = [],
            file, js;

        parentModule.log('Running JSHint against code...', false);

        parentModule.async.each(
            parentModule.files,

            function(file, next) {
                js = parentModule.fs.readFileSync(file, 'utf8');

                var i = 0,
                    result = me.lib(js, me.options),
                    totalErrors = me.lib.errors.length,
                    error;

                if (!result) {
                    for (i; i < totalErrors; i++) {
                        error = me.lib.errors[i];

                        if (error) {
                            errorList.push({
                                file      : file,
                                line      : error.line,
                                character : error.character,
                                reason    : error.reason
                            });

                            if (parentModule.stopOnFirstError) {
                                break;
                            }
                        }
                    }

                    if (parentModule.stopOnFirstError && errorList.length > 0) {
                        next(true);
                    }
                }

                next(null);
            },

            function(e) {
                if (e && parentModule.stopOnFirstError && errorList.length > 0) {
                    parentModule.announceErrors(errorList);
                }

                callback(errorList);
            }
        );
    }

};

module.exports = linter;