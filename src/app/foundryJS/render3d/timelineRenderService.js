(function (app, fo, tools, ops, time, undefined) {

    app.service('renderTimeLineService', function ($location, $q) {
        var container;

        function getHttpContext() {
            if (location) {
                return location.protocol + "//" + location.host + location.pathname.slice(0, location.pathname.indexOf('/', 1));
            }
        };

        this.init = function (id) {
            // DOM element where the Timeline will be attached
            container = document.getElementById(id);
        }


        ops.registerGroup('placeName', function (node) {
            return node.place.name;
        });


        this.renderNodes = function (list) {
            //get unique place names...
            var names = Object.keys(ops.applyGrouping(list, 'placeName'));
            var groups = names.map(function (group) {
                return {
                    id: names.indexOf(group),
                    content: group
                }
            });

            var timeMap = list.map(function (item) {
                var group = item.place.name;
                return {
                    id: item.id,
                    source: item,
                    group: names.indexOf(group),
                    start: item.dateTimeUtc,
                    editable: false,
                };
            });

            // Create a DataSet (allows two way data-binding)
            var items = new time.DataSet(timeMap);

            // Configuration for the Timeline
            var options = {
                groupOrder: 'content',  // groupOrder can be a property name or a sorting function
                stack: false,
                editable: true,       // true or false
                template: function (item) {
                    var label = item.source.id + ')  @ ' + item.source.dateTimeUtc.toLocaleTimeString('en-US');
                    var text = '"' + item.source.description + '"';
                    var html = '<p  data-toggle="tooltip" data-placement="top" title=' + text + ' >' + label + '</p>'
                    //var html = '<button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title=' + text + ' >[' + item.source.id + ']</button>';

                    // var html = ' <span style="color:#97B0F8;">[' + item.id + ']</span>'; // generate HTML markup for this item
                    return html;
                }

            };


            //http://visjs.org/docs/timeline/
            // Create a Timeline
            var timeline = new time.Timeline(container);
            timeline.setOptions(options);
            timeline.setGroups(groups);
            timeline.setItems(items);

            timeline.on('select', function (properties) {
                var itemId = properties.items[0];
                var node = list.filter(function (item) {
                    return item.id === itemId;
                })[0];
                fo.publish('nodeSelected', [node]);
            });
        }


        this.renderFlights = function (list) {

            var names = Object.keys(ops.applyGrouping(list, 'flightGroup'));
            var groups = names.map(function (group) {
                return {
                    id: names.indexOf(group),
                    content: group
                }
            });

            var i = 0;
            var timeMap = list.map(function (item) {
                i += 1;
                var group = item.flightGroup;
                return {
                    id: i,
                    source: item,
                    group: names.indexOf(group),
                    start: item.departureTimeUtc,
                    end: item.arrivalTimeUtc,
                    editable: false,
                };
            });

            // Create a DataSet (allows two way data-binding)
            var items = new time.DataSet(timeMap);

            // Configuration for the Timeline
            var options = {
                stack: false,
                groupOrder: 'content',  // groupOrder can be a property name or a sorting function
                editable: false,       // true or false
                template: function (item) {
                    var html = '<span class="bg-primary">' + item.source.aircraftid + '</span>'
                    //var html = '<button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title=' + text + ' >[' + item.source.id + ']</button>';

                    // var html = ' <span style="color:#97B0F8;">[' + item.id + ']</span>'; // generate HTML markup for this item
                    return html;
                }

            };


            //http://visjs.org/docs/timeline/
            // Create a Timeline
            var timeline = new time.Timeline(container);
            timeline.setOptions(options);
            timeline.setGroups(groups);
            timeline.setItems(items);

            timeline.on('select', function (properties) {
                var flight = properties.items.map(function (id) {
                    return list[id];
                })[0];
                fo.publish('flightSelected', [flight]);
            });
        }


    });

}(foApp, Foundry, Foundry.tools, Foundry.listOps, vis));
