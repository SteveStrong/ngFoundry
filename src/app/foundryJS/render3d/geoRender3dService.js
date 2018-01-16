// angular service directive

var Globe3D = Globe3D || {};
var Foundry = Foundry || {};

(function (fo, geo, undefined) {

    //Earth radius is the distance from the Earth's center to its surface, about 6,371 kilometers (3,959 mi). 

    var camera, scene, renderer, controls, earth;
    var rotateMe;

    var EARTH_RADIUS = 637;

    // couple of constants
    var POS_X = 1800;
    var POS_Y = 500;
    var POS_Z = 1800;
    var WIDTH = 1000;
    var HEIGHT = 600;

    var FOV = 45;
    var NEAR = 1;
    var FAR = 4000;

    //vars
    var goLeft = false;
    var goRight = false;
    var goUp = false;
    var goDown = false;

    var rotationx = rotationy = rotationz = 0

    var _q1 = new THREE.Quaternion(); // CHANGED
    var axisX = new THREE.Vector3(1, 0, 0); // CHANGED
    var axisZ = new THREE.Vector3(0, 0, 1); // CHANGED

    function rotateOnAxis(object, axis, angle) { // CHANGED
        _q1.setFromAxisAngle(axis, angle);
        object.quaternion.multiplySelf(_q1);
    }

    //arrow keys pressed
    document.addEventListener("keydown", keyDownTextField, false);
    function keyDownTextField(e) {
        if (e.keyCode == 37) {  //left arrow
            goLeft = true
            goRight = false
        }
        if (e.keyCode == 39) { //right arrow
            goRight = true
            goLeft = false
        }
        if (e.keyCode == 38) {  //up arrow
            goDown = true
            goUp = false
        }
        if (e.keyCode == 40) { //down arrow
            goUp = true
            goDown = false
        }
    };

    document.addEventListener("keyup", keyUpTextField, false);

    function keyUpTextField(e) {
        goLeft = false
        goRight = false
        goUp = false
        goDown = false
    };

    function init() {

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.z = 1000;

        scene = new THREE.Scene();

        var color = [0xff0000, 0x00ff00, 0x0000ff, 0x111111];


        for (var i = 1; i < 2; i++) {
            geometry = new THREE.BoxGeometry(i * 100, i * 100, i * 100);
            material = new THREE.MeshBasicMaterial({
                color: color[i - 1],
                wireframe: true
            });

            mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            mesh.position.setX((i - 1) * 200);
            allItems.push(mesh);
        }

        group = new THREE.Object3D();
        scene.add(group);
        //mesh.rotateOnAxis(axis, 1);
        allItems.push(group);

        function getLongLat(str) {
            var pos = str.split(',');
            return {
                lng: parseFloat(pos[0]),
                lat: parseFloat(pos[1]),
            }
        }

        function getLongLatPath(str) {
            var pos = str.split(',');
            var total = pos.length / 2;

            var path = [];
            for (var i = 0; i < total; i += 2) {
                var point = {
                    lng: parseFloat(pos[i]),
                    lat: parseFloat(pos[i + 1]),
                }
                path.push(point)
            }
            return path;
        }

        function sphere(lon, lat, radius) {
            var cosLat = Math.cos(lat * Math.PI / 180.0);
            var sinLat = Math.sin(lat * Math.PI / 180.0);
            var cosLon = Math.cos(lon * Math.PI / 180.0);
            var sinLon = Math.sin(lon * Math.PI / 180.0);

            var rad = radius ? radius : 500.0;
            return [rad * cosLat * cosLon, rad * cosLat * sinLon, rad * sinLat];
        };

        var material1 = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: false
        });
        var geometry1 = new THREE.BoxGeometry(5, 5, 5);


        var pointDB = fo.db.getEntityDB('spike::point');
        fo.establishType('spike::point', {

            loc: function () {
                var point = {
                    lng: this.longitude,
                    lat: this.latitude,
                }
                return point;
            },
            pos: function () {
                return sphere(this.loc.lng, this.loc.lat, 490);
            },
            mesh: function () {
                var mesh = new THREE.Mesh(geometry1, material1);
                mesh.position.setX(this.pos[0]);
                mesh.position.setY(this.pos[1]);
                mesh.position.setZ(this.pos[2]);
                return mesh;
            },
        });

        var borderDB = fo.db.getEntityDB('spike::border');
        fo.establishType('spike::border', {
            region: 'xxx',
            members: [],
            pointList: function () {
                var pnts = this.members.map(function (item) {
                    var point = {
                        lng: item.longitude,
                        lat: item.latitude,
                        order: item.sortOrder,
                    }
                    return point;
                });
                return pnts;
            },

            path: function () {
                var geometry = new THREE.Geometry();
                var material = new THREE.LineBasicMaterial({
                    color: 0x00ffff,
                });

                this.pointList.forEach(function (point) {
                    loc = sphere(point.lng, point.lat, 500);
                    geometry.vertices.push(new THREE.Vector3(loc[0], loc[1], loc[2]));
                });

                var line = new THREE.Line(geometry, material);
                return line;
            },
            label: function () {
                var label = makeTextSprite(this.name,
                 {
                     fontsize: 10,
                     borderColor: { r: 255, g: 0, b: 0, a: 1.0 },
                     backgroundColor: { r: 255, g: 100, b: 0, a: 0.7 },
                 });

                label.position.setX(this.pos[0]);
                label.position.setY(this.pos[1]);
                label.position.setZ(this.pos[2]);
                return label;
            }
        });


        function createBoundryPoints(item) {

            var point = {
                region: item.ofo_rgn,
                latitude: item.latitude,
                longitude: item.longitude,
                order: item.sort_order,
            };

            var obj = pointDB.establishInstance(point);
            return obj;
        }

        function createRegions() {
            var groups = fo.listOps.applyGrouping(pointDB.items, 'region');

            fo.tools.forEachKeyValue(groups, function (key, value) {
                var sorted = fo.listOps.applySort(value, 'order(a)');
                var region = {
                    region: key,
                    members: sorted,
                };
                borderDB.establishInstance(region, key);
            });

            return borderDB.items;

        }

        ////world
        geometry = new THREE.SphereGeometry(480, 32, 32);
        material = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            wireframe: true
        });
        mesh = new THREE.Mesh(geometry, material);
        //group.add(mesh);



        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(renderer.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        window.addEventListener('resize', onWindowResize, false);


    }
    //http://www.scriptscoop.com/t/62f18019fdd8/javascript-three-js-rotate-tetrahedron-on-correct-axis.html
    //http://www.scriptscoop.com/t/dbc815ad59eb/c-how-to-rotate-an-object-about-its-own-axis.html
    //http://stackoverflow.com/questions/11060734/how-to-rotate-a-3d-object-on-axis-three-js

    // Rotate an object around an arbitrary axis in object space
    var rotObjectMatrix;
    function rotateAroundObjectAxis(object, axis, radians) {
        rotObjectMatrix = new THREE.Matrix4();
        rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

        // old code for Three.JS pre r54:
        // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
        // new code for Three.JS r55+:
        object.matrix.multiply(rotObjectMatrix);

        // old code for Three.js pre r49:
        // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
        // old code for Three.js r50-r58:
        // object.rotation.setEulerFromRotationMatrix(object.matrix);
        // new code for Three.js r59+:
        object.rotation.setFromRotationMatrix(object.matrix);
    }

    var rotWorldMatrix;
    // Rotate an object around an arbitrary axis in world space       
    function rotateAroundWorldAxis(object, axis, radians) {
        rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

        // old code for Three.JS pre r54:
        //  rotWorldMatrix.multiply(object.matrix);
        // new code for Three.JS r55+:
        rotWorldMatrix.multiply(object.matrix);                // pre-multiply

        object.matrix = rotWorldMatrix;

        // old code for Three.js pre r49:
        // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
        // old code for Three.js pre r59:
        // object.rotation.setEulerFromRotationMatrix(object.matrix);
        // code for r59+:
        object.rotation.setFromRotationMatrix(object.matrix);
    }

    //So you should call these functions within your anim function (requestAnimFrame callback), resulting in a rotation of 90 degrees on the x-axis:
     //   var xAxis = new THREE.Vector3(1,0,0);
    //    rotateAroundWorldAxis(mesh, xAxis, Math.PI / 180);


    //http://www.smartjava.org/content/render-open-data-3d-world-globe-threejs
    // convert the positions from a lat, lon to a position on a sphere.
    function latLongToVector3(lat, lon, radius, heigth) {
        var phi = (lat) * Math.PI / 180;
        var theta = (lon - 180) * Math.PI / 180;

        var x = -(radius + heigth) * Math.cos(phi) * Math.cos(theta);
        var y = (radius + heigth) * Math.sin(phi);
        var z = (radius + heigth) * Math.cos(phi) * Math.sin(theta);

        return new THREE.Vector3(x, y, z);
    }



    geo.init = function (id, showEarth) {
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.z = 3 * EARTH_RADIUS;

        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(renderer.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        if (showEarth) {
            earth = addEarth();
        } else {
            ////world
            var geometry = new THREE.SphereGeometry(EARTH_RADIUS, 32, 32);
            var material = new THREE.MeshBasicMaterial({
                    color: 0x0000ff,
            wireframe: true
            });
            earth = new THREE.Mesh(geometry, material);
            scene.add(earth);
        }

        earth.useQuaternion = true; // CHANGED

        //var axes = new THREE.AxisHelper();
        //earth.add(axes);  // CHANGED


        addLights();
        addLight();
        geo.render();


        // Note: if imported model appears too dark,
        //   add an ambient light in this file
        //   and increase values in model's exported .js file
        //    to e.g. "colorAmbient" : [0.75, 0.75, 0.75]
        var jsonLoader = new THREE.JSONLoader();
        //jsonLoader.load("models/707.js", addModelToScene);
        //jsonLoader.load("models/android.js", addModelToScene);
        //jsonLoader.load("models/beech99.js", addModelToScene);
        //jsonLoader.load("models/c-2a.js", addModelToScene);
        //jsonLoader.load("models/pa18.js", addModelToScene);
        // addModelToScene function is called back after model has loaded

        //var ambientLight = new THREE.AmbientLight(0x111111);
        //scene.add(ambientLight);

        function addModelToScene(geometry, materials) {
            var material = new THREE.MeshFaceMaterial(materials);
            model = new THREE.Mesh(geometry, material);
            model.scale.set(10, 10, 10);
            scene.add(model);
        }
    }

    geo.render = function() {
        controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

        if (goLeft)
            rotateOnAxis(earth, axisZ, 0.08); // CHANGED

        if (goRight)
            rotateOnAxis(earth, axisZ, -0.08); // CHANGED

        if (goUp)
            rotateOnAxis(earth, axisX, 0.08); // CHANGED

        if (goDown)
            rotateOnAxis(earth, axisX, -0.08); // CHANGED

        renderer.render(scene, camera);
    }

    geo.createLabelGroup = function (config) {
    }
    geo.createLabelOptions = function () {
    }
    geo.addLabel = function () {
    }

    var models = {};
    geo.loadModels = function (onComplete) {
        var jsonLoader = new THREE.JSONLoader();
        jsonLoader.load("models/707.js", function (geometry, materials) {
            var material = new THREE.MeshFaceMaterial(materials);
            model = new THREE.Mesh(geometry, material);
            //model.scale.set(10, 10, 10);

            models['707'] = {
                geometry: geometry,
                material: new THREE.MeshFaceMaterial(materials),
                model: new THREE.Mesh(geometry, material),
            }
            onComplete && onComplete(models)
        });
    }





    geo.createPlacemarkGroup = function (type) {

        var group = new THREE.Object3D();
        scene.add(group);

        if ('flight'.matches(type)) {
            group.commonSpec = {
                material: new THREE.MeshBasicMaterial({
                    color: 0xffff00,
                    wireframe: false
                }),

                geometry: new THREE.BoxGeometry(15, 5, 5),
                model: models['707'],
            };
            rotateMe = group;
        }
        if ('airport'.matches(type)) {
            group.commonSpec = {
                material: new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                    wireframe: false
                }),

                geometry: new THREE.BoxGeometry(5, 5, 5)
            }
        }
        if ('location'.matches(type)) {
            group.commonSpec = {
                material: new THREE.MeshBasicMaterial({
                    color: 0xff00ff,
                    wireframe: false
                }),

                geometry: new THREE.BoxGeometry(15, 15, 15)
            }
        }
        return group;
    }

    geo.clearPlacemarkGroup = function (group) {
    }


    geo.addPlacemark = function (group, item, pos, icon, scale, heading) {

        var mesh;
        var model = group.commonSpec.model;
        if (model) {
            mesh = new THREE.Mesh(model.geometry, model.material);
            mesh.rotation.x = Math.PI / 180;
            mesh.rotation.y = Math.PI / 180;
        } else {
            mesh = new THREE.Mesh(group.commonSpec.geometry, group.commonSpec.material);
        }
        mesh.position.setX(pos.x)
        mesh.position.setY(pos.y);
        mesh.position.setZ(pos.z);

        group.add(mesh);
        return mesh;
    }

    geo.createPosition = function (latitude, longitude, height) {
        var pos = latLongToVector3(latitude, longitude, EARTH_RADIUS, height || 0)
        return pos;
    }

    geo.createPolylineGroup = function (type, config) {
        var group = new THREE.Object3D();
        scene.add(group);

        if ('flight'.matches(type)) {
            group.commonSpec = {
                material: new THREE.LineBasicMaterial({
                    color: 0x00ffff,
                }),
            }
        }
        if ('region'.matches(type)) {
            group.commonSpec = {
                material: new THREE.LineBasicMaterial({
                    color: 0x00ffff,
                }),
            }
        }
        return group;
    }

    geo.Color = {
        fromCssColorString: function () {

        }
    }

    geo.clearPolylineGroup = function (group) {
    }

    geo.addPolyline = function (group, positions) {

        var geometry = new THREE.Geometry();
 
        positions.forEach(function (point) {
            geometry.vertices.push(point);
        });

        var line = new THREE.Line(geometry, group.commonSpec.material);
        group.add(line);
        return line;
    }

    geo.registerSelectionCallback = function (group, itemSelected, action) {
    };

    //http://stackoverflow.com/questions/1293147/javascript-code-to-parse-csv-data

    //http://learningthreejs.com/blog/2013/09/16/how-to-m    
    //http://www.smartjava.org/content/render-open-data-3d-world-globe-threejs
    // add the earth
    function addEarth() {
        var spGeo = new THREE.SphereGeometry(EARTH_RADIUS, 50, 50);
        var planetTexture = THREE.ImageUtils.loadTexture("assets/world-big-2-grey.jpg");
        var mat2 = new THREE.MeshPhongMaterial({
            map: planetTexture,
            shininess: 0.2
        });
        var mesh = new THREE.Mesh(spGeo, mat2);
        scene.add(mesh);
        return mesh;
    }

    geo.addEarth = addEarth;

    // add a simple light
    function addLights() {
        light = new THREE.DirectionalLight(0x3333ee, 3.5, 500);
        scene.add(light);
        light.position.set(POS_X, POS_Y, POS_Z);
    }
    geo.addLights = addLights

    function addLight() {
        light = new THREE.AmbientLight(0x808080); // soft white light
        scene.add(light);
    }
    geo.addLight = addLight;

    function animate() {
        requestAnimationFrame(animate);

        controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

        rotateMe && rotateMe.children.forEach(function (item) {
            item.rotation.x += 0.01;
            item.rotation.y += 0.02;
        });


        renderer.render(scene, camera);
    }
    geo.animate = animate;



    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function makeTextSprite(message, parameters) {
        if (parameters === undefined) parameters = {};

        var fontface = parameters.hasOwnProperty("fontface") ?
            parameters["fontface"] : "Arial";

        var fontsize = parameters.hasOwnProperty("fontsize") ?
            parameters["fontsize"] : 18;

        var borderThickness = parameters.hasOwnProperty("borderThickness") ?
            parameters["borderThickness"] : 4;

        var borderColor = parameters.hasOwnProperty("borderColor") ?
            parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
            parameters["backgroundColor"] : { r: 255, g: 255, b: 255, a: 1.0 };

        //var spriteAlignment = parameters.hasOwnProperty("alignment") ?
        //	parameters["alignment"] : THREE.SpriteAlignment.topLeft;

        var spriteAlignment = new THREE.Vector2(1, -1); //THREE.SpriteAlignment.topLeft;


        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;

        // get size data (height depends only on font size)
        var metrics = context.measureText(message);
        var textWidth = metrics.width;

        // background color
        context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                                      + backgroundColor.b + "," + backgroundColor.a + ")";
        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                                      + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
        // 1.4 is extra height factor for text below baseline: g,j,p,q.

        // text color
        context.fillStyle = "rgba(0, 0, 0, 1.0)";

        context.fillText(message, borderThickness, fontsize + borderThickness);

        // canvas contents will be used for a texture
        var texture = new THREE.Texture(canvas)
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial(
            { map: texture, useScreenCoordinates: false, alignment: spriteAlignment });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(100, 50, 1.0);
        return sprite;
    }

    // function for drawing rounded rectangles
    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }


}(Foundry, Globe3D));



