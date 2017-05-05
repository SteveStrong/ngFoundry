/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />


describe("Foundry: utils", function () {


    it("can create a guid", function () {
        expect(fo.newGuid()).toBeGreaterThan(0);
    });

});