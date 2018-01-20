
/// <reference path="../wwwroot/foundry.js" />

var foApp = angular.module('foApp', []);



foApp.controller('viewerController', function (dataService, ontologyService, designModel3D, renderDisplay3D) {

    var EARTH_RADIUS = 637;

    var display = renderDisplay3D.create('earth')
         .cameraPosition(0, 0, 1000)
         .startAnimate();
        
    renderDisplay3D.addGlobe(display);


    var routeDef = fo.establishType('demo::route', {
        type: 'tube',
        points: [],
    });


    function createRoutesHorizontal(min, max) {
        var routes = [];
        for (var lat = min; lat <= max; lat += 10) {

            var points = [];

            for (var lng = -180; lng <= 180; lng += 10) {
                var pos = renderDisplay3D.llToPosition(lat, lng, EARTH_RADIUS);
                points.push(pos);
            }

            var name = 'H{0}-{1}'.format(lat, lng);
            var route = designModel3D.newInstance({
                context: routeDef.newInstance({ myName: name, points: points }),
            }).draw();
            routes.push(route);
        }
        return routes;
    }

    function createRoutesVertical(min, max) {
        var routes = [];
        for (var lng = min; lng <= max; lng += 10) {

            var points = [];

            for (var lat = -180; lat <= 180; lat += 10) {
                var pos = renderDisplay3D.llToPosition(lat, lng, EARTH_RADIUS);
                points.push(pos);
            }

            var name = 'V{0}-{1}'.format(lat, lng);
            var context = routeDef.newInstance({ myName: name, points: points });
            var route = designModel3D.newInstance({
                context: context,
            }).draw();
            routes.push(route)
        }
        return routes;
    }

    var routesH1 = createRoutesHorizontal(-85, 5);
    var routesH2 = createRoutesHorizontal(5, 85);
    var routesV1 = createRoutesVertical(0, 90);
    var routesV2 = createRoutesVertical(100, 180);

    var parent = new THREE.Object3D();
    display.add(parent);

    var root = {
        mesh: parent,
    }

    var material = {
        //ambient: 0x000000,
        color: 0xff0077,
        specular: 0x999999,
        shininess: 100,
        shading: THREE.SmoothShading,
        opacity: 0.6,
        transparent: true
    };

    renderDisplay3D.definePrimitive('tower',
    {
        type: 'block',
        width: 10,
        height: function () { return 100 * Math.random() +  this.width },
        depth: function () { return this.width * 2.0 }
    }, material)
    .then(function (block) {
        routesV1.forEach(function (route) {
            var total = routesH1.length + routesH2.length;
            for (var i = 0; i < total; i++) {
                var model = block.newInstance({
                    route: route,
                    percent: i / total,
                }).draw(root);

                model.gotoSphereArc(route.geometry, model.percent);
                //model.moveY(model.geometrySpec.height() / 2);
            }
        });

    }).catch(function (e) {
        alert(e);
    });



});