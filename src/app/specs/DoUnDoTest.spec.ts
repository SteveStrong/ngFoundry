import { TestBed, async } from '@angular/core/testing';

import { globalUnDo } from '../foundry/foUnDo';



describe('Do UnDo: state', () => {
    let data:any[];
    beforeEach(async(() => {
        let list = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
        let i=0;

        data = list.map(function (item) {
            var hour = i; i++;
            //var time = new moment();
            return {
                name: item,
                number: hour,
                //hour: time.add('h', hour),
            }
        });
    }));



    it("should be able to registarActions", function () {
        function beforeDelete(payload) { return payload; }
        function undoDelete(payload) { return payload; }
        function verifyKeepDelete(pOld, pNew) { return pOld != pNew; }

        globalUnDo.clear();
        globalUnDo.registerActions('delete', beforeDelete, undoDelete, verifyKeepDelete);
        expect(globalUnDo.canUndo()).toBe(false);

        var undo = globalUnDo.do('delete', 'Dave');
        expect(globalUnDo.canUndo()).toBe(true);
        expect(undo.action).toBe('delete');
        expect(undo.payload).toBe('Dave');

        var keep = globalUnDo.verifyKeep(undo, 'mike');
        expect(keep).toBe(true);
        expect(globalUnDo.canUndo()).toBe(true);

        var keep = globalUnDo.verifyKeep(undo, 'Dave');
        expect(keep).toBe(false);
        expect(globalUnDo.canUndo()).toBe(false);
    });


    it("should be able to undo simple string edit", () => {
        function beforeDelete(payload) { return payload; }
        function verifyKeepDelete(pOld, pNew) { return pOld != pNew; }
        function undoDelete(payload) {
            return payload;
        }

        globalUnDo.clear();
        globalUnDo.registerActions('edit', beforeDelete, undoDelete, verifyKeepDelete);
        expect(globalUnDo.canUndo()).toBe(false);

        var target = 'hello';

        var undo = globalUnDo.do('edit', target);
        expect(globalUnDo.canUndo()).toBe(true);
        expect(undo.payload).toEqual(target);

        target = target.toLocaleUpperCase();

        var keep = globalUnDo.verifyKeep(undo, target);
        expect(keep).toBe(true);
        expect(globalUnDo.canUndo()).toBe(true);

        expect(target).toEqual('HELLO');


        target = globalUnDo.unDo();
        expect(globalUnDo.canUndo()).toBe(false);
        expect(target).toEqual('hello');
    });


    //set up the conditions for removing items in an array

    globalUnDo.registerActions('deleteItemInArray',
        function (payload) { //do before payload is stored
            return payload;
        },
        function (payload) { //process undo because noone else will
            //implement restore action arr.splice(2, 0, "Lene");

            payload.source.splice(payload.loc, 0, payload.data);
            return payload;
        },
        function (pold, pnew) { //write a rule to keep this undo during verify phase
            if (pold.source != pnew.source) {
                return true;
            }
            if (pold.loc != pnew.loc) return true;
            if (pold.data != pnew.data) return true;
            return false;
        }
    );

    it("should be able to deleteItemInArray and Undo", () => {

        function removeItem(source:any[], item:any){
            let index = source.indexOf(item);
            if (index !== -1)source.splice(index, 1);
        }

        expect(data[0].name).toBe("zero");
        expect(data[data.length - 1].name).toBe("ten");

        globalUnDo.clear();

        //prepare for undo by deleting item and storing it
        var target = data[0];
        var payload = { source: data, loc: 0, data: target };

        removeItem(data, target);
        expect(data[0].name).toBe("one");
        expect(globalUnDo.canUndo()).toBe(false);


        var undo = globalUnDo.do('deleteItemInArray', payload);
        expect(globalUnDo.canUndo()).toBe(true);

        //even the array members have changed, the undo should be kept
        var keep = globalUnDo.verifyKeep(undo, { source: data });
        expect(keep).toBe(true);
        expect(globalUnDo.canUndo()).toBe(true);

        globalUnDo.unDo();
        expect(globalUnDo.canUndo()).toBe(false);
        expect(data[0].name).toBe("zero");
    });




});