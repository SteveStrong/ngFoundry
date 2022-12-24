/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />


describe("fo.Property: API Validation", function () {
    var comp;
    var obj;

    beforeEach(function () {
        comp = fo.makeComponent();
        obj = comp.createProperty("Answer", 42);
        return obj;
    });

    it("should be a property", function () {
        expect(fo.utils.isaProperty(obj)).toBe(true);
        expect(fo.utils.isaComponent(comp)).toBe(true);

        expect(obj.myName).toEqual("Answer");
        expect(obj.myParent).toBeUndefined();
        expect(obj.owner).toEqual(comp);
        expect(obj.value).toEqual(42);

        expect(obj.status).toEqual("init");
        expect(obj.formula).toBeUndefined();

        expect(obj.thisValueDependsOn).toBeUndefined();
        expect(obj.thisInformsTheseValues).toBeUndefined();
        expect(obj.uiBindings).toBeUndefined();
        expect(obj.onRefreshUi).toBeUndefined();
        expect(obj.onValueSet).toBeUndefined();
    });

    it("should define getID", function () {
        expect(obj.getID).toBeDefined();
    });

    it("should define redefine", function () {
        expect(obj.redefine).toBeDefined();
    });

    it("should define asReference", function () {
        expect(obj.asReference).toBeDefined();
    });

    it("should define isValueKnown", function () {
        expect(obj.isValueKnown).toBeDefined();
    });

});