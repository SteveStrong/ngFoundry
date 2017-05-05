/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />
/// <reference path="../Scripts/moment.min.js" />

/// <reference path="../Foundry/Foundry.rules.filtering.js" />
/// <reference path="../Foundry/Foundry.undo.js" />


describe("Do UnDo: state", function () {
    var list;
    var data;

    beforeEach(function () {
        list = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
        var i = 0;

        data = list.map(function (item) {
            var hour = i; i++;
            var time = new moment();
            return {
                name: item,
                number: hour,
                hour: time.add('h', hour),
            }
        });

        data = fo.filtering.applyFilterAndSort(data, undefined, 'number(a)');


    });



    it("should be able to registarActions", function () {
        function beforeDelete(payload){ return payload; }
        function undoDelete(payload){ return payload; }
        function verifyKeepDelete(pOld, pNew) { return pOld != pNew; }

        fo.undo.clear();
        fo.undo.registerActions('delete', beforeDelete, undoDelete, verifyKeepDelete);
        expect(fo.undo.canUndo()).toBe(false);

        var undo = fo.undo.do('delete', 'Dave');
        expect(fo.undo.canUndo()).toBe(true);
        expect(undo.action).toBe('delete');
        expect(undo.payload).toBe('Dave');

        var keep = fo.undo.verifyKeep(undo, 'mike');
        expect(keep).toBe(true);
        expect(fo.undo.canUndo()).toBe(true);

        var keep = fo.undo.verifyKeep(undo, 'Dave');
        expect(keep).toBe(false);
        expect(fo.undo.canUndo()).toBe(false);
    });


    it("should be able to undo simple string edit", function () {
        function beforeDelete(payload) { return payload; }
        function verifyKeepDelete(pOld, pNew) { return pOld != pNew; }
        function undoDelete(payload) {
            return payload;
        }

        fo.undo.clear();
        fo.undo.registerActions('edit', beforeDelete, undoDelete, verifyKeepDelete);
        expect(fo.undo.canUndo()).toBe(false);

        var target = 'hello';

        var undo = fo.undo.do('edit', target);
        expect(fo.undo.canUndo()).toBe(true);
        expect(undo.payload).toEqual(target);

        target = target.toLocaleUpperCase();

        var keep = fo.undo.verifyKeep(undo, target);
        expect(keep).toBe(true);
        expect(fo.undo.canUndo()).toBe(true);

        expect(target).toEqual('HELLO');
        

        target = fo.undo.unDo();
        expect(fo.undo.canUndo()).toBe(false);
        expect(target).toEqual('hello');
    });


    //set up the conditions for removing items in an array

    fo.undo.registerActions('deleteItemInArray',
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

    it("should be able to deleteItemInArray and Undo", function () {
        expect(data[0].name).toBe("zero");
        expect(data[data.length - 1].name).toBe("ten");

        fo.undo.clear();

        //prepare for undo by deleting item and storing it
        var target = data[0];
        var payload = { source: data, loc: 0, data: target };

        data.removeItem(target);
        expect(data[0].name).toBe("one");
        expect(fo.undo.canUndo()).toBe(false);


        var undo = fo.undo.do('deleteItemInArray', payload);
        expect(fo.undo.canUndo()).toBe(true);

        //even the array members have changed, the undo should be kept
        var keep = fo.undo.verifyKeep(undo, { source: data });
        expect(keep).toBe(true);
        expect(fo.undo.canUndo()).toBe(true);

        fo.undo.unDo();
        expect(fo.undo.canUndo()).toBe(false);
        expect(data[0].name).toBe("zero");
    });

 


});