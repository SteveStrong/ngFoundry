
/// <reference path="../wwwroot/foundry.js" />

var foApp = angular.module('foApp', []);


var sample = {
    "id": 1,
    "departureNode": {
        "city": "Qinglian",
        "countryCode": "CN",
        "lat": "24.46442",
        "lng": "112.75534"
    },
    "arrivalNode": {
        "lng": "121.66979",
        "lat": "16.60036",
        "city": "Pangal Sur",
        "countryCode": "PH"
    },
    "headCount": 3,
    "color": "#e1e507"
};


foApp.controller('viewerController', function (dataService, render3DService, design3DService) {

    var self = this;
    var EARTH_RADIUS = 637;

    render3DService.init('earth');
    render3DService.animate();
        
    render3DService.addGlobe();
        
    fo.establishType('flow::node', {
        lng: 121.66979,
        lat: 16.60036,
        latitude: function () {
            return parseFloat(this.lat);
        },
        longitude: function () {
            return parseFloat(this.lng);
        },
        city: "Pangal Sur",
        countryCode: "PH",
        count: 0,
        visit: 0,
    });
    var node = fo.db.getEntityDB('flow::node');

    fo.establishType('flow::leg', {
        id: 1,
        arrivalNode: {},
        departureNode: {},
        headCount: 3,
        color: "#e1e507",
        route: function () {
            var points = [];
            var radius = EARTH_RADIUS + 100;
            var bearing = render3DService.llToBearing(this.departureNode.latitude, this.departureNode.longitude, this.arrivalNode.latitude, this.arrivalNode.longitude);
            var distance = render3DService.llToDistance(this.departureNode.latitude, this.departureNode.longitude, this.arrivalNode.latitude, this.arrivalNode.longitude, radius);
            var dist = 0;
            var step = distance / 10;
            while (dist < distance) {
                var point = render3DService.llToDestinationPosition(this.departureNode.latitude, this.departureNode.longitude, bearing, dist, radius);
                points.push(point);
                dist += step;
            }
            return points;
        }
    });

    var link = fo.db.getEntityDB('flow::leg');

    var world = fo.makeComponent({
        planes: [],
        targets: [],
    });




    var url = '../mock/flowdemo.json';
    dataService.getData(url).then(function (result) {

        var payload = result.payload;
        payload.forEach(function (item) {

            var departure = node.establishInstance(item.departureNode, item.departureNode.city);
            var arrival = node.establishInstance(item.arrivalNode, item.arrivalNode.city);
            item.departureNode = departure;
            item.arrivalNode = arrival;

            var leg = link.establishInstance(item, item.id);
            if (leg.route.length = 0) {
                return;
            }

            var name = 'Route{0}'.format(item.id);
            var route = design3DService.newInstance({
                context: { type: 'tube', myName: name, points: leg.route },
                leg: leg,
            });

            world.captureSubcomponent(route, name, true);
        })

        return render3DService.defineModel('707', 'models/707.js')
    })
    .then(function (planeModel) {

        var routes = world.mySubcomponents()
        routes.forEach(function (route) {
            var plane = planeModel.newInstance({
                route: route,
                percent: 0,
            }); 
            world.planes.push(plane);
        });

        var plane = world.planes.pop();
        if (plane) {
            //plane.route.draw();
            world.targets = plane ? [plane] : [];
        }

    })
    .catch(function (reason) {
        alert('error ' + reason);
    });



    var tower = render3DService.defineSolid('tower',
    {
        type: 'block',
        width: 10,
        height: 10, 
        depth: 10
    },
    {
        ambient: 0x000000,
        color: 0x77ff77,
        specular: 0x999999,
        shininess: 100,
        shading: THREE.SmoothShading,
        opacity: 0.7,
        transparent: true
    });


    function renderCraft(renderer, s, c) {
        // Try Animate Camera Along Spline

        world.targets.forEach(function (craft) {
            var route = craft.route;
            craft.gotoSphereArc(route.geometry, craft.percent);
            craft.percent += .2;

            //this math is the problem, somehow we to aligh the path and the model
            craft.rotateOnY((270).toRad());
        })

        renderer.render(s, c);

        var obj = world.targets[0];
        if (!obj || obj.percent >= 1) {
            world.targets.forEach(function (craft) {
                craft.undraw();
                craft.route.undraw();
            });
            var plane = world.planes.pop();
            if (plane) {
                plane.draw();
                plane.route.draw();

                world.targets = plane ? [plane] : [];

                var geo = plane.route.leg.arrivalNode;
                geo.count += plane.route.leg.headCount;
                geo.visit += 1;

                var spec = tower.mergeSpec({
                    geometrySpec: {
                        height: function () {
                            return 4 * geo.count;
                        },
                        width: function () {
                            var size = 12 - geo.visit;
                            return size > 2 ? size : 2;
                        },
                        depth: function () {
                            return this.width
                        }
                    },
                    pos: function () {
                        return render3DService.llToPosition(geo.latitude, geo.longitude, EARTH_RADIUS, this.geometrySpec.height / 2);
                    }
                });

                var block = tower.newInstance(spec);
                block.position(block.pos);

                block.rotateOnY(geo.longitude * Math.PI / 180);
                block.rotateOnZ((270 + geo.latitude) * Math.PI / 180)
                block.draw();

            }


        };
    }


    render3DService.setCustomRenderer(renderCraft);


});