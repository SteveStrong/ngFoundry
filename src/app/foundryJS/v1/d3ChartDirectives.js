(function (app, fo, undefined) {

    function renderBarChart(element, data, xLabel, yLabel, maxWidth, maxHeight) {

        var margin = { top: 20, right: 20, bottom: 30, left: 40 };
        var width = maxWidth - margin.left - margin.right;
        var height = maxHeight - margin.top - margin.bottom;


        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .range([height, 0]);

        var chart = d3.select(".chart")
            .attr("width", width)
            .attr("height", height);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
        //.ticks(10, "%");

        var svg = d3.select(element).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        x.domain(data.map(function (d) { return d.name; }));
        y.domain([0, d3.max(data, function (d) { return d.value; })]);

        svg.append("g")
           .attr("class", "x axis")
           .attr("transform", "translate(0," + height + ")")
           .call(xAxis)
        //.selectAll("text")
        //        .style("text-anchor", "end")
        //        .style("font-weight", "bold")
        //        .style("font-family", "arial")
        //        .style("fill", "#6d6e71")
        //        .attr("dx", "-.6em")
        //        .attr("dy", ".12em")
        //        .attr("transform", function (d) {
        //            return "rotate(-65)"
        //        });

         //.append("text")
         //   .attr("y", 6)
         //   .attr("dy", ".71em")
         //   .style("text-anchor", "end")
         //   .text(xlabel || 'X');

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(yLabel || 'Y');

        svg.selectAll(".bar")
            .data(data)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) { return x(d.name); })
            .attr("width", x.rangeBand())
            .attr("y", function (d) { return y(d.value); })
            .attr("height", function (d) { return height - y(d.value); });


        function type(d) {
            d.value = +d.value;
            return d;
        }
    }


    function renderPieChart(element, data, xLabel, yLabel, maxWidth, maxHeight) {

        var margin = { top: 20, right: 20, bottom: 30, left: 40 };
        var width = maxWidth - margin.left - margin.right;
        var height = maxHeight - margin.top - margin.bottom;


        var radius = Math.min(width, height) / 2;

        var color = d3.scale.ordinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        var arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d.value;
            });

        var svg = d3.select(this.element).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        //name: item.key,
        //value: item.count,

            // data.forEach(function (d) {
            //    d.population = +d.population;
            //});

            var g = svg.selectAll(".arc")
                .data(pie(data))
              .enter().append("g")
                .attr("class", "arc");

            g.append("path")
                .attr("d", arc)
                .style("fill", function (d) {
                    return color(d.data.name);
                });

            g.append("text")
                .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .text(function (d) {
                    return d.data.name;
                });

    }



    //// properties are directly passed to `create` method
    //function GroupbarChart(datajson, yaxisName, yaxisPos) {
    //    this.datajson = datajson;
    //    this.yaxisName = yaxisName;
    //    this.yaxisPos = yaxisPos;

    //    this.workOnElement = function (element) {
    //        this.element = element;
    //    };


    //    this.generateGraph = function () {
    //        //d3 specific coding
    //        var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    //                     width = 660 - margin.left - margin.right,
    //                     height = 300 - margin.top - margin.bottom;

    //        var x0 = d3.scale.ordinal()
    //            .rangeRoundBands([0, width], .1);

    //        var x1 = d3.scale.ordinal();

    //        var y = d3.scale.linear()
    //            .range([height, 0]);

    //        var color = d3.scale.ordinal()
    //            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    //        var xAxis = d3.svg.axis()
    //            .scale(x0)
    //            .orient("bottom");

    //        var yAxis = d3.svg.axis()
    //            .scale(y)
    //            .orient("left")
    //            .tickFormat(d3.format(".2s"));

    //        var svg = d3.select(this.element).append("svg")
    //            .attr("width", width + margin.left + margin.right)
    //            .attr("height", height + margin.top + margin.bottom)
    //          .append("g")
    //            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //        function loadData(data) {
    //            var ageNames = d3.keys(data[0]).filter(function (key) { return key !== "State"; });

    //            data.forEach(function (d) {
    //                d.ages = ageNames.map(function (name) { return { name: name, value: +d[name] }; });
    //            });

    //            x0.domain(data.map(function (d) { return d.State; }));
    //            x1.domain(ageNames).rangeRoundBands([0, x0.rangeBand()]);
    //            y.domain([0, d3.max(data, function (d) { return d3.max(d.ages, function (d) { return d.value; }); })]);

    //            svg.append("g")
    //                .attr("class", "x axis")
    //                .attr("transform", "translate(0," + height + ")")
    //                .call(xAxis);

    //            svg.append("g")
    //                .attr("class", "y axis")
    //                .call(yAxis)
    //              .append("text")
    //                .attr("transform", "rotate(-90)")
    //                .attr("y", this.yaxisPos)
    //                .attr("dy", ".71em")
    //                .style("text-anchor", "end")
    //                .text(this.yaxisName);

    //            var state = svg.selectAll(".state")
    //                .data(data)
    //              .enter().append("g")
    //                .attr("class", "g")
    //                .attr("transform", function (d) { return "translate(" + x0(d.State) + ",0)"; });

    //            state.selectAll("rect")
    //                .data(function (d) { return d.ages; })
    //              .enter().append("rect")
    //                .attr("width", x1.rangeBand())
    //                .attr("x", function (d) { return x1(d.name); })
    //                .attr("y", function (d) { return y(d.value); })
    //                .attr("height", function (d) { return height - y(d.value); })
    //                .style("fill", function (d) { return color(d.name); });

    //            var legend = svg.selectAll(".legend")
    //                .data(ageNames.slice().reverse())
    //              .enter().append("g")
    //                .attr("class", "legend")
    //                .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    //            legend.append("rect")
    //                .attr("x", width - 18)
    //                .attr("width", 18)
    //                .attr("height", 18)
    //                .style("fill", color);

    //            legend.append("text")
    //                .attr("x", width - 24)
    //                .attr("y", 9)
    //                .attr("dy", ".35em")
    //                .style("text-anchor", "end")
    //                .text(function (d) { return d; });

    //        };

    //        loadData(sampleBarData)
    //    }

    //    return this;
    //};



    //function MultilineChart(datajson, yaxisName, yaxisPos, d3Format) {
    //    this.datajson = datajson;
    //    this.yaxisName = yaxisName;
    //    this.yaxisPos = yaxisPos;
    //    this.d3Format = d3Format;

    //    this.workOnElement = function (element) {
    //        this.element = element;
    //    };

    //    this.generateGraph = function () {
    //        //d3 specific coding
    //        var margin = {
    //            top: 20, right: 80, bottom: 30, left: 50
    //        },
    //                    width = 960 - margin.left - margin.right,
    //                    height = 500 - margin.top - margin.bottom;

    //        var parseDate = d3.time.format(this.d3Format).parse;

    //        var x = d3.time.scale()
    //                .range([0, width]);

    //        var y = d3.scale.linear()
    //                .range([height, 0]);

    //        var color = d3.scale.category10();

    //        var xAxis = d3.svg.axis()
    //                    .scale(x)
    //                    .orient("bottom");

    //        var yAxis = d3.svg.axis()
    //                    .scale(y)
    //                    .orient("left");

    //        var line = d3.svg.line()
    //            .interpolate("basis")
    //            .x(function (d) { return x(d.date); })
    //            .y(function (d) { return y(d.temperature); });

    //        var svg = d3.select(this.element).append("svg")
    //                    .attr("width", width + margin.left + margin.right)
    //                    .attr("height", height + margin.top + margin.bottom)
    //                    .append("g")
    //                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //        function loadData(data) {
    //            color.domain(d3.keys(data[0]).filter(function (key) { return key !== "date"; }));
    //            data.forEach(function (d) {
    //                d.date = parseDate(d.date);
    //            });

    //            var cities = color.domain().map(function (name) {
    //                return {
    //                    name: name,
    //                    values: data.map(function (d) {
    //                        return { date: d.date, temperature: +d[name] };
    //                    })
    //                };
    //            });


    //            x.domain(d3.extent(data, function (d) { return d.date; }));

    //            y.domain([
    //                    d3.min(cities, function (c) { return d3.min(c.values, function (v) { return v.temperature; }); }),
    //                    d3.max(cities, function (c) { return d3.max(c.values, function (v) { return v.temperature; }); })
    //            ]);

    //            svg.append("g")
    //                     .attr("class", "x axis")
    //                     .attr("transform", "translate(0," + height + ")")
    //                     .call(xAxis);

    //            svg.append("g")
    //                         .attr("class", "y axis")
    //                         .call(yAxis)
    //                        .append("text")
    //                        .attr("transform", "rotate(-90)")
    //                        .attr("y", this.yaxisPos)
    //                        .attr("dy", ".71em")
    //                        .style("text-anchor", "end")
    //                        .text(this.yaxisName);

    //            var city = svg.selectAll(".city")
    //                          .data(cities)
    //                          .enter().append("g")
    //                          .attr("class", "city")
    //                        .city.append("path")
    //                        .attr("class", "line")
    //                        .attr("d", function (d) { return line(d.values); })
    //                        .style("stroke", function (d) { return color(d.name); });

    //            city.append("text")
    //                 .datum(function (d) { return { name: d.name, value: d.values[d.values.length - 1] }; })
    //                 .attr("transform", function (d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
    //                 .attr("x", 3)
    //                 .attr("dy", ".35em")
    //                 .text(function (d) { return d.name; });
    //        };

    //        loadData(sampleLineData)
    //    }
    //}


                var testdata = [
                    { name: 'A', value: 4 },
                    { name: 'B', value: 8 },
                    { name: 'C', value: 15 },
                    { name: 'D', value: 16 },
                    { name: 'E', value: 23 },
                    { name: 'F', value: 42 },
                ];

    // It is responsible for produce HTML DOM or it returns a combined link function
    // Further Docuumentation on this - http://docs.angularjs.org/guide/directive

    app.directive('histogram', function () { // Angular Directive

       return {
            restrict: 'E', // Directive Scope is Element
            replace: true, // replace original markup with template 
            transclude: false, // not to copy original HTML DOM
            compile: function (elem, attrs) {// the compilation of DOM is done here.

                var chart = attrs.chart;
                var dictionary = attrs.dictionary;
                var rule = attrs.rule;
                var element = elem[0];

                var name = app.defaultNS(dictionary);
                var list = fo.getEntityDictionaryAsArray(name);

                var histo = fo.filtering.createHistogram(list, rule);
                var data = histo.map(function (item) {
                    return {
                        name: item.key,
                        value: item.count,
                    }
                });

                data.push({
                    name: 'All',
                    value: list.length,
                })


                var width = 320;
                var height = 300;

                setTimeout(function () {
                    renderBarChart(element, data, rule, 'Count', width, height);
                }, 500);
            }
        }
    });


    app.directive('groups', function () { // Angular Directive

        return {
            restrict: 'E', // Directive Scope is Element
            replace: true, // replace original markup with template 
            transclude: false, // not to copy original HTML DOM
            compile: function (elem, attrs) {// the compilation of DOM is done here.

                var chart = attrs.chart;
                var dictionary = attrs.dictionary;
                var rule = attrs.rule;
                var element = elem[0];

                var name = app.defaultNS(dictionary);
                var list = fo.getEntityDictionaryAsArray(name);

                var histo = fo.filtering.applyGrouping(list, rule);
                var data = [];

                fo.utils.loopForEachValue(histo, function (key, value) {
                    data.push( {
                        name: key,
                        value: value.length,
                    })
                });

                //data = fo.utils.applySort(data,'value(d)')

                //data.push({
                //    name: 'All',
                //    value: list.length,
                //})


                var width = 320;
                var height = 300;

                setTimeout(function () {
                    if ('pie'.matches(chart)) {
                        renderPieChart(element, data, rule, 'Count', width, height);
                    } else {
                        renderBarChart(element, data, rule, 'Count', width, height);
                    }
                }, 500);
            }
        }
    });

}(foApp, Foundry));