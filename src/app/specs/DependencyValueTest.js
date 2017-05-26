/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />


describe("Foundry: Dependency Value", function () {
    var block;


    beforeEach(function () {
        var blockSpec = {
            A: 3,
            B: 2,
            C: function () { return this.A * this.B },
            D: function () { return this.A + this.B },
            E: function () { return this.D - this.C },
        };
        block = fo.makeComponent(blockSpec);
    });

    it("should have valid defaults", function () {
        expect(fo.utils.isaComponent(block)).toBe(true);
    });

    it("should have vaid properties (Direct Reference)", function () {
        expect(fo.utils.isaProperty(block._A)).toBe(true);
        expect(fo.utils.isaProperty(block._B)).toBe(true);
        expect(fo.utils.isaProperty(block._C)).toBe(true);
        expect(fo.utils.isaProperty(block._D)).toBe(true);
        expect(fo.utils.isaProperty(block._E)).toBe(true);
    });

    it("should have valid default values", function () {
        expect(block.A).toEqual(3);
        expect(block.B).toEqual(2);
        expect(block.C).toEqual(6);
        expect(block.D).toEqual(5);
        expect(block.E).toEqual(-1);
    });

    it("should have recompute", function () {
        expect(block.A).toEqual(3);
        block.A = 2;
        expect(block.E).toEqual(0);
    });

    it("should have track dependencies", function () {
        expect(block.E).toEqual(-1);
        expect(block._A.thisInformsTheseValues.length).toBe(2);
        expect(block._E.thisValueDependsOn.length).toBe(2);

        block.A = 2;
        expect(block._A.thisInformsTheseValues.length).toBe(0);
        expect(block._E.thisValueDependsOn.length).toBe(0);

        block.E;
        expect(block._A.thisInformsTheseValues.length).toBe(2);
        expect(block._E.thisValueDependsOn.length).toBe(2);
    });

    it("should have track and allow for overrides", function () {
        expect(block.E).toEqual(-1);
        expect(block._A.thisInformsTheseValues.length).toBe(2);
        expect(block._D.thisInformsTheseValues.length).toBe(1);
        expect(block._D.thisValueDependsOn.length).toBe(2);
        expect(block._E.thisValueDependsOn.length).toBe(2);

        block.D = 7;
        expect(block._A.thisInformsTheseValues.length).toBe(1);
        expect(block._E.thisValueDependsOn.length).toBe(1);
        expect(block._D.thisValueDependsOn.length).toBe(0);

        block.E;
        expect(block._A.thisInformsTheseValues.length).toBe(1);
        expect(block._D.thisInformsTheseValues.length).toBe(1);
        expect(block._D.thisValueDependsOn.length).toBe(0);
        expect(block._E.thisValueDependsOn.length).toBe(2);
        expect(block.E).toEqual(1);
    });

    it("should have track and allow overrides to smash", function () {
        expect(block.E).toEqual(-1);

        block.D = 7;
        expect(block._A.thisInformsTheseValues.length).toBe(1);
        expect(block._E.thisValueDependsOn.length).toBe(1);
        expect(block._D.thisValueDependsOn.length).toBe(0);

        block.E;
        expect(block._A.thisInformsTheseValues.length).toBe(1);
        expect(block._D.thisInformsTheseValues.length).toBe(1);
        expect(block._D.thisValueDependsOn.length).toBe(0);
        expect(block._E.thisValueDependsOn.length).toBe(2);
        expect(block.E).toEqual(1);

        block._D.smash();
        expect(block._A.thisInformsTheseValues.length).toBe(1);
        expect(block._D.thisValueDependsOn.length).toBe(0);
        expect(block._D.thisInformsTheseValues.length).toBe(0);
        expect(block._E.thisValueDependsOn.length).toBe(1);


        block.E;
        expect(block._D.thisInformsTheseValues.length).toBe(1);
        expect(block._D.thisValueDependsOn.length).toBe(2);
        expect(block._E.thisValueDependsOn.length).toBe(2);
        expect(block.E).toEqual(-1);
    });
});