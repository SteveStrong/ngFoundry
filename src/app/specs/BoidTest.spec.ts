
import { Tools } from '../foundry/foTools'
import { Boid, boidMixin, boidBehaviour, globalBoidList } from '../canvas/boid.model'
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
        pt2.sumTo(result)



        expect(result.x).toEqual(100);
        expect(result.y).toEqual(100);

        let copy = result.clone();
        expect(result.isEqualTo(copy)).toBeTruthy();
        
        expect(result.isNear(pt1, 60)).toBeTruthy();
        expect(pt1.isNear(pt2, 3)).toBeTruthy();
        
    });

    it("should be able to ave points", function() {
        let result = new cPoint2D();

        let pt1 = new cPoint2D(50,50);
        for(let i=0; i< 10; i++){
            pt1.sumTo(result)
        }
        result.scale(1/10);

        expect(result.x).toEqual(50);
        expect(result.y).toEqual(50);
        
    });

    it("should be able to subtract points", function() {
        let result = new cPoint2D();

        let pt1 = new cPoint2D(50,50);
        let pt2 = new cPoint2D(50,50);
        pt1.sumTo(result)
        pt2.subtractTo(result)


        expect(result.x).toEqual(0);
        expect(result.y).toEqual(0);
        
    });

    it("should be able create boid mixin", function() {
        let result = new boidMixin();

        result.p = new cPoint2D(50,55);
        result.v = new cPoint2D(10,5);

        result.doAnimation();


        expect(result.p.x).toEqual(60);
        expect(result.p.y).toEqual(60);

        expect(result.v.x).toEqual(10);
        expect(result.v.y).toEqual(5);
        
    });

});