/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />
/// <reference path="../Foundry/Foundry.adaptor.js" />

describe("Foundry: Establish instance from type", function () {

    var specName = 'EX::block';

    fo.establishType(specName, {
        height: 1,
        width: 2,
        baseArea: function () { return this.width * this.height },
        depth: 3,
        side1Area: function () { return this.width * this.depth },
        side2Area: function () { return this.height * this.depth },
        volume: function () { return this.baseArea * this.depth },
        surfaceArea: function () { return 2.0 * this.baseArea + 2.0 * this.side1Area + 2.0 * this.side2Area },
    });

    //fo.exportTypes();

    beforeEach(function () {
        
    });



    it("type factory should be created", function () {
        expect(fo.EX).toBeDefined();

        expect(fo.EX.newBlock).toBeDefined();
        expect(fo.EX.newBlockExtract).toBeDefined();
        expect(fo.EX.newBlockEstablish).toBeDefined();

    });


    it("establish an instance ", function () {
        expect(fo.EX).toBeDefined();

        var spec1 = {
            id: '123',
            height: 10,
            width: 20,
        }

        function getId(item) {
            return item.id;
        }
        var dictionary = {};

        var result1 = fo.EX.newBlockEstablish(spec1, getId, dictionary);

        expect(result1).toBeDefined();
        expect(result1.myName).toBe(spec1.id);
        expect(result1.id).toBeUndefined();
        expect(result1.volume).toBe(600);

        expect(dictionary['123']).toBe(result1);
        expect(result1.myName).toBe(spec1.id);


        var spec2 = {
            id: '123',
            height: 100,
            width: 200,
        }

        var result2 = fo.EX.newBlockEstablish(spec2, getId, dictionary);

        expect(result2).toBeDefined();
        expect(result2).toBe(result1);
        expect(result2.id).toBeUndefined();

        expect(result2.myName).toBe(result1.myName);
        expect(result2.volume).toBe(60000);

        expect(dictionary['123']).toBe(result1);
        expect(dictionary['123']).toBe(result2);

    });


    it("establish an instance  use build in dictionary", function () {
        expect(fo.EX).toBeDefined();

        var spec1 = {
            id: '123',
            height: 10,
            width: 20,
        }

        var spec2 = {
            id: '123',
            height: 100,
            width: 200,
        }

        function getId(item) {
            return item.id;
        }

        var result1 = fo.EX.newBlockEstablish(spec1, getId);
        expect(result1.volume).toBe(600);

        var result2 = fo.EX.newBlockEstablish(spec2, getId);
        expect(result2.volume).toBe(60000);

        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
        expect(result1).toBe(result1);
        expect(result2).toBe(result2);

        expect(result2).toBe(result1);

        expect(result1.volume).toBe(60000);

        var dict = fo.getDictionary(specName);
        expect(result1).toBe(dict['123']);
        expect(result2).toBe(dict['123']);

    });

});