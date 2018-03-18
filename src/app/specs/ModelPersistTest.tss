/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />


/// <reference path="../Apprentice/easeljs-0.7.0.min.js" />
/// <reference path="../tweenjs/Tween.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />
/// <reference path="../Foundry/Foundry.adaptor.js" />
/// <reference path="../Foundry/Foundry.canvas.js" />
/// <reference path="../Foundry/Foundry.canvas.structure.js" />
/// <reference path="../Foundry/Foundry.canvas.page2D.js" />
/// <reference path="../Foundry/Foundry.canvas.shape2D.js" />
/// <reference path="../Foundry/Foundry.canvas.document.js" />
/// <reference path="../Foundry/Foundry.canvas.panzoom.js" />
/// <reference path="../Foundry/Foundry.workspace.core.js" />


describe("Foundry: Model Persist", function () {

    var namespace = 'ModelPersist';

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
        //should through an exception because we change with is registered
        try {
            fo.registerSpec(blockShapeSpec, fo.makeComponent);
        }
        catch (ex) { }

        //fo.registarSpec(namespace, blockShapeSpec.myType, blockShapeSpec);

        //function makeBlockShape(spec, subcomponents, parent) {
        //    var result = fo.makeComponent(spec, subcomponents, parent);
        //    return result;
        //}

    });

    it("should a simple constructor", function () {
        var block = fo.new(blockSpec);
        expect(block.height).toEqual(1);
        expect(block.width).toEqual(2);
        expect(block.depth).toEqual(3);
        expect(block.volume).toEqual(3 * 2 * 1);
    });

    it("should be able to do a  simple new with custom constructor", function () {

        fo.establishSpec(blockShapeSpec, function (properties, subcomponents, parent) {
            var customSpec = fo.utils.union(properties, { Extra: 'XXX' });
            return fo.makeComponent(customSpec, subcomponents, parent);
        });

        var block = fo.new(blockShapeSpec);

        expect(block.height).toEqual(150);
        expect(block.width).toEqual(250);
        expect(block.Area).toEqual(250 * 150);
        expect(block.Extra).toEqual('XXX');

    });

    it("should reg spec and create newInstance", function () {
        var specA = {
            planet: 'World',
            greeting: function () { return 'Hello: ' + this.planet; }
        }
        fo.defineType('specA', specA);

        var item = fo.newInstance('specA');
        
        expect(item.greeting).toEqual('Hello: World');
    });

    it("should be able to defineType then call new", function () {

        var spec = fo.defineType('xx', blockSpec);

        var block = fo.new(spec);
        expect(block.height).toEqual(1);
        expect(block.width).toEqual(2);
        expect(block.depth).toEqual(3);
        expect(block.volume).toEqual(3 * 2 * 1);
    });

    it("should be able to newInstance from ref spec", function () {

        fo.defineType('AnyNameSpec', blockSpec);

        var block = fo.newInstance('AnyNameSpec');
        expect(block.height).toEqual(1);
        expect(block.width).toEqual(2);
        expect(block.depth).toEqual(3);
        expect(block.volume).toEqual(3 * 2 * 1);
    });


    it("should be able to extract spec from instance", function () {

        var blockSpec = {
            height: 10,
            width: 20,
            Area: function () { return this.width * this.height },
        };

        var type = fo.getNamespaceKey(namespace, 'steve');

        fo.defineType(type, blockSpec);

        var block = fo.newInstance(type);
        expect(block.Area).toEqual(200);

        block.height = 20;
        expect(block.Area).toEqual(400);
        

        var spec = block.getSpec();
        expect(spec.height).toEqual(20);
        expect(spec.Area).toBeUndefined();

        var block1 = fo.new(spec);

        expect(block1.height).toEqual(block.height);
        expect(block1.width).toEqual(block.width);
        expect(block1.Area).toBeUndefined(); // new does not union with existing spec


        var block2 = fo.make(spec);
        expect(block2.height).toEqual(block.height);
        expect(block2.width).toEqual(block.width);
        expect(block2.Area).toEqual(block.Area); // makeFromSpec does union with existing spec


    });


    it("should be able to simplify duplicate using make", function () {

        var type = fo.getNamespaceKey(namespace, 'block');

        var blockSpec = fo.defineType(type, {
            height: 10,
            width: 20,
            Area: function () { return this.width * this.height },
        });

        expect(blockSpec).toBeDefined();

        var b1 = fo.new(blockSpec);
        b1.width = b1.height;

        var dupeSpec = b1.getSpec();
        expect(dupeSpec.Area).toBeUndefined(); // new does not union with existing spec

        var b2 = fo.make(dupeSpec);

        expect(b2.height).toEqual(b1.height);
        expect(b2.width).toEqual(b1.width);
        expect(b2.Area).toEqual(b1.Area); // makeFromSpec does union with existing spec


    });


    it("should be able to simplify duplicate with  make and empty namespace", function () {

        var blockSpec = fo.establishType('block', {
            height: 10,
            width: 20,
            Area: function () { return this.width * this.height },
        });

        expect(blockSpec).toBeDefined();

        var b1 = fo.make(blockSpec);
        b1.width = b1.height;

        var dupeSpec = b1.getSpec();
        expect(dupeSpec.Area).toBeUndefined(); // new does not union with existing spec

        var b2 = fo.make(dupeSpec);

        expect(b2.height).toEqual(b1.height);
        expect(b2.width).toEqual(b1.width);
        expect(b2.Area).toEqual(b1.Area); // makeFromSpec does union with existing spec

        var b3 = fo.make(b2.getSpec());
        expect(b2.height).toEqual(b3.height);
        expect(b2.width).toEqual(b3.width);
        expect(b2.Area).toEqual(b3.Area); // makeFromSpec does union with existing spec

    });

    
    it("should be able to create a workspace", function () {
        var space = fo.ws.makeModelWorkspace('steve')
        expect(space).toBeDefined();
        expect(space.rootModel).toBeDefined();
    })

    it("should be able to simplify duplicate shape and model", function () {

        var namespace = 'zoo';
        var animalSpec = fo.defineType('animal', {
            headerText: '',
            noteText: '',
            noteUri: function () {
                return "http://a-z-animals.com/animals/" + this.headerText
            },
        });

        expect(animalSpec).toBeDefined();

        var canvas = document.getElementById('mainCanvas');
        var pip = document.getElementById('PIP');
        var pz = document.getElementById('panZoomCanvas');

        if (!canvas) {
            canvas = document.createElement('canvas');
            document.body.appendChild(canvas);

            pip = document.createElement('div');
            document.body.appendChild(pip);

            pz = document.createElement('canvas');
            pip.appendChild(pz);
        }



        var space = fo.ws.makeNoteWorkspace('steve', {
            canvasId: canvas,
            panZoomCanvasId: pz,
            pipId: pip,
        });

        var rootModel = space.rootModel;
        var rootPage = space.rootPage;

        expect(space).toBeDefined();
        expect(space.rootModel).toBeDefined();
        expect(space.rootPage).toBeDefined();

        var header = 'hello world';
        var note = fo.makeInstance(animalSpec, { headerText: header });
        rootModel.captureSubcomponent(note, fo.utils.generateUUID());

        var shape = fo.construct('Shape2D', { context: note });
        rootPage.captureSubcomponent(shape, note.name);


    });


    it("should help with dehydrate and rehydrate", function () {

        var blockSpec = fo.establishType('block', {
            height: 10,
            width: 20,
            Area: function () { return this.width * this.height },
        });

        expect(blockSpec).toBeDefined();

        var m1 = fo.makeComponent();

        var b1 = fo.make(blockSpec);
        m1.captureSubcomponent(b1, 'steve');

        b1.width = b1.height;

        var payload = b1.dehydrate();

        var m1a = fo.makeComponent();
        var b1a = fo.make(payload, m1a);

        expect(b1a.name).toEqual(b1.name);
        expect(b1a.height).toEqual(b1.height);
        expect(b1a.width).toEqual(b1.width);
        expect(b1a.Area).toEqual(b1.Area); // makeFromSpec does union with existing spec


        var m2 = fo.makeComponent();
        m2.rehydrate(m2, [payload], {});

        var b2 = m2.getSubcomponent('steve');

        expect(b2.height).toEqual(b1.height);
        expect(b2.width).toEqual(b1.width);
        expect(b2.Area).toEqual(b1.Area); // makeFromSpec does union with existing spec


    });
 
});