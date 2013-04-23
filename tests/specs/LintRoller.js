/*global describe : false, it : false, expect : false */
"use strict";
var LintRoller = require('../../src/LintRoller');

describe('LintRoller', function() {

    it('should pass this sanity test', function() {
        expect(LintRoller).toNotEqual(undefined);
    });

});