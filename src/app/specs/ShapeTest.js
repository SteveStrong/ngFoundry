/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />
/// 
/// <reference path="../Apprentice/easeljs-0.7.0.min.js" />
/// <reference path="../tweenjs/Tween.js" />
/// 
/// <reference path="../Foundry/Foundry.canvas.js" />
/// <reference path="../Foundry/Foundry.canvas.structure.js" />
/// <reference path="../Foundry/Foundry.canvas.page2D.js" />
/// <reference path="../Foundry/Foundry.canvas.shape2D.js" />
/// 



describe("Foundry: Page2DCanvas", function () {
    var obj;

    beforeEach(function () {
        obj = fo.canvas.makePage2D();
        return obj;
    });

    it("should be a Component", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);
        expect(fo.utils.isaFoundryShape(obj)).toBe(true);

        expect(obj.Properties.isEmpty()).toBe(false);
        expect(obj.Subcomponents.isEmpty()).toBe(true);
    });

    it("should be a 2DCanvas", function () {
        expect(fo.utils.isa2DCanvas(obj)).toBe(true);
    });

});

describe("Foundry: FoundryShape", function () {
    var obj;

    beforeEach(function () {
        obj = fo.canvas.makeShape();
        return obj;
    });

    it("should be a Component", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        expect(obj.Properties.isEmpty()).toBe(false);
        expect(obj.Subcomponents.isEmpty()).toBe(true);
    });

    it("should be a FoundryShape", function () {
        expect(fo.utils.isaFoundryShape(obj)).toBe(true);
    });

});

describe("Foundry: Shape2D", function () {
    var obj;

    beforeEach(function () {
        obj = fo.canvas.makeShape2D();
        return obj;
    });

    it("should be a Component", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);
        expect(fo.utils.isaFoundryShape(obj)).toBe(true);

        expect(obj.Properties.isEmpty()).toBe(false);
        expect(obj.Subcomponents.isEmpty()).toBe(true);
    });

    it("should be a Shape", function () {
        expect(fo.utils.isaShape(obj)).toBe(true);
    });

    it("should have Shape properties", function () {
        expect(obj.pinX).toBeDefined();
        expect(obj.pinY).toBeDefined();
        expect(obj.angle).toBeDefined();
    });

    it("should be a Shape2D", function () {
        expect(fo.utils.isaShape2D(obj)).toBe(true);
    });

    it("should have Shape2D properties", function () {
        expect(obj.height).toBeDefined();
        expect(obj.width).toBeDefined();
        expect(obj.locX).toBeDefined();
        expect(obj.locY).toBeDefined();
        expect(obj.angleInRads).toBeDefined();
    });



});