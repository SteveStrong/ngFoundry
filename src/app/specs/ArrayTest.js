import { async, ComponentFixture, TestBed } from '@angular/core/testing';


describe("Foundry: Array as a property", function () {
     var obj;

    beforeEach(function () {
        var x = {
            items: [1, 2, 3, 4, 5],
            stringItems: ['washington', 'bush',  'addams', 'jefferson', 'bush' ]
        };
        obj = fo.makeComponent(x);
        return obj;
    });

    it("should be a components", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        expect(obj.Properties.count).toEqual(2);
        expect(obj.Subcomponents.isEmpty()).toBe(true);
    });

    it("have managed items list", function () {
        expect(obj.items).toBeDefined();
        expect(obj.items.isEmpty()).toBe(false);
        expect(obj.items.length).toEqual(5);

        expect(fo.utils.isArray(obj.items)).toBe(true);
    });

    it("can map", function () {
        var list = obj.items.map(function (item) {
            return item + 1;
        });

        expect(list.count).toBeUndefined();
        expect(list.length).toEqual(5);
    });

    it("can reduce", function () {
        var result = obj.items.reduce(function (a, b) {
            return a += b;
        }, 0);

        expect(result).toEqual(15);
        expect(obj.items.length).toEqual(5);
    });

    it("should be able to compute min", function () {
        expect(obj.items.min()).toEqual(1);
    });

    it("should be able to compute max", function () {
        expect(obj.items.max()).toEqual(5);
    });

    it("should be able to find index of first", function () {
        var index = obj.items.indexOfFirst(function (item) {
            return item == 3;
        });

        expect(index).toEqual(2);

        var index = obj.stringItems.indexOfFirst(function (item) {
            return item == 'bush';
        });

        expect(index).toEqual(1);

    });

    it("should be able to find itemByIndex", function () {
        expect(obj.items.itemByIndex(2)).toEqual(3);
        expect(obj.stringItems.itemByIndex(2)).toEqual('addams');

        expect(obj.stringItems.itemByIndex(12)).toBeUndefined();
        expect(obj.stringItems.itemByIndex(-2)).toBeUndefined();
    });

    it("should be able to compute distinctItems", function () {
        expect(obj.items.distinctItems().length).toEqual(5);
        expect(obj.stringItems.distinctItems().length).toEqual(4);
    });

    it("should be able to addNoDupe", function () {
        expect(obj.items.distinctItems().length).toEqual(5);

        obj.items.addNoDupe(4)
        expect(obj.items.length).toEqual(5);

        obj.items.addNoDupe(40)
        expect(obj.items.length).toEqual(6);

        obj.items.addNoDupe(3)
        expect(obj.items.length).toEqual(6);
    });
});