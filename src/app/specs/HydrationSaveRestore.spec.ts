
import { Tools } from '../foundry/foTools'
import { foLibrary } from "../foundry/foLibrary.model";
import { foStencilLibrary } from "../foundry/foStencil";

import { foComponent } from '../foundry/foComponent.model'
import { foShape3D } from '../foundry/solids/foShape3D.model'
import { foInputText2D } from '../foundry/shapes/foText2D.model'

import { foFileManager } from '../foundry/foFileManager'

describe("Foundry: Hydration Save Restore", function () {
    let block: foComponent | any;
    let shape: foShape3D | any;
    let text: foInputText2D | any;

    let block1: foComponent | any;
    let shape1: foShape3D | any;
    let text1: foInputText2D | any;

    let specBlock = {
        height: 1,
        width: 2,
        baseArea: function () { return this.width * this.height },
        depth: 3,
        side1Area: function () { return this.width * this.depth },
        side2Area: function () { return this.height * this.depth },
        volume: function () { return this.baseArea * this.depth },
        surfaceArea: function () { return 2.0 * this.baseArea + 2.0 * this.side1Area + 2.0 * this.side2Area },
    };

    let specText = {
        text: 'Understand DevSecOps',
        fontSize: 30,
        moreDate: 50,
    }

    let specShape = {
        width: 100,
        height: 400,
        text: 'Hello World'
    }

    function justKeys(spec) {
        let keys: string[] = Tools.extractReadWriteKeys(spec);
        return keys;
    }

    let lKnowledge: foLibrary = new foLibrary().defaultName('definitions');
    let lShapes: foStencilLibrary = new foStencilLibrary().defaultName('shapes');
    let lSolids: foStencilLibrary = new foStencilLibrary().defaultName('solids');

    let cBlock = lKnowledge.concepts.define('Block', foComponent, specBlock);
    let cText = lShapes.define('Text', foInputText2D, specText);
    let cBox = lSolids.define('Box', foShape3D, specShape);

    beforeEach(() => {
        block = new foComponent(specBlock);
        shape = new foShape3D(specShape);
        text = new foInputText2D(specShape);

        block1 = cBlock.makeComponent()
        shape1 = cBox.makeComponent()
        text1 = cText.makeComponent()
    });

    it("should be able to use create copy", () => {
        //this works but on copy computed values end up static
        let copy = block1.createCopy();

        expect(block1.myGuid).not.toEqual(copy.myGuid);
        expect(block1.width).toEqual(copy.width);
    });

    it("should save and restore a block", (done) => {
        let ext = '.json'
        let fileName = 'test1'

        let manager = new foFileManager(true)
        let source = block1.createdFrom();
        let body = block1.deHydrate();


        expect(block.width).toEqual(body.width);

        manager.writeTextAsBlob(JSON.stringify(body), fileName, ext, () => {
            manager.readTextAsBlob(fileName, ext, item => {
                let result = JSON.parse(item);
                let block2 = source.makeComponent(undefined, result);
                expect(block2.width).toEqual(block.width);

                block2.width = 3;
                expect(block2.baseArea).toEqual(1 * 3);
                expect(block2.volume).toEqual(1 * 3 * 3);

                done()
            })
        });

    });

    it("should do integretyTest for block", (done) => {

        let manager = new foFileManager(true);
        manager.integretyTest(block1, true, block2 => {
            expect(block2.width).toEqual(block.width);

            block2.width = 3;
            expect(block2.baseArea).toEqual(1 * 3);
            expect(block2.volume).toEqual(1 * 3 * 3);

            done()
        })
    });

    it("should be equal to copy shape", () => {
        let copy = shape.createCopy(justKeys(specShape));
        let result = shape.isEqualTo(copy);

        expect(result).toEqual(true);
    });

    it("should be equal to copy shape1", () => {
        let copy = shape1.createCopy();
        let result = shape1.isEqualTo(copy);

        expect(result).toEqual(true);
    });


    it("should be equal to copy text", () => {
        let copy = text.createCopy();
        let result = text.isEqualTo(copy);

        expect(result).toEqual(true);
    });

    it("should be equal to copy text1", () => {
        let copy = text1.createCopy();
        let result = text1.isEqualTo(copy);

        expect(result).toEqual(true);
    });



});