/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />
/// <reference path="../Scripts/moment.js" />

//http://momentjs.com/

describe("Moment: verify time zone calcs", function () {


    //it("should able to use a standard time string format", function () {

    //    var notvalid = moment("not a real date").isValid();
    //    expect(notvalid).toBe(false);

    //    var m1 = moment("2013-02-08T09:30:26 Z");
    //    var valid1 = m1.isValid();
    //    expect(valid1).toBe(true);

    //    //var m2 = moment("2013-02-08T09:30:26 +0000");
    //    //var valid2 = m2.isValid();
    //    //expect(valid2).toBe(true);

    //    //expect(m1.year()).toBe(m2.year());
    //    //expect(m1.valueOf()).toBe(m2.valueOf());
    //    //expect(m1.date()).toBe(m2.date());
    //    //expect(m1.hours()).toBe(m2.hours());
    //    //expect(m1.zone()).toBe(m2.zone());


    //    var a = moment();
    //    var b = moment.utc();
    //    a.format();  // 2013-02-04T10:35:24-08:00
    //    b.format();  // 2013-02-04T18:35:24+00:00
    //    expect(a.format()).toNotBe(b.format());

    //    //a.valueOf(); // 1360002924000
    //    //b.valueOf(); // 1360002924000
    //    //expect(a.valueOf()).toBe(b.valueOf());

    //});


    //it("should be able to convert from GMT to EST value is 5 if no DST", function () {

    //    var xxx = moment().zone("-08:00");

    //    var m1 = moment("2014-01-20 4:30", "YYYY-MM-DD HH:mm"); // parsed as 4:30 local time
    //    var m2 = moment("2014-01-20 4:30 +0000", "YYYY-MM-DD HH:mm Z"); // parsed as 4:30 GMT

    //    //
    //    var diff = m1.diff(m2,'hours');
    //    expect(diff).toBe(5);  //no DST in jan 20 2014 so hours diff is 5

    //    var z1 = m1.zone();
    //    var z2 = m2.zone();

    //    //both isn the same time zone
    //    expect(m1.zone()).toBe(m2.zone());

    //    var h1 = m1.hours()
    //    var h2 = m2.hours()

    //    expect(h1).toNotBe(h2);


    //});

    //http://en.wikipedia.org/wiki/Greenwich_Mean_Time

    it("should be able to convert from GMT to EST value is 4 if DST", function () {

        var m1 = moment("2013-06-20 4:30", "YYYY-MM-DD HH:mm"); // parsed as 4:30 local time
        var m2 = moment("2013-06-20 4:30 +0000", "YYYY-MM-DD HH:mm Z"); // parsed as 4:30 GMT

        //
        var diff = m1.diff(m2, 'hours');
        expect(diff).toBe(4);  //now using DST in june 20 2014 so hours diff is 4



    });

 

});