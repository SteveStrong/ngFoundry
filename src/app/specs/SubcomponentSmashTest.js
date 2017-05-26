/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.adaptor.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />

describe("Foundry: Subcomponents Smash", function () {
    var obj;

    beforeEach(function () {
        obj = fo.makeComponent({
            bestComponent: function () {
                var found = this.Subcomponents.filter(function (item) {
                    return item.thebest == true;
                });
                return found.first();
            }
        });
    });

    it("should be a Component with the correct defaults", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        expect(obj.bestComponent).toBeUndefined();
        expect(obj.Subcomponents.isEmpty()).toBe(true);
    });

    it("adding a subcomponent should force recompute", function () {
        expect(obj.bestComponent).toBeUndefined();

        var child = fo.makeComponent({ thebest: true });
        obj.addSubcomponent(child);

        expect(obj.Subcomponents.count).toEqual(1);

        expect(obj.bestComponent).toBe(child);

    });

    it("changing a subcomponent's value should force recompute", function () {
        expect(obj.bestComponent).toBeUndefined();

        var child = fo.makeComponent({ thebest: false });
        obj.addSubcomponent(child);
        var child1 = fo.makeComponent({ thebest: false });
        obj.addSubcomponent(child1);


        expect(obj.Subcomponents.count).toEqual(2);
        expect(obj.bestComponent).toBeUndefined();

        child1.thebest = true;

        expect(obj.bestComponent).toBe(child1);
    });

    it("changing a subcomponent's value computed force recompute", function () {
        expect(obj.bestComponent).toBeUndefined();

        var child = fo.makeComponent({
            thebest: function () {
                return this.localBest;
            },
            localBest: false
        });
        obj.addSubcomponent(child);

        expect(obj.Subcomponents.count).toEqual(1);
        expect(obj.bestComponent).toBeUndefined();

        child.localBest = true;

        expect(obj.bestComponent).toBe(child);
    });

    it("adding an adapter should force recompute", function () {
        expect(obj.bestComponent).toBeUndefined();

        var child = obj.createAdaptor({ thebest: true });

        expect(obj.Subcomponents.count).toEqual(1);

        expect(obj.bestComponent).toBe(child);

    });

    it("changing an adapter should force recompute", function () {
        expect(obj.bestComponent).toBeUndefined();

        var child = obj.createAdaptor({ thebest: false });

        expect(obj.Subcomponents.count).toEqual(1);
        expect(obj.bestComponent).toBeUndefined();

        child.thebest = true;

        expect(obj.bestComponent).toBe(child);

    });

 
});