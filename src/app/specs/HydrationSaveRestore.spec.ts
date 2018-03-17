
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

    let specShape = {
        width: 100,
        height: 400,
        text: 'Hello World'
    }

    let lKnowledge: foLibrary = new foLibrary().defaultName('definitions');
    let lShapes: foStencilLibrary = new foStencilLibrary().defaultName('shapes');
    let lSolids: foStencilLibrary = new foStencilLibrary().defaultName('solids');

    let cBlock = lKnowledge.define<foComponent>('Block', foComponent, specBlock);

    let cText = lShapes.define<foInputText2D>('Text', foInputText2D, {
        text: 'Understand DevSecOps',
        fontSize:30,
        moreDate: 50,
      });

      let cBox = lSolids.define<foShape3D>('Box', foShape3D, {
        text: 'Understand DevSecOps',
        fontSize:30,
        moreDate: 50,
      });

    beforeEach(() => {
        block = new foComponent(specBlock);
        shape = new foShape3D(specShape);
        text = new foInputText2D(specShape);

        block1 = cBlock.makeComponent()
        shape1 = cBox.makeComponent()
        text1 = cText.makeComponent()
    });



    it("should save and restore a block", () => {
        //this works but on copy computed values end up static
        let copy = block.createCopy(Object.keys(specBlock));

        
        expect(block.myGuid).not.toEqual(copy.myGuid);
        expect(block.width).toEqual(specBlock.width);
        expect(block.width).toEqual(copy.width);
    });









});