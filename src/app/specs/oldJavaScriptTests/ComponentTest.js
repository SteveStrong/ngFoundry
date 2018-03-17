/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />

describe("Foundry: Component", function () {
    var obj;

    beforeEach(function () {
        obj = fo.makeComponent();
        return obj;
    });

    it("should be a Component", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        expect(obj.Properties.isEmpty()).toBe(true);
        expect(obj.Subcomponents.isEmpty()).toBe(true);
    });

    it("should have collections that exist", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        expect(obj.Properties).toBeDefined();
        expect(obj.Subcomponents).toBeDefined();
    });
});