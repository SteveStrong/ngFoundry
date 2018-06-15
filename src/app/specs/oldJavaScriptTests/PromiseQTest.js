/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.js" />

describe("Foundry: Promise", function () {


    beforeEach(function() {
    });

    it("can be defered version 1", function () {
        var deferred = Q.defer();
        var p = deferred.promise;

        deferred.resolve(1);
        p.then(function (result) {
            expect(result).toEqual(1);
        })

    });

    it("can be defered version 2", function () {
        var deferred = Q.defer();
        var p = deferred.promise;

        p.then(function (result) {
            expect(result).toEqual(2);
        })
        deferred.resolve(2);

    });

    it("can be defered version 3", function () {
        var item = Q(100);


        item.then(function (result) {
            expect(result).toEqual(100);
        })

    });


    function tracePropertyLifecycle (name, search) {
        var prop = this.getProperty(name, search);
        var self = this;

        //prop.onValueDetermined = function (value, formula, owner) {
        //    var note = self.gcsIndent(prop.asLocalReference() + ' onValueDetermined:' + owner.myName + '  value=' + value)
        //    fo.trace.info(note);
        //}

        //prop.onValueSmash = function (value, formula, owner) {
        //    var note = self.gcsIndent(prop.asLocalReference() + ' onValueSmash:' + owner.myName)
        //    fo.trace.error(note);
        //}
        //prop.onValueSet = function (value, formula, owner) {
        //    var note = self.gcsIndent(prop.asLocalReference() + ' onValueSet:' + owner.myName + '  value=' + value)
        //    fo.trace.warn(note);
        //}
    }

    it("can be defered inside a property", function () {


        var spec = {
            greeting: 'hello',
            subject: function () {

                var promisedToProperty = this.currentComputingProperty();

                var deferred = Q.defer();
                var promise = deferred.promise;

                var success = function (result) {
                    fo.runWithUIRefreshLock(function () {
                        promisedToProperty.setValue(result);
                    });
                };
                var fail = function (result) {
                    promisedToProperty.setValue('Failed...');
                };
                promise.then(success, fail);
                deferred.resolve('world');
                return 'Waiting...';
            },
            test: function () {
                var message = this.greeting + ' ' + this.subject;
                return message;
            }
        };

        var comp = fo.makeComponent(spec);
        comp.myName = "example";
        tracePropertyLifecycle.call(comp, 'test');
        var ask1 = comp.test;

         setTimeout(function () {
            var ask2 = comp.test;
            expect(ask2).toEqual('hello world');

        }, 500)


    });

});