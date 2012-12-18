var ESPRIMA = require('esprima');

var linter = {

    lib : ESPRIMA,

    /**
     * @cfg
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
    runLinter : function (parentModule) {
        var j = 0,
            errorList = ['=============== Running Esprima... ===============\n\n'],
            file, js;

        parentModule.log('Running Esprima against code...', false);

        for (j; j < parentModule.files.length; j++) {

            file = parentModule.files[j];
            js = parentModule.fs.readFileSync(file, 'utf8');

            //TODO: make this work... is that possible?
            var i = 0,
                result = this.lib.parse(js, this.options),
                totalErrors = (result.errors) ? result.errors.length : 0,
                error;

            if (!result) {
                for (i; i < totalErrors; i++) {
                    error = this.lib.errors[i];

                    if (error) {
                        errorList.push(
                            file,
                            '    Line #: ' + error.line,
                            '    Char #: ' + error.character,
                            '    Reason: ' + error.reason,
                            '',
                            ''
                        );

                        if (parentModule.stopOnFirstError) {
                            break;
                        }
                    }
                }

                if (parentModule.stopOnFirstError && errorList.length > 0) {
                    parentModule.announceErrors(errorList);
                }
            }
        }

        return errorList;
    }

};

module.exports = linter;