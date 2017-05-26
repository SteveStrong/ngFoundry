/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />


describe("Foundry: Test Template", function () {
    var obj;

    beforeEach(function () {
        obj = fo.makeComponent({});
        return obj;
    });
     
    it("should be a component", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        expect(obj.myName).toBeUndefined();
        expect(obj.myParent).toBeUndefined();

        expect(obj.Properties.isEmpty()).toBe(true);
        expect(obj.Properties.count).toEqual(0);

        expect(obj.Subcomponents.isEmpty()).toBe(true);
        expect(obj.Subcomponents.count).toEqual(0);
    });

});