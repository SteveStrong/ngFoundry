/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />


describe("Foundry: publish subscribe", function () {
    var topic = 'hello';

    var proveFlushWorks = 0;

    beforeEach(function () {
        fo.flushPubSubCache(topic);
    });

    it("these functions exist", function () {
        expect(fo.publish).toBeDefined();
        expect(fo.subscribe).toBeDefined();
        expect(fo.subscribeComplete).toBeDefined();
        expect(fo.unsubscribe).toBeDefined();
    });

    it("should do a simple pub sub (when the order is correct)", function () {

        fo.subscribe(topic, function (place) {
            expect(place).toBe('world');
            proveFlushWorks += 1;
        });

        proveFlushWorks = 0;
        expect(proveFlushWorks).toBe(0);
        fo.publish(topic, ['world']);
        expect(proveFlushWorks).toBe(1);

    });

    it("should should answer on complete", function () {

        fo.subscribeComplete(topic, function (place) {
            expect(place).toBe('world');
        });

        proveFlushWorks = 0;
        expect(proveFlushWorks).toBe(0);
        fo.publish(topic, ['world']);
        expect(proveFlushWorks).toBe(0);

    });


    it("should wait for all to on complete", function () {

        var count = 1;

        fo.subscribeComplete(topic, function (place) {
            expect(count).toBe(7); //7
        });

        fo.subscribe(topic, function (place) {
            count += 1;
        });
        fo.subscribe(topic, function (place) {
            count += 2;
        });
        fo.subscribe(topic, function (place) {
            count += 3;
        });


        fo.publish(topic, ['world']);

    });

});