"use strict";
var w3c = require('w3cjs');

/**
 * @class LintRoller.linters.W3C_HTML
 *
 * Created automatically if a { type : 'jsLint' } config is passed to the linters array.
 */
var linter = {

    /**
     * @property
     * JSLint
     */
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
        var j = 0,
            errorList = [];

        parentModule.log('Running W3C_HTML against code...', false);

        parentModule.async.each(
            parentModule.files,

            function (file, next) {
                w3c.validate({
                    file     : file,
                    output   : 'json',
                    callback : function (error) {
                        if (error) {
                            errorList.push({
                                file    : file,
                                //line      : 0,
                                //character : 0,
                                reason  : error.message,
                                context : error.context
                            });

                            if (parentModule.stopOnFirstError) {
                                next(true);
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