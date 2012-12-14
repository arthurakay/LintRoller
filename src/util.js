/**
 *
 * @type {Object}
 */
util = {

    /**
     * @private
     */
    init : function (parent) {
        this.parent = parent;
        return this;
    },


    /**
     *
     * @param spacingChars {int} The number of spaces to replace a tab
     */
    replaceTabsWithSpaces : function (config, spacingChars) {
        this.parent.initConfigs(config);
        this.parent.parseTree(config.filepaths);

        this.parent.log('\nFilesystem has been parsed. Looping through available files...', true);

        var msg = 'Mixed spaces and tabs.';
        var offendingFiles = this.locateOffenders(msg);

        //HOW MANY ERRORS?!?
        this.parent.log(
            'Found ' + offendingFiles.length +
                ' files matching the error "' + msg +
                '" between ' + this.parent.linters.length + ' linters.',
            true
        );

        try {
            this.fixOffendingFiles(offendingFiles, spacingChars);
        }
        catch (e) {
            this.parent.log(
                'An error has occurred: ' + e,
                true
            );

            process.exit(1);
        }

        this.parent.log(
            'LintRoller has attempted to replace all tabs with ' + spacingChars + ' spaces.',
            true
        );

        process.exit(0);
    },


    /**
     * @private
     */
    locateOffenders : function (msg) {
        var offendingFiles = [],
            linter, newFiles, i;

        //find offending files
        for (i = 0; i < this.parent.linters.length; i++) {
            linter = this.parent.linters[i];

            newFiles = this.findLintErrors(linter, this.getLintOptions(linter), msg);
            offendingFiles = offendingFiles.concat(newFiles);
        }

        return offendingFiles;
    },


    /**
     * @private
     */
    fixOffendingFiles : function(offendingFiles, spacingChars) {
        var i = 0,
            spaces = '',
            file, js;

        for (i; i<spacingChars; i++) {
            spaces += ' ';
        }

        for (i=0; i < offendingFiles.length; i++) {
            file = offendingFiles[i];
            js = this.parent.fs.readFileSync(file, 'utf8');

            js = js.replace(/\t/g, spaces);

            this.parent.fs.writeFileSync(file, js, 'utf8');
        }
    },


    /**
     * @private
     */
    getLintOptions : function (linter) {
        if (linter === this.parent.jsLint.lib) {
            return this.parent.jsLint.options;
        }

        if (linter === this.parent.jsHint.lib) {
            return this.parent.jsHint.options;
        }

        return {};
    },


    /**
     * @private
     */
    findLintErrors : function (linter, options, msg) {
        var j = 0,
            offendingFiles = [],
            file, js;

        for (j; j < this.parent.files.length; j++) {

            file = this.parent.files[j];
            js = this.parent.fs.readFileSync(file, 'utf8');

            var i = 0,
                result = linter(js, options),
                totalErrors = linter.errors.length,
                error;

            if (!result) {
                for (i; i < totalErrors; i++) {
                    error = linter.errors[i];

                    if (error && error.reason === msg) {
                        offendingFiles.push(file);
                        break;
                    }
                }
            }
        }

        return offendingFiles;
    }

};

module.exports = util;