(function (app, geo, undefined) {

    app.service('geoRenderService', function ($location, ontologyService) {

        function getHttpContext() {
            if (location) {
                return location.protocol + "//" + location.host + location.pathname.slice(0, location.pathname.indexOf('/', 1));
            }
        };

        function imageBase(url) {
            var base = $location.protocol() + ':' + '//' + $location.host() + ':' + $location.port()

            if ($location.host() != 'localhost') {
                base += '/labs';
            }
            return base + '/assets/images' + url;
        }

        this.init = geo.init;
        this.addEarth = geo.addEarth;
        this.animate = geo.animate;
        this.loadModels = geo.loadModels;

        this.renderList = function (list, config) {

            var icon = config.icon ? config.icon : imageBase('/map/location.png');


            geo.registerSelectionCallback(config.group, config.onSelection);

            //now you need to draw both dictionaries
            list.forEach(function (item) {
                geo.addPlacemark(config.group, item, geo.createPosition(item.latitude, item.longitude, item.currentAltitude || 20), icon, 1, item.currentHeading || 0);
            })

            geo.render();
        };


        this.renderAirports = function (list) {
            var config = {
                icon: imageBase('/map/location.airport.png'),
                onSelection: function (item) {

                },
                onSelection: function (item) {

                },
                group: geo.createPlacemarkGroup('airport'),
            }

            return this.renderList(list, config);
        };

        this.renderLocations = function (list, defaultIcon) {
            var config = {
                icon: imageBase('/map/location.png'),
                onSelection: function (item) {

                },
                onSelection: function (item) {

                },
                group: geo.createPlacemarkGroup('location'),
            }
            return this.renderList(list, config);
        };

        this.renderFlights = function (list) {
            var config = {
                icon: imageBase('/map/airplane.png'),
                onSelection: function (item) {

                },
                onSelection: function (item) {

                },
                group: geo.createPlacemarkGroup('flight'),
            }

            return this.renderList(list, config);
        };

        this.renderFlightPaths = function (list) {
            var group = geo.createPolylineGroup('flight');

            list.forEach(function (flight) {
                var start = flight.getLink('departsAirport').first;
                if (!start) return;

                var positions = [
                    geo.createPosition(flight.latitude, flight.longitude),
                    geo.createPosition(start.latitude, start.longitude),
                ];

                geo.addPolyline(group, positions);

            });

        };

        this.renderRegions = function (list) {
            var group = geo.createPolylineGroup('region');

            list.forEach(function (item) {
                var positions = item.pointList.map(function (track) {
                    return geo.createPosition(track.lat, track.lng);
                });

                geo.addPolyline(group, positions);
            });

            return group;
        }


        this.renderPath = function (flightPath) {
            var trackMarksGroup = geo.createPlacemarkGroup();
            var trackLinesGroup = geo.createPolylineGroup(8, geo.Color.fromCssColorString('#00FFFF', 0.5));

            geo.clearPolylineGroup(trackLinesGroup);

            var positions = flightPath.points.map(function (track) {
                return geo.createPosition(track.lat, track.lng, 52000);
            });

            geo.addPolyline(trackLinesGroup, positions);
        }


    });

}(foApp, Globe3D));