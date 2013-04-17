"use strict";
var w3c = require('w3cjs');

/**
 * @class LintRoller.linters.W3C_HTML
 *
 * Created automatically if a { type : 'w3c_html' } config is passed to the linters array.
 */
var linter = {

    lib : w3c,

    /**
     * @cfg
     * An object containing lint validation options
     */
    options : {
        //TODO: are there any options?
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
        var errorList = [],
            i;

        parentModule.log('Running W3C_HTML against code...', false);

        parentModule.async.each(
            parentModule.files,

            function (file, next) {
                w3c.validate({
                    file     : file,
                    output   : 'json',
                    callback : function (error) {
                        if (error) {
                            for (i = 0; i < error.messages.length; i++) {
                                var err = error.messages[i];

                                if (err.type === 'error') {
                                    errorList.push({
                                        file      : file,
                                        line      : err.lastLine,
                                        character : err.lastColumn,
                                        reason    : err.message,
                                        context   : err.explanation
                                    });

                                    if (parentModule.stopOnFirstError) {
                                        next(true);
                                    }
                                }
                            }
                        }

                        next(null);
                    }
                });
            },

            function (e) {
                if (e && parentModule.stopOnFirstError && errorList.length > 0) {
                    parentModule.announceErrors(errorList);
                }

                callback(errorList);
            }
        );
    }

};

module.exports = linter;