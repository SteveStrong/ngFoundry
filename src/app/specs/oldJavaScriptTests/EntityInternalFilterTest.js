/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.js" />

describe("Foundry: Entity Internal Filter Test", function () {

    fo.establishType('Entity::Box', {
        width: "<width>",
        height: "<height>",
        depth: "<depth>",
        volume: function () {
            return this.width * this.height * this.depth;
        }
    });



    var model;

    beforeEach(function() {
        model = fo.makeComponent();

        for (var i = 0; i < 5; i++) {
            for (var j= 0; j < 5; j++) {
                for (var k = 0; k < 5; k++) {
                    var box = fo.Entity.newBox({ width: i, height: j, depth: k})
                    model.capture(box);
                }
            }
        } 
    });

    it("verify counts", function () {
        var boxes = model.selectComponents(function (item) { return item.isOfType('Box') });
        expect(boxes.count).toEqual(5*5*5);
    });

    it("verify counts where volume == 0", function () {

        var boxes = model.selectComponents(function (item) { return item.isOfType('Box') });
        var stdFilter = boxes.elements.filter(function (item) {
            return item.volume == 0;
        });
        expect(stdFilter.length).toEqual(61);

        var zeroVolume = fo.filtering.applyFilter(boxes, 'volume[0]');
        expect(zeroVolume.count).toEqual(61);
    });

    it("verify counts where volume == 4 * 4 * 4", function () {

        var boxes = model.selectComponents(function (item) { return item.isOfType('Box') });
        var stdFilter = boxes.elements.filter(function (item) {
            return item.volume == 4 * 4 * 4;
        });
        expect(stdFilter.length).toEqual(1);

        var filter = 'volume[' + 4 * 4 * 4 + ']';

        var newVolume = fo.filtering.applyFilter(boxes, filter);
        expect(newVolume.count).toEqual(1);

        var filterFn = fo.filtering.makeFilter(filter);
        var newVolume1 = boxes.filter(filterFn);
        expect(newVolume1.count).toEqual(1);

    });

    it("verify counts using internal filter", function () {
        var filter = 'volume[' + 4 * 4 * 4 + ']';

        var filterFn = fo.filtering.makeFilter(filter);

        var boxes = model.selectComponents(function (item) { return item.isOfType('Box') });
        boxes.forEach(function (item) {
            item.redefine('isActive', function () {
                var found = filterFn(item);
                return found;
            });
        })


        var activeitems = model.selectComponents(function (item) { return item.isActive; });

        expect(activeitems.count).toEqual(1);

    });

});