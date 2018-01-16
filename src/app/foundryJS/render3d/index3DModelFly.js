
/// <reference path="../wwwroot/foundry.js" />

var foApp = angular.module('foApp', []);



foApp.controller('viewerController', function (dataService, ontologyService, design3DService,  render3DService) {

    var EARTH_RADIUS = 637;

    render3DService.init('earth');
    render3DService.animate();
        
    render3DService.addGlobe();
        
    var planes = [];

   
    var world = fo.makeComponent({
        planes: [],
    });

    var routeDef = fo.establishType('demo::route', {
        type: 'tube',
        points: [],
    });


    function createRoutesHorizontal(min, max) {
        var routes = [];
        for (var lat = min; lat <= max; lat += 10) {

            var points = [];

            for (var lng = -180; lng <= 180; lng += 10) {
                var pos = render3DService.llToPosition(lat, lng, EARTH_RADIUS, 10);
                points.push(pos);
            }

            var name = 'H{0}-{1}'.format(lat, lng);
            var context = routeDef.newInstance({ myName: name, points: points });
            var route = design3DService.newInstance({
                context: context,
            }).draw();
            routes.push(route);
            world.captureSubcomponent(route, name, true);
        }
        return routes;
    }

    function createRoutesVertical(min, max) {
        var routes = [];
        for (var lng = min; lng <= max; lng += 10) {

            var points = [];

            for (var lat = -180; lat <= 180; lat += 10) {
                var pos = render3DService.llToPosition(lat, lng, EARTH_RADIUS, 20);
                points.push(pos);
            }

            var name = 'V{0}-{1}'.format(lat, lng);
            var context = routeDef.newInstance({ myName: name, points: points });
            var route = design3DService.newInstance({
                context: context,
            }).draw();
            routes.push(route)
            world.captureSubcomponent(route, name, true);
        }
        return routes;
    }

    var routesH1 = createRoutesHorizontal(-85, 5);
    var routesH2 = createRoutesHorizontal(5, 85);
    var routesV1 = createRoutesVertical(0, 90);
    var routesV2 = createRoutesVertical(100, 180);

    render3DService.defineModel('707', 'models/707.js')
    .then(function (planeModel) {

        routesV1.forEach(function (route) {
            var plane = planeModel.newInstance({
                route: route,
            }).draw();
            world.planes.push(plane);
        });

        return render3DService.defineModel('beech99', 'models/beech99.js')
    })
    .then(function (planeModel) {

        routesH1.forEach(function (route) {
            var plane = planeModel.newInstance({
                route: route,
            }).draw();
            world.planes.push(plane);
        });

        return render3DService.defineModel('c-2a', 'models/c-2a.js')
    })
    .then(function (planeModel) {

        routesH2.forEach(function (route) {
            var plane = planeModel.newInstance({
                route: route,
            }).draw();
            world.planes.push(plane);
        });

        routesV2.forEach(function (route) {
            var plane = planeModel.newInstance({
                route: route,
            }).draw();
            world.planes.push(plane);
        });
    });

    function renderCraft(renderer, s, c) {
        // Try Animate Camera Along Spline
        var time = Date.now();
        var looptime = 20 * 1000;
        var t = (time % looptime) / looptime;

        world.planes.forEach(function (plane) {
            var route = plane.route;
            plane.gotoSphereArc(route.geometry, t);
            plane.rotateOnY((270).toRad());

        });

        renderer.render(s, c);
    }


    render3DService.setCustomRenderer(renderCraft);


});