
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
        fontSize:30,
        moreDate: 50,
    }

    let specShape = {
        width: 100,
        height: 400,
        text: 'Hello World'
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

    it("should save and restore a block", () => {
        let manager = new foFileManager()
        let copy = block1.dehi();
  
        expect(block1.myGuid).not.toEqual(copy.myGuid);
        expect(block.width).toEqual(copy.width);
    });









});