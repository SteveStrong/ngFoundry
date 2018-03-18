/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />


describe("Foundry: Collections Dynamic", function () {
    var obj;

    //this works correctly
    beforeEach(function () {

        obj = fo.makeComponent({});
        //obj.establishCollection('Connections')
        return obj;
    });

    it("should have default collections", function () {
        expect(fo.utils.isaCollection(obj.Subcomponents)).toBe(true);
        expect(fo.utils.isaCollection(obj.Properties)).toBe(true);
    });

    it("should be able to create collection dynamically", function () {
        obj.establishCollection('Connections')
        expect(fo.utils.isaCollection(obj.Connections)).toBe(true);
    });

    it("should function normally", function () {
        var col = obj.establishCollection('Connections');
        for (var i = 0; i < 10; i++) {
            col.push(fo.makeComponent({ x: i }));
        }
        expect(fo.utils.isaCollection(obj.Connections)).toBe(true);
        expect(col.count).toEqual(10);
        expect(col.isEmpty()).toEqual(false);
        expect(col.isNotEmpty()).toEqual(true);

    });

    it("should be able to initialize", function () {
        var col = [];
        for (var i = 0; i < 10; i++) {
            col.push(fo.makeComponent({ x: i }));
        }

        obj.establishCollection('Connections', col);

        expect(fo.utils.isaCollection(obj.Connections)).toBe(true);
        expect(obj.Connections.count).toEqual(10);
        expect(obj.Connections.isEmpty()).toEqual(false);
        expect(obj.Connections.isNotEmpty()).toEqual(true);

    });


    it("should be able to initialize a custom mapping as a property", function () {
        var col = [];
        for (var i = 0; i < 10; i++) {
            col.push(fo.makeComponent({ x: i }));
        }

        var spec = {
            itemsGE5: function () {
                var result = this.filter(function (item) {
                    return item.x >= 5;
                });
                return result;
            }
        }

        obj.establishCollection('Connections', col, spec);

        expect(fo.utils.isaCollection(obj.Connections)).toBe(true);
        expect(obj.Connections.itemsGE5).toBeDefined();
        expect(obj.Connections.itemsGE5.count).toEqual(5);
    });


    it("should be able to initialize, compute a custom mapping as a property, then add and see value change", function () {
        var col = [];
        for (var i = 0; i < 10; i++) {
            col.push(fo.makeComponent({ x: i }));
        }

        var spec = {
            itemsGE5: function () {
                var result = this.filter(function (item) {
                    return item.x >= 5;
                });
                return result;
            }
        }

        obj.establishCollection('Connections', col, spec);

        expect(fo.utils.isaCollection(obj.Connections)).toBe(true);
        expect(obj.Connections.itemsGE5.count).toEqual(5);

        var col = obj.Connections;
        for (var i = 0; i < 10; i++) {
            col.push(fo.makeComponent({ x: i }));
        }

        expect(obj.Connections.itemsGE5.count).toEqual(10);

    });



});