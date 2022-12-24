/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />



describe("Foundry: Managed List", function () {
    var obj;

    beforeEach(function () {
        obj = fo.makeComponent();
        var list = [
            { value: 1 },
            { value: 2 },
            { value: 3 },
            { value: 4 },
            { value: 5 },
        ];
        obj.appendTo("items", list)
        return obj;
    });

    it("should be a components", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        expect(obj.Properties.isEmpty()).toBe(true);
        expect(obj.Subcomponents.isEmpty()).toBe(true);
    });

    it("have managed items list", function () {
        expect(obj.items).toBeDefined();
        expect(obj._items).toBeUndefined();
        expect(obj.items.isEmpty()).toBe(false);
        expect(obj.items.count).toEqual(5);
    });

    it("can map", function () {
        var list = obj.items.map(function (item) {
            return item.value + 1;
        });

        expect(list).toEqual([2, 3, 4, 5, 6]);

        expect(list.count).toBeUndefined();
        expect(list.length).toEqual(5);
    });

    it("can reduce", function () {
        var list = obj.items.map(function (item) {
            return item.value + 1;
        });

        expect(list).toEqual([2, 3, 4, 5, 6]);

        var result = list.reduce(function (a, b) {
            return a += b;
        }, 0);

        
        expect(result).toEqual(15 + 5);
        expect(obj.items.elements.length).toEqual(5);
    });

    it("can mapReduce", function () {
        var result = obj.items.mapReduce(function (item) {
            return item.value + 1;
        },
        function (a, b) {
            return a += b;
        },0);

        expect(result).toEqual(20);
        expect(obj.items.elements.length).toEqual(5);
        expect(obj.items.count).toEqual(5);
    });
});