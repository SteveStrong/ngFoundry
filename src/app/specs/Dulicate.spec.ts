
import { Tools } from '../foundry/foTools'
import { foComponent } from '../foundry/foComponent.model'
import { foShape2D } from '../foundry/shapes/foShape2D.model'
import { foText2D, foInputText2D } from '../foundry/shapes/foText2D.model'


describe("Foundry: Duplicate", function () {
    let block: foComponent | any;
    let shape: foShape2D | any;
    let text: foInputText2D | any;

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

    beforeEach(function() {
        block = new foComponent(specBlock);
        shape = new foShape2D(specShape);
        text = new foInputText2D(specShape);
    });

    it("should work correctly", function() {
        expect(block.height).toEqual(1);
        expect(block.width).toEqual(2);
        expect(block.depth).toEqual(3);
        expect(block.volume).toEqual(1 * 2 * 3);
    });

    it("should compute the right volume", function () {

    });



});