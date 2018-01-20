
/// <reference path="../wwwroot/foundry.js" />

var foApp = angular.module('foApp', []);



foApp.controller('workspaceController', function (dataService, ontologyService, render3DService, design3DService) {

    var plane, craft;
    var self = this;

    var scene = render3DService.init('earth');

    function noop() { };

    render3DService.animate();
    render3DService.setAnimation(noop);

    var EARTH_RADIUS = 637;
    var defaultSize = 15;

    self.title = 'flight actions';

    self.doReset = function () {
        render3DService.setAnimation(noop);
        plane.rotateXYZ(0, 0, 0);
        plane.positionXYZ(0, 0, 0);
        plane.scale(defaultSize);
    };

    self.doSpin = function (dir) {
        var angle = 0;
        render3DService.removeGlobe();
        craft.visible(false);
        plane.visible(true);


        func = {
            x: function () {
                plane.rotateXYZ((angle).toRad(), 0, 0);
                angle += 1.0;
            },
            y: function () {
                plane.rotateXYZ(0, (angle).toRad(), 0);
                angle += 1.0;
            },
            z: function () {
                plane.rotateXYZ(0, 0, (angle).toRad());
                angle += 1.0;
            },
        }

        func[dir] && render3DService.setAnimation(func[dir]);
    }

    self.doSlide = function (dir) {
        var delta = 0;
        render3DService.removeGlobe();
        craft.visible(false);
        plane.visible(true);


        func = {
            left: function () {
                plane.positionXYZ(delta, 0, 0);
                delta -= 1.0;
            },
            right: function () {
                plane.positionXYZ(delta, 0, 0);
                delta += 1.0;
            },
            up: function () {
                plane.positionXYZ(0, delta, 0);
                delta += 1.0;
            },
            down: function () {
                plane.positionXYZ(0, delta, 0);
                delta -= 1.0;
            },
            near: function () {
                plane.positionXYZ(0, 0, delta);
                delta += 1.0;
            },
            far: function () {
                plane.positionXYZ(0, 0, delta);
                delta -= 1.0;
            },
        }

        func[dir] && render3DService.setAnimation(func[dir]);
    }

    self.doScale = function (dir) {
        var scale = defaultSize;
        render3DService.removeGlobe();
        craft.visible(false);
        plane.visible(true);


        func = {
            big: function () {
                plane.scale(scale);
                scale += 1.0;
            },
            small: function () {
                plane.scale(scale);
                scale -= 1.0;
            },
        }

        func[dir] && render3DService.setAnimation(func[dir]);
    }

    self.doSize = function (dir) {
        if (plane.size === undefined) {
            plane.size = defaultSize;
        }
        craft.visible(false);
        plane.visible(true);


        func = {
            enlarge: function () {
                plane.scale(plane.size);
                plane.size += 1.0;
            },
            shrink: function () {
                plane.scale(plane.size);
                plane.size -= 1.0;
            },
        }
        func[dir] && func[dir]();

    }

    self.doCircle = function (dir) {
        var angle = 0;
        var center = { x: 0, y: 0, z: 0 };
        render3DService.removeGlobe();
        craft.visible(false);
        plane.visible(true);


        func = {
            left: function () {
                //circle around y axis to the left
                var radius = EARTH_RADIUS;
                center = { x: radius, y: 0, z: radius };
                var rad = (180 + angle).toRad();
                var x = radius * Math.sin(rad) - center.x;
                var z = radius * Math.cos(rad) + center.z;
                plane.positionXYZ(x, 0, z);
                plane.rotateXYZ(0, (angle).toRad(), 0);

                angle += 1.0;
            },
            right: function () {
                //circle around y axis to the left
                var radius = EARTH_RADIUS;
                center = { x: 0, y: 0, z: radius };
                var rad = (angle).toRad();
                var x = -radius * Math.sin(rad) - center.x;
                var z = radius * Math.cos(rad) - center.z;
                plane.positionXYZ(x, 0, z);
                plane.rotateXYZ(0, (-angle).toRad(), 0);
                angle += 1.0;
            },
            up: function () {
                //circle around z axis to inside loop
                var radius = EARTH_RADIUS;
                center = { x: 0, y: radius, z: 0 };
                var rad = (180 + angle).toRad();
                var x = radius * Math.sin(rad) - center.x;
                var y = radius * Math.cos(rad) + center.y;
                plane.positionXYZ(x, y, 0);
                plane.rotateXYZ(0, 0, (-angle).toRad());

                angle += 1.0;
            },
            down: function () {
                //circle around z axis to outside loop
                var radius = EARTH_RADIUS;
                center = { x: 0, y: radius, z: 0 };
                var rad = (angle).toRad();
                var x = -radius * Math.sin(rad) + center.x;
                var y = radius * Math.cos(rad) - center.y;
                plane.positionXYZ(x, y, 0);
                plane.rotateXYZ(0, 0, (angle).toRad());

                angle += 1.0;
            },
            near: function () {
                //circle around x axis towards me
                var radius = EARTH_RADIUS;
                center = { x: radius, y: 0, z: 0 };
                var rad = (angle).toRad();
                var z = radius * Math.sin(rad) + center.z;
                var y = radius * Math.cos(rad) - center.y;
                plane.positionXYZ(0, y, z);
                plane.rotateXYZ(0, (90).toRad(), (angle).toRad());

                angle += 1.0;
            },
            far: function () {
                //circle around x axis towards me
                var radius = EARTH_RADIUS;
                center = { x: radius, y: 0, z: 0 };
                var rad = (angle).toRad();
                var z = -radius * Math.sin(rad) + center.z;
                var y = radius * Math.cos(rad) - center.y;
                plane.positionXYZ(0, y, z);
                plane.rotateXYZ(0, (-90).toRad(), (angle).toRad());

                angle += 1.0;
            },
        }

        func[dir] && render3DService.setAnimation(func[dir]);
    }


    self.doCircleGlobe = function (dir) {
        var angle = 0;
        var center = { x: 0, y: 0, z: 0 };

        var radius = EARTH_RADIUS + 20;
        render3DService.addGlobe(true, EARTH_RADIUS);
        craft.visible(true);
        plane.visible(false);


        func = {
            left: function () {
                //circle around y axis to the left
                center = { x: 0, y: 0, z: 0 };
                var rad = (angle).toRad();
                var x = -radius * Math.sin(rad) + center.x;
                var z = radius * Math.cos(rad) + center.z;
                craft.positionXYZ(x, 0, z);
                craft.rotateOnY((-1).toRad());
                //craft.rotateOnX((-1).toRad());
                //craft.rotateXYZ((90).toRad(), (0).toRad(), (0).toRad());
                angle += 1.0;
            },
            right: function () {
                //circle around y axis to the left
                var radius = EARTH_RADIUS;
                center = { x: 0, y: 0, z: radius };
                var rad = (angle).toRad();
                var x = -radius * Math.sin(rad) - center.x;
                var z = radius * Math.cos(rad) - center.z;
                plane.positionXYZ(x, 0, z);
                plane.rotateXYZ(0, (-angle).toRad(), 0);
                angle += 1.0;
            },
            up: function () {
                //circle around z axis to inside loop
                var radius = EARTH_RADIUS;
                center = { x: 0, y: radius, z: 0 };
                var rad = (180 + angle).toRad();
                var x = radius * Math.sin(rad) - center.x;
                var y = radius * Math.cos(rad) + center.y;
                plane.positionXYZ(x, y, 0);
                plane.rotateXYZ(0, 0, (-angle).toRad());

                angle += 1.0;
            },
            down: function () {
                //circle around z axis to outside loop
                var radius = EARTH_RADIUS;
                center = { x: 0, y: radius, z: 0 };
                var rad = (angle).toRad();
                var x = -radius * Math.sin(rad) + center.x;
                var y = radius * Math.cos(rad) - center.y;
                plane.positionXYZ(x, y, 0);
                plane.rotateXYZ(0, 0, (angle).toRad());

                angle += 1.0;
            },
            near: function () {
                //circle around x axis towards me
                var radius = EARTH_RADIUS;
                center = { x: radius, y: 0, z: 0 };
                var rad = (angle).toRad();
                var z = radius * Math.sin(rad) + center.z;
                var y = radius * Math.cos(rad) - center.y;
                plane.positionXYZ(0, y, z);
                plane.rotateXYZ(0, (90).toRad(), (angle).toRad());

                angle += 1.0;
            },
            far: function () {
                //circle around x axis towards me
                var radius = EARTH_RADIUS;
                center = { x: radius, y: 0, z: 0 };
                var rad = (angle).toRad();
                var z = -radius * Math.sin(rad) + center.z;
                var y = radius * Math.cos(rad) - center.y;
                plane.positionXYZ(0, y, z);
                plane.rotateXYZ(0, (-90).toRad(), (angle).toRad());

                angle += 1.0;
            },
        }

        func[dir] && render3DService.setAnimation(func[dir]);
    }


    var ports = [
                  {
                      "id": 13,
                      "countryCode": "AU",
                      "city": "Sydney",
                      "lat": -33.86767,
                      "lng": 151.2094
                  },
                  {
                      "id": 113,
                      "countryCode": "US",
                      "city": "Minneapolis",
                      "lat": 45.0159,
                      "lng": -93.4719
                  },
                    {
                        "id": 252,
                        "countryCode": "SE",
                        "city": "Stockholm",
                        "lat": 59.3326,
                        "lng": 18.0649
                    },
                  {
                      "id": 982,
                      "countryCode": "FR",
                      "city": "Lyon",
                      "lat": 45.7485,
                      "lng": 4.8467
                  },
                  {
                      "id": 983,
                      "countryCode": "US",
                      "city": "Norfolk",
                      "lat": 36.9312,
                      "lng": -76.2397
                  },
    ];

    var airportType = fo.establishType('cad::block', {
        type: 'block',
        width: 5,
        height: 5,
        depth: 5,
    }, fo.Component);


    self.doCenterGlobe = function (dir) {

        var scale = 15;
        var base = 1.0 * EARTH_RADIUS;
        var radius = base + 20;
        render3DService.addGlobe(false, base);
        craft.visible(true);
        plane.visible(false);

        var GrannyKnot = new THREE.Curves.GrannyKnot();

        var tube = new THREE.TubeGeometry(GrannyKnot, 100, 2, 4, true);
        var tubeMesh = THREE.SceneUtils.createMultiMaterialObject(tube, [
            new THREE.MeshLambertMaterial({
                color: 0xff00ff
            }),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                opacity: 0.3,
                wireframe: true,
                transparent: true
            })]);

        tubeMesh.scale.set(scale, scale, scale);
        scene.add(tubeMesh);

        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0, 1);
        scene.add(light);


        var parent = new THREE.Object3D();
        //parent.position.y = 100;
        scene.add(parent);

        var splineCamera = new THREE.PerspectiveCamera(84, window.innerWidth / window.innerHeight, 0.01, 1000);
        parent.add(splineCamera);

        var cameraHelper = new THREE.CameraHelper(splineCamera);
        parent.add(cameraHelper);

        // Debug point

        var cameraEye = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshBasicMaterial({ color: 0xdddddd }));
        parent.add(cameraEye);

        function renderCraft(renderer, s, c) {
            // Try Animate Camera Along Spline
            var time = Date.now();
            var looptime = 20 * 1000;
            var t = (time % looptime) / looptime ;

            craft.gotoSphereArc(self.flightPath.geometry, t);

            splineCamera.position.copy(craft.getPosition());
            splineCamera.rotation.copy(craft.getRotation());
            cameraHelper.update();

            cameraEye.position.copy(craft.getPosition());
            cameraEye.rotation.copy(craft.getRotation());

            craft.rotateOnY((270).toRad());

            renderer.render(s, c);
        }

        function renderCamera(renderer, s, c) {
            // Try Animate Camera Along Spline
            var time = Date.now();
            var looptime = 20 * 1000;
            var t = (time % looptime) / looptime;

            craft.gotoSphereArc(self.flightPath.geometry, t);

            splineCamera.position.copy(craft.getPosition());
            splineCamera.rotation.copy(craft.getRotation());

            cameraEye.position.copy(craft.getPosition());
            cameraEye.rotation.copy(craft.getRotation());

            cameraHelper.update();
            craft.rotateOnY((270).toRad());

            renderer.render(s, splineCamera);
        }



        var func = {
            render: function () {
                //render3DService.removeGlobe();
                craft.visible(true);
                return renderCraft;
            },
            drive: function () {
                //render3DService.removeGlobe();
                craft.visible(false);
                return renderCamera;
            },
        }

        var init = {
            ports: function () {

                var material = {
                    ambient: 0x000000,
                    color: 0xff0077,
                    specular: 0x999999,
                    shininess: 100,
                    shading: THREE.SmoothShading,
                    opacity: 0.6,
                    transparent: true
                };

                render3DService.definePrimitive('Airport',
                {
                    type: 'block',
                    width: 15,
                    height: 15,
                    depth: 15,
                }, material)
                .then(function (airportModel) {

                    ports.forEach(function (port) {
                        var context = airportType.newInstance({ myName: port.city });
                        var obj = design3DService.newInstance({
                            context: context,
                            model: airportModel,
                            position: render3DService.llToPosition(port.lat, port.lng, base),
                        });
                        obj.draw(); //asking for geom forces it to draw
                    });
                    render3DService.renderScene();
                    render3DService.setAnimation(noop);

                 });


            },

            routes: function () {
                var last;
                var points = [];
                ////circle around y axis to the left
                ports.forEach(function (port) {
                    if (!last) {
                        last = port;
                        return;
                    }

                    var bearing = render3DService.llToBearing(last.lat, last.lng, port.lat, port.lng);
                    var distance = render3DService.llToDistance(last.lat, last.lng, port.lat, port.lng, radius);
                    var dist = 0;
                    var step = distance / 20;
                    while (dist < distance) {
                        var point = render3DService.llToDestinationPosition(last.lat, last.lng, bearing, dist, radius);
                        points.push(point);
                        dist += step;
                    }
                    last = port;
                });

                var routeDef = fo.establishType('xxx::route', {
                    type: 'tube',
                    points: [],
                });

                var context = routeDef.newInstance({ myName: 'basic route', points: points });
                self.flightPath = design3DService.newInstance({
                    context: context,
                });
                self.flightPath.draw(); //asking for geom forces it to draw

                render3DService.renderScene();
                render3DService.setAnimation(noop);
            },

        }

        init[dir] && render3DService.setAnimation(init[dir]);
        func[dir] && render3DService.setCustomRenderer(func[dir]());
    }






    render3DService.defineModel('707', 'models/707.js')
    .then(function (planeModel) {

        plane = planeModel.newInstance().draw();
        self.doStop = function () {
            render3DService.setAnimation(noop);
            plane.scale(defaultSize);
        };

        self.doStop();
    });

    render3DService.defineModel('beech99', 'models/beech99.js')
    .then(function (planeModel) {

        craft = planeModel.newInstance().draw();
        craft.scale(5);
        craft.visible(false);
    });
});