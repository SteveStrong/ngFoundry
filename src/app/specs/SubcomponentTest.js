/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />

describe("Foundry: Subcomponents", function () {
    var obj;



    beforeEach(function () {
        obj = fo.makeComponent({});
    });

    it("should be a Component with empty collections", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        expect(obj.Properties.isEmpty()).toBe(true);
        expect(obj.Subcomponents.isEmpty()).toBe(true);
    });

    it("should able to add a subcomponent", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        var child = fo.makeComponent();
        obj.addSubcomponent(child);
        expect(obj.Subcomponents.count).toEqual(1);

        expect(child.myParent).toBeDefined();
        expect(child.myParent).toBe(obj);

    });

    it("should able to remove a subcomponent", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        var child = fo.makeComponent();
        obj.addSubcomponent(child);
        expect(obj.Subcomponents.count).toEqual(1);

        expect(child.myParent).toBeDefined();
        expect(child.myParent).toBe(obj);


        obj.removeSubcomponent(child);
        expect(obj.Subcomponents.count).toEqual(0);

        expect(child.myParent).toBeUndefined();
    });


    it("should able to be captures", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        var child = fo.makeComponent();
        obj.capture(child, 'steve', true);
        expect(obj.steve).toEqual(child);

        expect(child.myParent).toEqual(obj);

        var newParent = fo.makeComponent();
        newParent.capture(child, 'steve', true);
        expect(newParent.steve).toEqual(child);
        expect(obj.steve).toBeUndefined();

        expect(child.myParent).toEqual(newParent);

    });

 
});