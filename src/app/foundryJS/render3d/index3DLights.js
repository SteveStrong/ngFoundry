
/// <reference path="../wwwroot/foundry.js" />

var foApp = angular.module('foApp', []);


foApp.controller('workspaceController', function (dataService, renderDisplay3D, designModel3D, $rootScope) {

    var self = this;
    self.title = 'Lights ';

    var display = renderDisplay3D.create('stage');
    display.add(new THREE.AxisHelper(100));
    display.add(new THREE.GridHelper(100, 10));

    display.cameraPosition(0, 200, 200);
    display.startAnimate();

    //add some lights
    //http://solutiondesign.com/blog/-/blogs/webgl-and-three-js-lighting/

    var floorMat = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('assets/world-big-2-gray.jpg') });
    var cube = new THREE.CubeGeometry(200, 1, 200);
    var floor = new THREE.Mesh(cube, floorMat);
    display.add(floor);

    var lights = [];
    function moveXZ(delta, obj, start) {
        var angle = (delta * 360 + start).toRad();
        var x = 70 * Math.sin(angle);
        var y = 30 * Math.sin(angle) + 30;
        var z = 70 * Math.cos(angle);

        obj.position.set(x, y, z);
    }

    function moveXY(delta, obj, start) {
        var angle = (delta * 360 + start).toRad();
        var x = 70 * Math.sin(angle);
        var y = 70 + 70 * Math.cos(angle);
        var z = 30 * Math.sin(angle) + 30;

        obj.position.set(x, y, z);
    }

    function moveYZ(delta, obj, start) {
        var angle = (delta * 360 + start).toRad();
        var x = 30 * Math.sin(angle) + 30;
        var y = 70 + 70 * Math.sin(angle);
        var z = 70 * Math.cos(angle);

        obj.position.set(x, y, z);
    }

    var lightSpec = [
        { type: 'point', color: 0x0033ff, intensity: 1, distance: 150, angle: 0 },
        { type: 'point', color: 0x33ff00, intensity: 1, distance: 150, angle: 90 },
        { type: 'point', color: 0xff0033, intensity: 1, distance: 150, angle: 180 },
        { type: 'point', color: 0xff00ff, intensity: 1, distance: 150, angle: 270 }
    ]

    lightSpec.forEach(function (spec) {
        display.addLight(spec, function (light) {
            function render(t) {
                moveXZ(t, light, spec.angle)
            }
            lights.push(render);
            display.add(new THREE.PointLightHelper(light, 3));
        });
    });

    lightSpec.forEach(function (spec) {
        display.addLight(spec, function (light) {
            function render(t) {
                moveYZ(t, light, spec.angle)
            }
            lights.push(render);
            display.add(new THREE.PointLightHelper(light, 3));
        });
    })

    lightSpec.forEach(function (spec) {
        display.addLight(spec, function (light) {
            function render(t) {
                moveXY(t, light, spec.angle)
            }
            lights.push(render);
            display.add(new THREE.PointLightHelper(light, 3));
        });
    })


    function renderLights(renderer, s, c) {
        var time = Date.now();
        var looptime = 36 * 50;
        var t = (time % looptime) / looptime;

        //adjust to position of each light
        lights.forEach(function (light) {
            light(t);
        });
        renderer.render(s, c);
    }
    display.setCustomRenderer(renderLights);


    var space = fo.makeModelWorkspace('workspace', undefined, {
    });

    var rootModel = space.rootModel;

    var viewModel = designModel3D.newInstance({
        myName: space.myName,
        context: rootModel,
        geom: function () {
            return designModel3D.rootGeom();
        },
    });


    var mixin1 = {
        material: {
            map: THREE.ImageUtils.loadTexture("assets/code.png"),
            shininess: 0.9,
            color: 0xffffff
        }
    }
    var mixin2 = {
        material: {
            map: THREE.ImageUtils.loadTexture("assets/edwards.png"),
            shininess: 0.9,
            color: 0xffffff
        }
    }
    

    var towerType = fo.defineType('lights::tower', {
        type: 'block', //to draw on 3d workd, use this type  NO TYPE means geometry obj
        material: {
            color: 0xff0000,
        },
        depth: 10,
        width: 10,
        height: 40,
    }, fo.Component);

    var towerShape = designModel3D.defineType('three::tower', {
        context: {},
        doOrientation: function (geom) {
        },
        position: function () {
            return new THREE.Vector3(0, this.context.height / 2, 0);
        },
    });
    

    function addTower() {
        var shape = towerShape.newInstance({
            context: towerType.newInstance({}, undefined, rootModel),
            position: function () {
                return new THREE.Vector3(0, this.context.height / 2, 0);
            }
        },
        undefined, viewModel)

        shape.draw();
    }

    function addRawTower(spec) {
        var shape = towerShape.newInstance({
            context: towerType.newInstance(spec),
            position: function () {
                return new THREE.Vector3(0, this.context.height / 2, 0);
            }
        });
        
        shape.draw();
        return shape;
    }
    


    var rawtower;
    self.doStart = function () {
        //addTower();
        rawtower = addRawTower(mixin2);

        //add some lights
    }

    self.doHigher = function () {
        //addTower();
        rawtower.context.height += 20;
        rawtower.draw();
    }

    self.doSquare = function () {
        //addTower();
        var context = rawtower.context;
        context.width = context.depth = context.height;
        rawtower.draw();
    }

    self.doChangeMaterial = function () {
        //addTower();
        rawtower.context.material = mixin1.material;
        rawtower.draw();
    }




});