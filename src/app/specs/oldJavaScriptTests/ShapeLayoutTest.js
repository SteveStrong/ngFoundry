/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />
/// 
/// <reference path="../Apprentice/easeljs-0.7.0.min.js" />
/// <reference path="../tweenjs/Tween.js" />
/// 
/// <reference path="../Foundry/Foundry.canvas.js" />
///<reference path="../Foundry/Foundry.canvas.structure.js" />
/// <reference path="../Foundry/Foundry.canvas.page2D.js" />
/// <reference path="../Foundry/Foundry.canvas.shape2D.js" />
/// <reference path="../Foundry/Foundry.canvas.document.js" />
/// <reference path="../Foundry/Foundry.canvas.panzoom.js" />



describe("Foundry: Shape Layout", function () {
    var page;
    var canvas;

    beforeEach(function () {

        var canvas = document.getElementById('mainCanvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
        }

        page = fo.newInstance('Page', {
            canvasElement: canvas,
        });

    });

    it("a Page2D should be a Component", function () {
        expect(fo.utils.isaComponent(page)).toBe(true);
        expect(fo.utils.isaFoundryShape(page)).toBe(true);

        expect(page.Properties.isEmpty()).toBe(false);
        expect(page.Subcomponents.isEmpty()).toBe(true);
        page.update;
    });

    it("should compute raw values", function () {
        var properties = { pinX: 100, pinY: function () { return this.pinX - 10; } };
        var shape = new fo.canvas.Shape2D(properties);
        expect(shape.pinX).toBe(100);
        expect(shape.pinY).toBe(90);

        page.capture(shape);

        expect(shape.myParent).toBe(page);
        expect(shape.pinX).toBe(100);
        expect(shape.pinY).toBe(90);
    });

    it("should capture shape as a subcomponent", function () {
        var shape = fo.newInstance('Shape2D', { pinX: 100, pinY: function () { return this.pinX - 10; } });
        expect(shape._geom.value).toBeUndefined();
        expect(shape._update.value).toBeUndefined();

        page.capture(shape);
        expect(shape._update.value).toBeDefined();
        expect(shape._geom.value).toBeDefined();

        expect(shape.myParent).toBe(page);
        expect(shape.pinX).toBe(100);
        expect(shape.pinY).toBe(90);


    });

    it("should compute shape and group depth and properties", function () {
        var shape = fo.newInstance('Shape2D', { pinX: 100, pinY: function () { return this.pinX - 10; } });
        //capture will force recompute of note layout so 
        //expect these values to be correct
        page.capture(shape);
        expect(shape._update.value).toBe(true);


        expect(page.shapeDepth).toBe(0);
        expect(shape.shapeDepth).toBe(1);

        expect(page.groupDepth).toBe(1);
        expect(shape.groupDepth).toBe(0);

        //this should be false, but for now nobody cares..
        //expect(page.inGroup).toBe(false);

        expect(shape.inGroup).toBe(false);

    });

    it("should compute test for default sized on Shape2D", function () {
        var parentShape = fo.newInstance('Shape2D', { pinX: 100, pinY: function () { return this.pinX - 10; } });
        page.capture(parentShape);

        expect(parentShape.width).toBe(parentShape.minWidth);
        expect(parentShape.height).toBe(parentShape.minHeight);
        expect(parentShape.segWidth).toBe(parentShape.width);


        var childShape = fo.newInstance('Shape2D', { pinX: 100, pinY: function () { return this.pinX - 10; } });
        parentShape.capture(childShape);
        expect(parentShape.Subcomponents.count).toBe(1);
        expect(parentShape.groupDepth).toBe(1);
        expect(parentShape.shapeDepth).toBe(1);

        expect(childShape.width).toBe(childShape.minWidth);
        expect(childShape.height).toBe(Foundry.canvas.minNoteSize);
        expect(childShape.groupDepth).toBe(0); //this means I am at the bottom of the list
        expect(childShape.shapeDepth).toBe(2); //this means I am 2 deep, page=0, parent=1; me=2

        expect(parentShape.segWidth).toBeGreaterThan(parentShape.minWidth);

        expect(parentShape.width).toBeGreaterThan(parentShape.minWidth);
        expect(parentShape.height).toBe(Foundry.canvas.minNoteSize);

    });


    it("should let shapes capture shapes", function () {
        var icount = 0;
        var someNames = ['Steve', 'Stu', 'Don'];

        function newShape() {
            var shape = fo.canvas.makeShape2D({ pinX: 100, pinY: 50, name: someNames[icount] });
            icount++;
            return shape;
        };

        var steve = newShape();
        var stu = newShape();
        var don = newShape();

        expect(steve.context).toBeUndefined();
        expect(stu.context).toBeUndefined();
        expect(don.context).toBeUndefined();

        expect(steve.width).toBe(Foundry.canvas.standardNoteSize);
        expect(stu.width).toBe(steve.width);
        expect(don.width).toBe(stu.width);


        expect(steve.height).toBe(Foundry.canvas.minNoteSize);
        expect(steve.height).toBe(stu.height);
        expect(stu.height).toBe(don.height);

        page.capture(steve);
        steve.capture(stu);
        stu.capture(don);

        page.forceLayout();

        expect(steve.width).toBeGreaterThan(Foundry.canvas.standardNoteSize);
        expect(steve.width).toBeGreaterThan(stu.width);
        expect(stu.width).toBeGreaterThan(don.width);
        expect(don.width).toBe(Foundry.canvas.standardNoteSize);




    });

});


