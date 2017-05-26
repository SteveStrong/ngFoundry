/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />


describe("Foundry: Dependency OrderedCollection", function () {
    var block;

    var listItemSpec = {
        isSelected: false,
        Title: 'untitled',
        sortOrder: 0,
    };

    function makeSubpart(parent, title) {
        var result = parent.createSubcomponent(listItemSpec);
        result.Title = title;
        return result;
    }

    beforeEach(function () {
        var blockSpec = {
            A: function () {
                //this technique make the property depend in the property ->  'isSelected'
                var list = this.Subcomponents.copyWhere(function (item) { return item.isSelected });
                var result = fo.makeOrderedCollection(list, this, 'sortOrder');
                return result;
            },
            B: 2,
            C: function () { return this.A.count + this.B },

            moveUp: function (item) {
                this.A.swapItemTo(item, item.sortOrder - 1);
            },
            moveDown: function (item) {
                this.A.swapItemTo(item, item.sortOrder + 1);
            },
            refresh: function (item) {
                this._A.smash();
            },
        };
        block = fo.makeComponent(blockSpec);
    });

    it("should have valid defaults", function () {
        expect(fo.utils.isaComponent(block)).toBe(true);
    });

    it("should have vaid properties (Direct Reference)", function () {
        expect(fo.utils.isaProperty(block._A)).toBe(true);
        expect(fo.utils.isaProperty(block._B)).toBe(true);
        expect(fo.utils.isaProperty(block._C)).toBe(true);
    });

    it("should have valid default values", function () {
        expect(fo.utils.isaCollection(block.A)).toBe(true);
        expect(block.B).toEqual(2);
        expect(block.C).toEqual(2);
    });

    it("should be able to add selected subcomponent, then find it", function () {
        makeSubpart(block, "hello").isSelected = true;
        expect(block.B).toEqual(2);
        expect(block._C.status).toBeUndefined();
        expect(block.C).toEqual(3);
    });

    it("should be able to add unselected subcomponent, select it, then find it", function () {
        var item = makeSubpart(block, "hello");
        expect(block.B).toEqual(2);
        expect(block._C.status).toBeUndefined();
        expect(block.C).toEqual(2);


        item.isSelected = true;
        expect(block.B).toEqual(2);
        expect(block._C.status).toBeUndefined();
        expect(block.C).toEqual(3);

        item.isSelected = false;
        expect(block.C).toEqual(2);
    });

    it("should be able to add multipule items and select", function () {
        var hello = makeSubpart(block, "hello");
        var goodbye = makeSubpart(block, "goodbye");
        expect(block.Subcomponents.count).toEqual(2);

        expect(block.A.count).toEqual(0);
        hello.isSelected = true;
        goodbye.isSelected = true;
        expect(block.A.count).toEqual(2);

        hello.isSelected = false;
        expect(block.A.count).toEqual(1);

        goodbye.isSelected = false;
        expect(block.A.count).toEqual(0);

        hello.isSelected = true;
        expect(block.A.count).toEqual(1);
    });

    it("should be able to select and reorder", function () {
        var hello = makeSubpart(block, "hello");
        var goodbye = makeSubpart(block, "goodbye");

        hello.isSelected = true;
        goodbye.isSelected = true;
        expect(block.A.count).toEqual(2);

        expect(hello.sortOrder).toEqual(0);
        expect(goodbye.sortOrder).toEqual(1);


        //block._moveUp.doCommand(goodbye);

        block.doCommand("moveUp", goodbye);
        expect(goodbye.sortOrder).toEqual(0);
        expect(hello.sortOrder).toEqual(1);

        goodbye.isSelected = false;

        //need to refresh to reorder I guess
        block._refresh.doCommand();
        expect(block.A.count).toEqual(1);
        expect(hello.sortOrder).toEqual(0);

    });

});