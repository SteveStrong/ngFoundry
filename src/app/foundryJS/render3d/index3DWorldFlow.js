
/// <reference path="../wwwroot/foundry.js" />

var foApp = angular.module('foApp', []);


foApp.controller('viewerController', function (dataService, render3DService, design3DService, $rootScope) {

    var self = this;
    self.title = 'Flight legs around the world ';
    self.destinationCity = '';

    var EARTH_RADIUS = 637;

    render3DService.init('earth');
    render3DService.animate();       
    render3DService.addGlobe();

    var space = fo.makeModelWorkspace('workspace', undefined, {
        planes: [],
        targets: [],
    });

    var world = space.rootModel;

    var viewModel = design3DService.newInstance({
        myName: 'workspace',
        context: world,
        geom: function () {
            return render3DService.rootGeom();
        },
    });


     
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
        color: 0xff0000,
    });

    var node = fo.db.getEntityDB('flow::node');


    function processNode(list, type) {
        var node = fo.db.getEntityDB('flow::' + type);
        node.idFunction = function (item) {
            return item.city + item.countryCode;
        }
        node.defaultType = fo.establishType('flow::node')
        var members = list.map(function (data) {
            var member = node.establishInstance(data.Node);
            member.color = data.color;
            return member;
        });
        return members;
    };

    fo.establishType('flow::leg', {
        id: 1,
        arrivalNode: {},
        departureNode: {},
        headCount: 3,
        color: "#e1e507",
        route: function () {
            var points = [];
            var radius = EARTH_RADIUS + 3;
            var bearing = render3DService.llToBearing(this.departureNode.latitude, this.departureNode.longitude, this.arrivalNode.latitude, this.arrivalNode.longitude);
            var distance = render3DService.llToDistance(this.departureNode.latitude, this.departureNode.longitude, this.arrivalNode.latitude, this.arrivalNode.longitude, radius);
            var dist = 0;
            var step = distance / 10;
            while (dist <= distance) {
                var point = render3DService.llToDestinationPosition(this.departureNode.latitude, this.departureNode.longitude, bearing, dist, radius);
                points.push(point);
                dist += step;
            }
            return points;
        }
    });

    var link = fo.db.getEntityDB('flow::leg');


    var routeDef = fo.establishType('demo::route', {
        type: 'tube',
        points: [],
    });



    var tower = render3DService.defineSolid('tower',
    {
        type: 'block',
        width: 10,
        height: 10,
        depth: 10
    },
    {
        color: 0x77ff00,
        specular: 0x999999,
        shininess: 100,
        shading: THREE.SmoothShading,
        opacity: 0.7,
        transparent: true
    });

    function createTower(geo) {
        //do find the block and resize 
        var spec = tower.mergeSpec({
            geometrySpec: {
                height: function () {
                    return geo.count;
                },
                width: function () {
                    var size = 12; // - geo.visit;
                    return size > 2 ? size : 2;
                },
                depth: function () {
                    return this.width
                }
            },
            materialSpec: {
                color: geo.color,
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



    function updateTower(geo) {
        //do find the block and resize 
        if (!geo.tower) {

            var spec = tower.mergeSpec({
                 geometrySpec: {
                    geoLoc: geo,
                    height: function () {
                        return 10 + 4 * this.geoLoc.count;
                    },
                    width: function () {
                        var size = 12; // - this.geoLoc.visit;
                        return size > 2 ? size : 2;
                    },
                    depth: function () {
                        return this.width
                    }
                },
                materialSpec: {
                    color: geo.color,
                },
            });

            var block = tower.newInstance(spec, undefined, geo);
            block.doDraw = function () {
                var spec = this.geometrySpec;
                var height = spec.height / 2;
                var geo = spec.geoLoc;
                var pos = render3DService.llToPosition(geo.latitude, geo.longitude, EARTH_RADIUS, height);

                this.position(pos);
                this.rotateOnY(geo.longitude * Math.PI / 180);
                this.rotateOnZ((270 + geo.latitude) * Math.PI / 180);
                this.draw();
                return this;
            }


            geo.tower = block;
        } else {
            geo.tower.smashProperty('geometry');
        }
        geo.tower.doDraw();
    }
    

    function renderCraft(renderer, s, c) {
        // Try Animate Camera Along Spline

        world.targets.forEach(function (craft) {
            var route = craft.route;
            craft.gotoSphereArc(route.geometry, craft.percent);
            craft.percent += .19;

            //this math is the problem, somehow we to aligh the path and the model
            craft.rotateOnY((270).toRad());
        })

        renderer.render(s, c);

        var obj = world.targets[0];
        if (!obj || obj.percent > 1.0) {
            world.targets.forEach(function (craft) {
                craft.undraw();
                craft.route.undraw();
            });
            var plane = world.planes.pop();
            if (plane) {
                plane.draw();
                plane.route.draw();
                world.targets = plane ? [plane] : [];

                var arrival = plane.route.leg.arrivalNode;
                arrival.count += plane.route.leg.headCount;
                arrival.visit += 1;
                if (arrival.visit > 1) {
                    updateTower(arrival);
                }

                self.destinationCity = arrival.city;
                $rootScope.$apply();

                var departure = plane.route.leg.departureNode;
                departure.count += plane.route.leg.headCount;
                departure.visit += 1;
                if (departure.visit > 1) {
                    updateTower(departure);
                }
            }
        };
    }


    render3DService.setCustomRenderer(renderCraft);


    function loadTriplegs() {
        dataService.getData('../mock/flowChina.json')
        .then(function (payload) {

            processNode(payload, 'nonusa');
            return dataService.getData('../mock/flowFrance.json')
        })
        .then(function (payload) {
            processNode(payload, 'nonusa');
            return dataService.getData('../mock/flowAustralia.json')
        })
        .then(function (payload) {
            processNode(payload, 'nonusa');
            return dataService.getData('../mock/flowBrazil.json')
        })
        .then(function (payload) {
            processNode(payload, 'nonusa');
            return dataService.getData('../mock/flowCanada.json')
        })
        .then(function (payload) {
            processNode(payload, 'nonusa');
            return dataService.getData('../mock/flowMexico.json')
        })
        .then(function (payload) {
            processNode(payload, 'nonusa');
            return dataService.getData('../mock/flowGerman.json')
        })
        .then(function (payload) {

            processNode(payload, 'nonusa');
            return dataService.getData('../mock/flowUSA.json')
        })
        .then(function (payload) {

            var usa = processNode(payload, 'usa');
            var nonusa = fo.db.getEntityDB('flow::nonusa').items;

            for (var id = 1; id < 1000; id++) {

                var usaNode = usa[fo.tools.randomInt(0, usa.length - 1)];

                var nonuseNode = nonusa[fo.tools.randomInt(0, nonusa.length - 1)];

                var spec = {
                    departureNode: nonuseNode,
                    arrivalNode: usaNode,
                }

                var leg = link.establishInstance(spec, id);
                if (leg.route.length = 0) {
                    return;
                }

                var name = 'Route{0}'.format(id);
                var route = design3DService.newInstance({
                    context: routeDef.newInstance({ myName: name, points: leg.route }),
                    leg: leg,
                });
                world.captureSubcomponent(route, name, true);
            };

            //lets draw all the nodes
            //var routes = world.mySubcomponents()
            //routes.forEach(function (route) {
            //    var arrival = route.leg.arrivalNode;
            //    arrival.count = 4;
            //    createTower(arrival);
            //});


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
                plane.route.draw();
                world.targets = plane ? [plane] : [];
            }

        })
        .catch(function (reason) {
            alert('error ' + reason);
        });
    }



    self.doStart = function () {
        loadTriplegs();
    }

});