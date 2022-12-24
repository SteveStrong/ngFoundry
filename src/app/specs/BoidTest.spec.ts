
import { Tools } from '../foundry/foTools'
import { Boid, boidMixin, boidBehaviour, globalBoidList } from '../canvas/boid.model'
import { cPoint2D } from '../foundry/shapes/foGeometry2D';

describe("Boid", function () {

    function makeBoid(p:cPoint2D, v:cPoint2D){
        let result = new boidMixin();
        result.p = p;
        result.v = v;
        globalBoidList.addMember(result);
        return result;
    }

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
        let answer = pt2.deltaBetween(result)


        expect(answer.x).toEqual(0);
        expect(answer.y).toEqual(0);
        
    });

    it("should be able create boid mixin", function() {
        let result = makeBoid(new cPoint2D(50,55), new cPoint2D(10,5));

        expect(globalBoidList.length).toEqual(1);
        result.doAnimation();


        expect(result.p.x).toEqual(60);
        expect(result.p.y).toEqual(60);

        expect(result.v.x).toEqual(10);
        expect(result.v.y).toEqual(5);
        
    });

    it("should be able validate rule1", function() {
        let b1 = makeBoid(new cPoint2D(50,50), new cPoint2D(10,10));
        let b2 = makeBoid(new cPoint2D(150,150), new cPoint2D(10,10));

        expect(globalBoidList.length).toEqual(2);

        //let answer = new cPoint2D();
        let pt1 = new cPoint2D(50,50);
        let pt2 = new cPoint2D(150,150);
        let answer = pt2.deltaBetween(pt1);
        answer.scale(0.01);

        expect(answer.x).toEqual(1);
        expect(answer.y).toEqual(1);
        
        let result = boidBehaviour.rule1(b1);
        expect(result.x).toEqual(60);
        expect(result.y).toEqual(60);


        result = boidBehaviour.rule1(b2);
        expect(result.x).toEqual(70);
        expect(result.y).toEqual(70);

        //b1.doAnimation();
        //b2.doAnimation();



        
    });

});