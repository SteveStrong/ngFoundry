/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />
/// <reference path="../Foundry/Foundry.adaptor.js" />

describe("Foundry: Adaptor Block", function () {
     var block;

    var blockSpec = {
        height: 1,
        width: 2,
        baseArea: function () { return this.width * this.height },
        depth: 3,
        side1Area: function () { return this.width * this.depth },
        side2Area: function () { return this.height * this.depth },
        volume: function () { return this.baseArea * this.depth },
        surfaceArea: function () { return 2.0 * this.baseArea + 2.0 * this.side1Area + 2.0 * this.side2Area },
    };

    beforeEach(function() {
        block = fo.makeAdaptor(blockSpec);
    });

    it("should should have the right sided base", function() {
        expect(block.height).toEqual(1);
        expect(block.width).toEqual(2);
        expect(block.depth).toEqual(3);
    });

    it("should compute the right volume", function () {
        var height = 1;
        var width = 2;
        var depth = 3;

        expect(block.baseArea).toEqual(height * width);
        expect(block.side1Area).toEqual(width * depth);
        expect(block.side2Area).toEqual(height * depth);
    });

    it("should compute the right surfaceArea", function () {
        expect(block.volume).toEqual(1 * 2 * 3);
    });

    it("should recompute when the values change", function () {
        var height = 10;
        var width = 2;
        var depth = 3;

        block.height = height;
        expect(block.volume).toEqual(height * width * depth);
        expect(block.baseArea).toEqual(height * width);
        expect(block.side1Area).toEqual(width * depth);
        expect(block.side2Area).toEqual(height * depth);


        height = 5;
        block.height = height;
        expect(block.volume).toEqual(height * width * depth);
        expect(block.baseArea).toEqual(height * width);
        expect(block.side1Area).toEqual(width * depth);
        expect(block.side2Area).toEqual(height * depth);

        //fo.trace.reportDependencyNetwork(block);

    });

});