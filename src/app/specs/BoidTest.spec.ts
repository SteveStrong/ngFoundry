
import { Tools } from '../foundry/foTools'
import { Boid, boidBehaviour, globalBoidList } from '../canvas/boid.model'
import { cPoint2D } from '../foundry/shapes/foGeometry2D';

describe("Boid", function () {


    beforeEach(function() {
        globalBoidList.clearAll()
    });

    it("should be able to sum points", function() {
        let result = new cPoint2D();

        let pt1 = new cPoint2D(50,50);
        let pt2 = new cPoint2D(50,50);
        pt1.sumTo(result)
        pt1.sumTo(result)



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