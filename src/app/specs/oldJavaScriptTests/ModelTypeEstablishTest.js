/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />
/// <reference path="../Foundry/Foundry.adaptor.js" />

describe("Foundry:  Define Type Mixing", function () {

    var namespace = 'ModelTypes';

    var blockSpec = {
        //myType: 'block',
        height: 1,
        width: 2,
        baseArea: function () { return this.width * this.height },
        depth: 3,
        side1Area: function () { return this.width * this.depth },
        side2Area: function () { return this.height * this.depth },
        volume: function () { return this.baseArea * this.depth },
        surfaceArea: function () { return 2.0 * this.baseArea + 2.0 * this.side1Area + 2.0 * this.side2Area },
    };

    var blockShapeSpec = {
        //myType: 'blockShape',
        context: '',
        height: 150,
        width: 250,
        Area: function () { return this.width * this.height },
    };

    beforeEach(function () {
    });



    it("do simple type checking", function () {
        var block = fo.new(blockSpec);
        expect(block.isType('block')).toBe(true);
        expect(block.isOfType('block')).toBe(true);

    });

    it("verify the custom types", function () {

        var type = fo.getNamespaceKey(namespace, 'blockxx');
        var spec = fo.establishType(type, {
            height: 10,
            width: 20,
            Area: function () { return this.width * this.height },
        });

        var block = fo.new(spec);
        expect(block.isType(fo.getNamespaceKey(namespace, 'blockxx'))).toBe(true);
        expect(block.isOfType('blockxx')).toBe(true);

    });
});