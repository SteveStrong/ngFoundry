import { TestBed, async } from '@angular/core/testing';

import { foPage } from '../foundry/shapes/foPage.model';
import { foShape2D } from '../foundry/shapes/foShape2D.model';
import { globalUnDo } from '../foundry/foUnDo';
import { foComponent } from '../foundry/foComponent.model';

import * as moment from 'moment';

describe("Do UnDo: Shapes", function () {
    let root:foPage;
    let buffer:foComponent;

    beforeEach(function () {

        root = new foPage();
        let list = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
        var i = 0;

        list.forEach(function (item) {
            var hour = i; i++;
            var time = moment();

            var comp = new foShape2D({
                name: item,
                number: hour,
                hour: time.add('h', hour),
            });

            root.addSubcomponent(comp);
        });

        //inprovement in keeping geoms around now require we use a shape
        //but is should be ok if it does not have a stage..
        //buffer = new foPage();

        //this shows that a 'generic' component can be a place to store a shape
        //no harm in not requiring a root page...
        buffer = new foComponent();


        function beforeReparent(payload) {
            var newParent = payload.newParent;
            var child = payload.child;

            //now do the parenting
            var oldParent = newParent.captureSubcomponent(child);

            payload.oldParent = oldParent;

            return payload;
        }
        function undoReparent(payload) {
            //now do the reparenting based on the payload

            var oldParent = payload.oldParent;
            var child = payload.child;
            //var index = payload.index;
            oldParent.captureSubcomponent(child);

            return payload;
        }

        globalUnDo.clear();
        globalUnDo.registerActions('Reparent', beforeReparent, undoReparent);

    });


    it("should be able first verify the model", function () {
        expect(root).toBeDefined();
        expect(root.nodes.count).toBe(11);

        expect(buffer).toBeDefined();
        expect(buffer.nodes.count).toBe(0);

        var item = root.nodes.getChildAt(3);
        expect(item['name']).toBe('three');
        expect(item.myParent()).toBe(root);

        buffer.captureSubcomponent(item);

        expect(root.nodes.length).toBe(10);
        expect(item.myParent()).toBe(buffer);

        expect(buffer.nodes.length).toBe(1);
    });


    it("should be able undo reparenting", function () {

        expect(root).toBeDefined();
        expect(root.nodes.count).toBe(11);
        expect(buffer).toBeDefined();
        expect(buffer.nodes.count).toBe(0);

        var item = root.nodes.getChildAt(3);
        var payload = { newParent: buffer, child: item, index: item.index };

        var undo = globalUnDo.do('Reparent', payload);

        expect(item.myParent()).toBe(buffer);
        expect(root.nodes.count).toBe(10);

        globalUnDo.unDo(undo);

        expect(item.myParent()).toBe(root);
        expect(root.nodes.count).toBe(11);
        expect(buffer.nodes.count).toBe(0);
    });


    // it("should return child to the original result", function () {

    //     expect(root).toBeDefined();
    //     expect(root.nodes.count).toBe(11);
    //     expect(buffer).toBeDefined();
    //     expect(buffer.nodes.count).toBe(0);

    //     var item = root.nodes.getChildAt(3);
    //     var payload = { newParent: buffer, child: item, index: item.index };

    //     var undo = globalUnDo.do('Reparent', payload);

    //     expect(item.myParent()).toBe(buffer);
    //     expect(root.nodes.count).toBe(10);

    //     globalUnDo.unDo(undo);

    //     expect(item.myParent()).toBe(root);
    //     expect(root.nodes.count).toBe(11);
    //     expect(buffer.nodes.count).toBe(0);

    //     //only because the reparent handler forces this..
    //     var sameItem = root.nodes.getChildAt(3);
    //     expect(sameItem).toBe(item);
    // });



 


});