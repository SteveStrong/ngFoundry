
import { Scene, PerspectiveCamera, OrthographicCamera, BoxGeometry, MeshBasicMaterial, Mesh, WebGLRenderer } from 'three';

import { Vector3, Vector2, Quaternion, EventDispatcher } from 'three';


let STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };

// The four arrow keys
let KEYS = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
let MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2 };

// Mouse buttons
let MOUSEBUTTONS = { ORBIT: MOUSE.LEFT, ZOOM: MOUSE.MIDDLE, PAN: MOUSE.RIGHT };

var Scene3D = (function (fo, tools, lib3D, undefined) {
    var displays = {};
    var activeDisplay = undefined;
    var mesh3D, mesh3DType;

    function Core3DEngine(id) {
        var self = this;
        activeDisplay = this;

        self.scene = new THREE.Scene();
        self.webglRenderer = new THREE.WebGLRenderer();
        self.camera = new THREE.PerspectiveCamera(
                75, // Camera frustum vertical field of view.
                window.innerWidth / window.innerHeight,// Camera frustum aspect ratio.
                1,//  Camera frustum near plane.
                10000// Camera frustum far plane
            );;

        var container = document.getElementById(id);
        if (container) {
            self.camera.aspect = container.offsetWidth / container.offsetHeight;

            self.webglRenderer.setSize(container.offsetWidth, container.offsetHeight);
            container.appendChild(self.webglRenderer.domElement);
        } else {
            self.webglRenderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(self.webglRenderer.domElement);
        }

        function onWindowResize() {
            if (container) {
                self.camera.aspect = container.offsetWidth / container.offsetHeight;
                self.webglRenderer.setSize(container.offsetWidth, container.offsetHeight);
            } else {
                self.camera.aspect = window.innerWidth / window.innerHeight;
                self.webglRenderer.setSize(window.innerWidth, window.innerHeight);
            }
            self.camera.updateProjectionMatrix();
        }

        window.addEventListener('resize', onWindowResize, false);


        self.controls = new THREE.OrbitControls(self.camera, self.webglRenderer.domElement);
        self.controls.enableDamping = true;
        self.controls.dampingFactor = 0.25;
        self.controls.enableZoom = true;

        self.lights = {};
        self.onNextAnimationFrame = undefined;
        self.customRenderer = undefined;

        onWindowResize();

        self.controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
        self.webglRenderer.render(self.scene, self.camera);

        return self;
    }

    Core3DEngine.prototype = {
        cameraPosition: function (x, y, z) {
            var camera = this.camera;
            camera.position.x = x || 0;
            camera.position.y = y || 0;
            camera.position.z = z || 0;
            return this;
        },
        zoomToPosition: function (pos) {
            var camera = this.camera;
            camera.position.set(pos.x, pos.y, pos.z);
            return this;
        },
        lookAtPosition: function (pos) {
            var camera = this.camera;
            camera.lookAt(pos);
            return this;
        },
        getScene: function() {
            return this.scene;
        },
        defaultLight: function (onComplete) {
            this.addLight({}, onComplete);
            return this;
        },
        add: function (obj, onComplete) {
            obj && this.scene != obj && this.scene.add(obj)
            onComplete && onComplete(obj, this.scene);
            return this;
        },
        remove: function (obj) {
            obj && this.scene.remove(obj)
            return this;
        },
        init: function (zoomPos, lookPos) {
            this.webglRenderer.render(this.scene, this.camera);
            this.zoomToPosition(zoomPos || new THREE.Vector3(0, 0, 100));
            this.lookAtPosition(lookPos || new THREE.Vector3(0, 0, 0));
            return this;
        },
        addLight: function (lightSpec, onComplete) {
            lightSpec = lightSpec || {};
            var light = lib3D.lightPrimitive(lightSpec.type, lightSpec);
            if (lightSpec.myName) {
                this.lights[lightSpec.myName] = light;
            }
            this.add(light, onComplete);
            return this;
        },
        addGridHelper: function (size, step, onComplete) {
            var gridHelper = new THREE.GridHelper(size || 100, step || 10);
            var scene = this.scene;
            scene.add(gridHelper);
            onComplete && onComplete(gridHelper, scene);
            return this;
        },
        addAxisHelper: function (size, onComplete) {
            var axisHelper = new THREE.AxisHelper(size || 50);
            var scene = this.scene;
            scene.add(axisHelper);
            onComplete && onComplete(axisHelper, scene);
            return this;
        },
        startAnimate: function () {
            var self = this;

            function animate() {
                requestAnimationFrame(animate);
                self.controls.update();

                if (self.onNextAnimationFrame) {
                    self.onNextAnimationFrame();
                };

                if (self.customRenderer) {
                    self.customRenderer(self.webglRenderer, self.scene, self.camera);
                } else {
                    self.webglRenderer.render(self.scene, self.camera);
                }
            }

            animate();
            return this;
        },
        setCustomRenderer: function (funct) {
            this.customRenderer = funct;
            return this;
        },
        setAnimation: function (funct) {
            this.onNextAnimationFrame = funct;
            return this;
        },
        getRootGeom: function () {
            var self = this;
            if (!self.rootGeom) {
                self.rootGeom = mesh3DType.newInstance({
                    camera: function () { return self.camera; },
                    mesh: function () {
                        return self.scene;
                    }
                });
            }
            return self.rootGeom;
        }
    }


    function activeScene() {
        return activeDisplay || activeDisplay.getScene();
    }

    function activeRootGeom() {
        return activeDisplay || activeDisplay.getRootGeom();
    }



    //http://chimera.labs.oreilly.com/books/1234000000802/ch04.html#shadows

    var axisX = new THREE.Vector3(1, 0, 0); // CHANGED
    var axisY = new THREE.Vector3(0, 1, 0); // CHANGED
    var axisZ = new THREE.Vector3(0, 0, 1); // CHANGED
    var binormal = new THREE.Vector3();
    var normal = new THREE.Vector3();



    //http://threejs.org/docs/#Reference/Math/Euler

    function createMesh(geometry, materials) {
        fo.onCurrentSmash(function (mesh, newValue, formula, owner) {
            var parent = mesh.parent || activeScene();
            parent && parent.remove(mesh);
        });

        var mesh = new THREE.Mesh(geometry, materials);
        return mesh;
    }

    //this is where static models get stores
    var mesh3D = fo.defineClass('mesh3D', fo.Component)  //fo.Node
        .extendProperties({
            mesh: function () {
                var result = createMesh(this.geometry, this.materials);
                return result;
            },
        })
        .extendPrototype({
            normal: function (angleX, angleY, angleZ) {
                var mesh = this.mesh;
                mesh.matrix = new THREE.Matrix4();
                return this;
            },
            rotateXYZ: function (angleX, angleY, angleZ) {
                var mesh = this.mesh;
                mesh.rotation.x = angleX;
                mesh.rotation.y = angleY;
                mesh.rotation.z = angleZ;
                return this;
            },
            rotateClear: function () {
                var mesh = this.mesh;
                mesh.rotation.set(0, 0, 0);
                return this;
            },
            scale: function (s) {
                var mesh = this.mesh;
                mesh.scale.set(s, s, s);
                return this;
            },
            scaleXYZ: function (X, Y, Z) {
                var mesh = this.mesh;
                mesh.scale.set(X, Y, Z);
                return this;
            },
            rotateOnX: function (angle) {
                var mesh = this.mesh;
                mesh.rotateOnAxis(axisX, angle);
                return this;
            },
            rotateOnY: function (angle) {
                var mesh = this.mesh;
                mesh.rotateOnAxis(axisY, angle);
                return this;
            },
            rotateOnZ: function (angle) {
                var mesh = this.mesh;
                mesh.rotateOnAxis(axisZ, angle);
                return this;
            },
            positionClear: function () {
                var mesh = this.mesh;
                mesh.position.set(0, 0, 0);
                return this;
            },
            positionXYZ: function (X, Y, Z) {
                var mesh = this.mesh;
                mesh.position.setX(X);
                mesh.position.setY(Y);
                mesh.position.setZ(Z);
                return this;
            },
            setX: function (dist) {
                var mesh = this.mesh;
                mesh.position.setX(dist);
                return this;
            },
            setY: function (dist) {
                var mesh = this.mesh;
                mesh.position.setY(dist);
                return this;
            },
            setZ: function (dist) {
                var mesh = this.mesh;
                mesh.position.setZ(dist);
                return this;
            },
            moveX: function (dist) {
                var mesh = this.mesh;
                this.setX(mesh.position.x + dist);
                return this;
            },
            moveY: function (dist) {
                var mesh = this.mesh;
                this.setY(mesh.position.y + dist);
                return this;
            },
            moveZ: function (dist) {
                var mesh = this.mesh;
                this.setZ(mesh.position.z + dist);
                return this;
            },
            applyMatrix: function (matrix) {
                var mesh = this.mesh;
                mesh.applyMatrix(matrix);
                return this;
            },
            addTranslation: function (x, y, z) {
                var matrix = new THREE.Matrix4().makeTranslation(x, y, z);
                return this.applyMatrix(matrix);
            },
            addRotationX: function (angleInRads) {
                var matrix = new THREE.Matrix4().makeRotationX(angleInRads);
                return this.applyMatrix(matrix);
            },
            addRotationY: function (angleInRads) {
                var matrix = new THREE.Matrix4().makeRotationY(angleInRads);
                return this.applyMatrix(matrix);
            },
            addRotationZ: function (angleInRads) {
                var matrix = new THREE.Matrix4().makeRotationZ(angleInRads);
                return this.applyMatrix(matrix);
            },
            addRotationAxis: function (axis, angleInRads) {
                var matrix = new THREE.Matrix4().makeRotationAxis(axis, angleInRads);
                return this.applyMatrix(matrix);
            },
            applyGeometryMatrix: function (matrix) {
                var geometry = this.mesh.geometry;
                geometry.applyMatrix(matrix);
                return this;
            },
            position: function (pos) {
                var mesh = this.mesh;
                mesh.position.copy(pos);
                return this;
            },
            getPosition: function () {
                var mesh = this.mesh;
                return mesh.position;
            },
            getRotation: function () {
                var mesh = this.mesh;
                return mesh.rotation;
            },
            rotation: function (rot) {
                var mesh = this.mesh;
                mesh.rotation.copy(rot);
                return this;
            },
            meshRemove: function () {
                //ok now delete the mesh gemoetry
                var mesh = this.getManagedProperty('mesh');
                if (mesh.isValueKnown()) {
                    mesh.smash();
                }
                return this;
            },
            meshSelect: function () {
                return this;
            },
            meshUnselect: function () {
                return this;
            },
            scaleClear: function () {
                var mesh = this.mesh;
                mesh.scale.set(1, 1, 1);
                return this;
            },
            hide: function () {
                return this.visible(false);
            },
            show: function () {
                return this.visible(true);
            },
            toggleVisible: function () {
                var mesh = this.mesh;
                mesh.visible = !mesh.visible;
                return this;
            },
            visible: function (value) {
                var mesh = this.mesh;
                mesh.visible = value;
                return this;
            },
            gotoSpline: function (tube, percent, s) {
                var scale = s || 1.0;
                var offset = 15;
                var mesh = this.mesh;
                var pos = tube.parameters.path.getPointAt(percent);
                pos.multiplyScalar(scale);
                // interpolation
                var segments = tube.tangents.length;
                var pickt = percent * segments;
                var pick = Math.floor(pickt);
                var pickNext = (pick + 1) % segments;
                binormal.subVectors(tube.binormals[pickNext], tube.binormals[pick]);
                binormal.multiplyScalar(pickt - pick).add(tube.binormals[pick]);
                var path = tube.parameters.path;
                var dir = path.getTangentAt(percent);
                normal.copy(binormal).cross(dir);
                // We move on a offset on its binormal
                pos.add(normal.clone().multiplyScalar(offset));
                // Using arclength for stablization in look ahead.
                var step = 30 / path.getLength() % 1;
                var pnt = percent + step < 1 ? percent + step : 1;
                var lookAt = path.getPointAt(pnt).multiplyScalar(scale);
                lookAt.copy(pos).add(dir);
                mesh.position.copy(pos);
                mesh.matrix.lookAt(mesh.position, lookAt, normal);
                mesh.rotation.setFromRotationMatrix(mesh.matrix, mesh.rotation.order);
                return this;
            },
            gotoSphereArc: function (tube, percent, s) {
                var scale = s || 1.0;
                var offset = 15;
                if (!tube.parameters || !tube.parameters.path || !tube.binormals.length || percent > 1.0) {
                    return this;
                }
                var mesh = this.mesh;
                var path = tube.parameters.path;
                var pos = path.getPointAt(percent);
                //if the math does not work out,  do not worry about it
                //the shape does not move
                try {
                    pos.multiplyScalar(scale);
                    // interpolation
                    var segments = tube.tangents.length;
                    var pickt = percent * segments;
                    var pick = Math.floor(pickt);
                    var pickNext = (pick + 1) % segments;
                    binormal.subVectors(tube.binormals[pickNext], tube.binormals[pick]);
                    binormal.multiplyScalar(pickt - pick).add(tube.binormals[pick]);
                    var dir = path.getTangentAt(percent);
                    normal.copy(binormal).cross(dir);
                    //this only works because I know the arc is on a sphere
                    var sphereNormal = new THREE.Vector3(pos.x, pos.y, pos.z);
                    normal.copy(sphereNormal.normalize());
                    // We move on a offset on its binormal
                    pos.add(normal.clone().multiplyScalar(offset));
                    // Using arclength for stablization in look ahead.
                    var step = 30 / path.getLength() % 1;
                    var pnt = percent + step < 1 ? percent + step : 1;
                    var lookAt = path.getPointAt(pnt).multiplyScalar(scale);
                    lookAt.copy(pos).add(dir);
                    mesh.position.copy(pos);
                    mesh.matrix.lookAt(mesh.position, lookAt, normal);
                    mesh.rotation.setFromRotationMatrix(mesh.matrix, mesh.rotation.order);
                } catch (ex) {
                }
                return this;
            },
        })
        .extendPrototype({
            addToScene: function (root) {
                if (root && root.mesh && root.mesh != activeScene()) {
                    if (!root.mesh.parent) {
                        root.draw();
                    }
                }
                var target = root && root.mesh ? root.mesh : activeScene();
                try {
                    var prop = this.getManagedProperty('mesh');
                    var mesh = prop.getValue();
                    if (mesh != target) {
                        target.add(mesh);
                    }
                } catch (ex) {
                    var mesh = this.mesh;
                    if (mesh != target) {
                        target.add(mesh);
                    }
                    //alert(ex);
                }
                return this;
            },
            draw: function (root) {
                this.addToScene(root);
                return this;
            },
            undraw: function () {
                this.meshRemove();
                return this;
            },
            smash: function () {
                //probably should destrou model complete if called
                this.meshRemove();
                return this;
            },
            //https://www.script-tutorials.com/webgl-with-three-js-lesson                /// <summary>
            /// 
            /// </summary>
            /// <param name="size" type="type"></param>
            /// <param name="onCompete" type="type"></param>
            /// <returns type="Mesh3D"></returns>
            addAxisHelper: function (size, onCompete) {
                var axisHelper = new THREE.AxisHelper(size || 50);
                this.mesh.add(axisHelper);
                onCompete && onCompete(axisHelper, this.mesh);
                return this;
            },
            //*
            addGridHelper: function (size, step, onCompete) {
                var gridHelper = new THREE.GridHelper(size || 100, step || 10);
                this.mesh.add(gridHelper);
                onCompete && onCompete(gridHelper, this.mesh);
                return this;
            },
            /**
                * http://threejs.org/docs/#Reference/Extras.Helpers/BoxHelper
                */
            addBoxHelper: function (onCompete) {
                var boxHelper = new THREE.BoxHelper(this.mesh);
                scene.add(boxHelper);
                onCompete && onCompete(boxHelper, this.mesh);
                return this;
            },
            boundingBox: function (onCompete) {
                var box = new THREE.Box3();  //http://threejs.org/docs/#Reference/Math/Box3
                box.setFromObject(this.mesh);
                onCompete && onCompete(box, this.mesh);
                return box;
            }
        });

    var mesh3DType = mesh3D.exportType('mesh3D');



    //http://stackoverflow.com/questions/26456410/three-js-lines-normal-to-a-sphere

    var typeBody = fo.establishType('three::Body', {
        type: 'object',
        geometrySpec: {},
        geometry: function () {
            var spec = this.geometrySpec;
            var type = (spec && spec.type) || this.type;
            return lib3D.geometryPrimitive(type, spec);
        },
        materialSpec: {},
        materials: function () {
            if (!this.materialSpec) return;
            var spec = tools.asSpecObject(this.materialSpec);
            var shade = (spec && spec.type) || 'phong';
            return lib3D.materialPrimitive(shade, spec);
        },
    }, mesh3D);

    var typePipe = fo.establishType('three::Pipe', {
        type: 'tube',
        geometrySpec: {},
        geometry: function () {
            var spec = this.geometrySpec;
            var type = (spec && spec.type) || this.type;
            return lib3D.geometryPrimitive(type, spec, lib3D.splinePrimitive(type, spec));
        },
        materialSpec: {},
        materials: function () {
            if (!this.materialSpec) return;
            var spec = this.materialSpec;
            var shade = (spec && spec.type) || 'line';
            return lib3D.materialPrimitive(shade, spec);
        },

        points: function () {
            return this.geometrySpec.points;
        },
        curve: function () {
            return this.geometry.parameters.path;
        }
    }, mesh3D);

    function definePrimitive(name, geometrySpec, materialSpec) {
        var namespace = '3dPrimitive::' + name;
        fo.establishType(namespace, {
            myName: name,
            geometrySpec: tools.asSpecObject(geometrySpec),
            materialSpec: tools.asSpecObject(materialSpec),
        });

        var type = fo.establishSubType(namespace, geometrySpec && geometrySpec.points ? typePipe : typeBody);

        //can we intercept type.makeDefault and nuild a new wrapper function
        var makeDefault = type.makeDefault;
        type.makeDefault = function (properties, subcomponents, parent, onComplete) {
            if (properties && properties.geometrySpec) {
                properties.geometrySpec = tools.asSpecObject(properties.geometrySpec)
            }
            if (properties && properties.materialSpec) {
                properties.materialSpec = tools.asSpecObject(properties.materialSpec)
            }
            var result = makeDefault.call(this, properties, subcomponents, parent, onComplete);
            return result;
        }
        return type;
    }


    function defineModel(name, geometry, materials) {
        var namespace = '3dModel::' + name;
        var type = fo.establishType(namespace, {
            myName: name,
            geometry: geometry,
            materials: materials && lib3D.materialPrimitive('face', materials),
        }, mesh3D);

        return type;
    }


    return {
        THREE: lib3D.THREE,
        engine: Core3DEngine,
        mesh3DType: mesh3DType,
        definePrimitive: definePrimitive,
        defineModel: defineModel,

        create: function (id) {
            var display = new Core3DEngine(id);
            displays[id] = display;
            return display;
        },
        find: function (id) {
            if (id instanceof Core3DEngine) return id;
            return displays[id];
        },
        active: function () {
            return activeDisplay;
        },
        activate: function (id) {
            activeDisplay = (id instanceof Core3DEngine) ? id : this.find(id)
            return this.active();
        },
        remove: function (id) {
            if (!displays[id]) return;
            displays[id] = undefined;
        },
        getDisplays: function () {
            return tools.union({}, displays);
        },
    }

}(Foundry, Foundry.tools, lib3D));


export class OrbitControls extends EventDispatcher {

    // This set of controls performs orbiting, dollying (zooming), and panning. It maintains
    // the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
    // supported.
    //
    //    Orbit - left mouse / touch: one finger move
    //    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
    //    Pan - right mouse, or arrow keys / touch: three finger swipe

    constraint: OrbitConstraint;
    object:any;
    target:any;

    domElement;
    constructor(object, domElement) {
        super()
        this.constraint = new OrbitConstraint(object);

        this.domElement = domElement !== undefined ? domElement : document;

        this.domElement.addEventListener('contextmenu', this.contextmenu, false);

        this.domElement.addEventListener('mousedown', this.onMouseDown, false);
        this.domElement.addEventListener('mousewheel', this.onMouseWheel, false);
        this.domElement.addEventListener('DOMMouseScroll', this.onMouseWheel, false); // firefox

        this.domElement.addEventListener('touchstart', this.touchstart, false);
        this.domElement.addEventListener('touchend', this.touchend, false);
        this.domElement.addEventListener('touchmove', this.touchmove, false);

        window.addEventListener('keydown', this.onKeyDown, false);
    }

    getPolarAngle() {
        return this.constraint.getPolarAngle();
    };

    getAzimuthalAngle() {
        return this.constraint.getAzimuthalAngle();
    };

    // Set to false to disable this control
    enabled = true;

    // center is old, deprecated; use "target" instead
    center = this.target;

    // This option actually enables dollying in and out; left as "zoom" for
    // backwards compatibility.
    // Set to false to disable zooming
    enableZoom = true;
    zoomSpeed = 1.0;

    // Set to false to disable rotating
    enableRotate = true;
    rotateSpeed = 1.0;

    // Set to false to disable panning
    enablePan = true;
    keyPanSpeed = 7.0;	// pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    autoRotate = false;
    autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // Set to false to disable use of the keys
    enableKeys = true;



    ////////////
    // internals

    rotateStart = new Vector2();
    rotateEnd = new Vector2();
    rotateDelta = new Vector2();

    panStart = new Vector2();
    panEnd = new Vector2();
    panDelta = new Vector2();

    dollyStart = new Vector2();
    dollyEnd = new Vector2();
    dollyDelta = new Vector2();



    state = STATE.NONE;

    // for reset

    target0 = this.target.clone();
    position0 = this.object.position.clone();
    zoom0 = this.object.zoom;

    // events

    changeEvent = { type: 'change' };
    startEvent = { type: 'start' };
    endEvent = { type: 'end' };

    // pass in x,y of change desired in pixel space,
    // right and down are positive
    pan(deltaX, deltaY) {
        let element = this.domElement === document ? this.domElement.body : this.domElement;
        this.constraint.pan(deltaX, deltaY, element.clientWidth, element.clientHeight);
    }

    update() {
        if (this.autoRotate && this.state === STATE.NONE) {
            this.constraint.rotateLeft(this.getAutoRotationAngle());
        }

        if (this.constraint.update()) {
            this.dispatchEvent(this.changeEvent);
        }
    };

    reset() {

        this.state = STATE.NONE;

        this.target.copy(this.target0);
        this.object.position.copy(this.position0);
        this.object.zoom = this.zoom0;

        this.object.updateProjectionMatrix();
        this.dispatchEvent(this.changeEvent);

        this.update();

    };

    getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
    }

    getZoomScale() {
        return Math.pow(0.95, this.zoomSpeed);
    }

    onMouseDown(event) {

        if (this.enabled === false) return;

        event.preventDefault();

        if (event.button === MOUSEBUTTONS.ORBIT) {

            if (this.enableRotate === false) return;

            this.state = STATE.ROTATE;

            this.rotateStart.set(event.clientX, event.clientY);

        } else if (event.button === MOUSEBUTTONS.ZOOM) {

            if (this.enableZoom === false) return;

            this.state = STATE.DOLLY;

            this.dollyStart.set(event.clientX, event.clientY);

        } else if (event.button === MOUSEBUTTONS.PAN) {

            if (this.enablePan === false) return;

            this.state = STATE.PAN;

            this.panStart.set(event.clientX, event.clientY);

        }

        if (this.state !== STATE.NONE) {

            document.addEventListener('mousemove', this.onMouseMove, false);
            document.addEventListener('mouseup', this.onMouseUp, false);
            this.dispatchEvent(this.startEvent);

        }

    }

    onMouseMove(event) {

        if (this.enabled === false) return;

        event.preventDefault();

        let element = this.domElement === document ? this.domElement.body : this.domElement;

        if (this.state === STATE.ROTATE) {

            if (this.enableRotate === false) return;

            this.rotateEnd.set(event.clientX, event.clientY);
            this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);

            // rotating across whole screen goes 360 degrees around
            this.constraint.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientWidth * this.rotateSpeed);

            // rotating up and down along whole screen attempts to go 360, but limited to 180
            this.constraint.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight * this.rotateSpeed);

            this.rotateStart.copy(this.rotateEnd);

        } else if (this.state === STATE.DOLLY) {

            if (this.enableZoom === false) return;

            this.dollyEnd.set(event.clientX, event.clientY);
            this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

            if (this.dollyDelta.y > 0) {

                this.constraint.dollyIn(this.getZoomScale());

            } else if (this.dollyDelta.y < 0) {

                this.constraint.dollyOut(this.getZoomScale());

            }

            this.dollyStart.copy(this.dollyEnd);

        } else if (this.state === STATE.PAN) {

            if (this.enablePan === false) return;

            this.panEnd.set(event.clientX, event.clientY);
            this.panDelta.subVectors(this.panEnd, this.panStart);

            this.pan(this.panDelta.x, this.panDelta.y);

            this.panStart.copy(this.panEnd);

        }

        if (this.state !== STATE.NONE) this.update();

    }

    onMouseUp( /* event */) {

        if (this.enabled === false) return;

        document.removeEventListener('mousemove', this.onMouseMove, false);
        document.removeEventListener('mouseup', this.onMouseUp, false);
        this.dispatchEvent(this.endEvent);
        this.state = STATE.NONE;

    }

    onMouseWheel(event) {

        if (this.enabled === false || this.enableZoom === false || this.state !== STATE.NONE) return;

        event.preventDefault();
        event.stopPropagation();

        let delta = 0;

        if (event.wheelDelta !== undefined) {
            // WebKit / Opera / Explorer 9
            delta = event.wheelDelta;

        } else if (event.detail !== undefined) {
            // Firefox
            delta = - event.detail;
        }

        if (delta > 0) {
            this.constraint.dollyOut(this.getZoomScale());
        } else if (delta < 0) {
            this.constraint.dollyIn(this.getZoomScale());
        }

        this.update();
        this.dispatchEvent(this.startEvent);
        this.dispatchEvent(this.endEvent);

    }

    onKeyDown(event) {

        if (this.enabled === false || this.enableKeys === false || this.enablePan === false) return;

        switch (event.keyCode) {

            case KEYS.UP:
                this.pan(0, this.keyPanSpeed);
                this.update();
                break;

            case KEYS.BOTTOM:
                this.pan(0, - this.keyPanSpeed);
                this.update();
                break;

            case KEYS.LEFT:
                this.pan(this.keyPanSpeed, 0);
                this.update();
                break;

            case KEYS.RIGHT:
                this.pan(- this.keyPanSpeed, 0);
                this.update();
                break;

        }

    }

    touchstart(event) {

        if (this.enabled === false) return;

        switch (event.touches.length) {

            case 1:	// one-fingered touch: rotate

                if (this.enableRotate === false) return;

                this.state = STATE.TOUCH_ROTATE;

                this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                break;

            case 2:	// two-fingered touch: dolly

                if (this.enableZoom === false) return;

                this.state = STATE.TOUCH_DOLLY;

                let dx = event.touches[0].pageX - event.touches[1].pageX;
                let dy = event.touches[0].pageY - event.touches[1].pageY;
                let distance = Math.sqrt(dx * dx + dy * dy);
                this.dollyStart.set(0, distance);
                break;

            case 3: // three-fingered touch: pan

                if (this.enablePan === false) return;

                this.state = STATE.TOUCH_PAN;

                this.panStart.set(event.touches[0].pageX, event.touches[0].pageY);
                break;

            default:

                this.state = STATE.NONE;

        }

        if (this.state !== STATE.NONE) this.dispatchEvent(this.startEvent);

    }

    touchmove(event) {

        if (this.enabled === false) return;

        event.preventDefault();
        event.stopPropagation();

        let element = this.domElement === document ? this.domElement.body : this.domElement;

        switch (event.touches.length) {

            case 1: // one-fingered touch: rotate

                if (this.enableRotate === false) return;
                if (this.state !== STATE.TOUCH_ROTATE) return;

                this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);

                // rotating across whole screen goes 360 degrees around
                this.constraint.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientWidth * this.rotateSpeed);
                // rotating up and down along whole screen attempts to go 360, but limited to 180
                this.constraint.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight * this.rotateSpeed);

                this.rotateStart.copy(this.rotateEnd);

                this.update();
                break;

            case 2: // two-fingered touch: dolly

                if (this.enableZoom === false) return;
                if (this.state !== STATE.TOUCH_DOLLY) return;

                let dx = event.touches[0].pageX - event.touches[1].pageX;
                let dy = event.touches[0].pageY - event.touches[1].pageY;
                let distance = Math.sqrt(dx * dx + dy * dy);

                this.dollyEnd.set(0, distance);
                this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

                if (this.dollyDelta.y > 0) {

                    this.constraint.dollyOut(this.getZoomScale());

                } else if (this.dollyDelta.y < 0) {

                    this.constraint.dollyIn(this.getZoomScale());

                }

                this.dollyStart.copy(this.dollyEnd);

                this.update();
                break;

            case 3: // three-fingered touch: pan

                if (this.enablePan === false) return;
                if (this.state !== STATE.TOUCH_PAN) return;

                this.panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                this.panDelta.subVectors(this.panEnd, this.panStart);

                this.pan(this.panDelta.x, this.panDelta.y);

                this.panStart.copy(this.panEnd);

                this.update();
                break;

            default:

                this.state = STATE.NONE;

        }

    }

    touchend( /* event */) {
        if (this.enabled === false) return;

        this.dispatchEvent(this.endEvent);
        this.state = STATE.NONE;
    }

    contextmenu(event) {
        event.preventDefault();
    }

    dispose() {
        this.domElement.removeEventListener('contextmenu', this.contextmenu, false);
        this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
        this.domElement.removeEventListener('mousewheel', this.onMouseWheel, false);
        this.domElement.removeEventListener('DOMMouseScroll', this.onMouseWheel, false); // firefox

        this.domElement.removeEventListener('touchstart', this.touchstart, false);
        this.domElement.removeEventListener('touchend', this.touchend, false);
        this.domElement.removeEventListener('touchmove', this.touchmove, false);

        document.removeEventListener('mousemove', this.onMouseMove, false);
        document.removeEventListener('mouseup', this.onMouseUp, false);

        window.removeEventListener('keydown', this.onKeyDown, false);
    }



// force an update at start
//update();

};



export class OrbitConstraint {
    object;

    constructor(obj) {
        this.object = obj
    }


    // "target" sets the location of focus, where the object orbits around
    // and where it pans with respect to.
    target: Vector3 = new Vector3();

    // Limits to how far you can dolly in and out ( PerspectiveCamera only )
    minDistance = 0;
    maxDistance = Infinity;

    // Limits to how far you can zoom in and out ( OrthographicCamera only )
    minZoom = 0;
    maxZoom = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    minPolarAngle = 0; // radians
    maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    minAzimuthAngle = - Infinity; // radians
    maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    enableDamping = false;
    dampingFactor = 0.25;

    ////////////
    // internals

    EPS: number = 0.000001;

    // Current position in spherical coordinate system.
    theta: number = 0;
    phi: number = 0;

    // Pending changes
    phiDelta: number = 0;
    thetaDelta: number = 0;
    scale: number = 1;
    panOffset: Vector3 = new Vector3();
    zoomChanged: boolean = false;

    // API

    getPolarAngle() {
        return this.phi;
    };

    getAzimuthalAngle() {
        return this.theta;
    };

    rotateLeft(angle) {
        this.thetaDelta -= angle;
    };

    rotateUp(angle) {
        this.phiDelta -= angle;
    };

    // pass in distance in world space to move left
    panLeft(distance: number = 0) {

        let v = new Vector3();
        let te = this.object.matrix.elements;
        // get X column of matrix
        v.set(te[0], te[1], te[2]);
        v.multiplyScalar(- distance);

        this.panOffset.add(v);
    }

    // pass in distance in world space to move up
    panUp(distance: number = 0) {
        let v = new Vector3();
        let te = this.object.matrix.elements;

        // get Y column of matrix
        v.set(te[4], te[5], te[6]);
        v.multiplyScalar(distance);

        this.panOffset.add(v);
    }

    // pass in x,y of change desired in pixel space,
    // right and down are positive
    pan(deltaX: number, deltaY: number, screenWidth: number, screenHeight: number) {

        if (this.object instanceof PerspectiveCamera) {

            // perspective
            let position = this.object.position;
            let offset = position.clone().sub(this.target);
            let targetDistance = offset.length();

            // half of the fov is center to top of screen
            targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);

            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            this.panLeft(2 * deltaX * targetDistance / screenHeight);
            this.panUp(2 * deltaY * targetDistance / screenHeight);

        } else if (this.object instanceof OrthographicCamera) {

            // orthographic
            this.panLeft(deltaX * (this.object.right - this.object.left) / screenWidth);
            this.panUp(deltaY * (this.object.top - this.object.bottom) / screenHeight);

        } else {

            // camera neither orthographic or perspective
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');

        }

    };

    dollyIn(dollyScale: number) {

        if (this.object instanceof PerspectiveCamera) {

            this.scale /= dollyScale;

        } else if (this.object instanceof OrthographicCamera) {

            this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
            this.object.updateProjectionMatrix();
            this.zoomChanged = true;

        } else {

            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');

        }

    };

    dollyOut(dollyScale: number) {

        if (this.object instanceof PerspectiveCamera) {

            this.scale *= dollyScale;

        } else if (this.object instanceof OrthographicCamera) {

            this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
            this.object.updateProjectionMatrix();
            this.zoomChanged = true;

        } else {

            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');

        }

    };

    update() {

        let offset = new Vector3();

        // so camera.up is the orbit axis
        let quat = new Quaternion().setFromUnitVectors(this.object.up, new Vector3(0, 1, 0));
        let quatInverse = quat.clone().inverse();

        let lastPosition = new Vector3();
        let lastQuaternion = new Quaternion();

        return () => {

            let position = this.object.position;

            offset.copy(position).sub(this.target);

            // rotate offset to "y-axis-is-up" space
            offset.applyQuaternion(quat);

            // angle from z-axis around y-axis

            this.theta = Math.atan2(offset.x, offset.z);

            // angle from y-axis

            this.phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

            this.theta += this.thetaDelta;
            this.phi += this.phiDelta;

            // restrict theta to be between desired limits
            this.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.theta));

            // restrict phi to be between desired limits
            this.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.phi));

            // restrict phi to be between EPS and PI-EPS
            this.phi = Math.max(this.EPS, Math.min(Math.PI - this.EPS, this.phi));

            let radius = offset.length() * this.scale;

            // restrict radius to be between desired limits
            radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

            // move target to panned location
            this.target.add(this.panOffset);

            offset.x = radius * Math.sin(this.phi) * Math.sin(this.theta);
            offset.y = radius * Math.cos(this.phi);
            offset.z = radius * Math.sin(this.phi) * Math.cos(this.theta);

            // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion(quatInverse);

            position.copy(this.target).add(offset);

            this.object.lookAt(this.target);

            if (this.enableDamping === true) {

                this.thetaDelta *= (1 - this.dampingFactor);
                this.phiDelta *= (1 - this.dampingFactor);

            } else {

                this.thetaDelta = 0;
                this.phiDelta = 0;

            }

            this.scale = 1;
            this.panOffset.set(0, 0, 0);

            // update condition is:
            // min(camera displacement, camera rotation in radians)^2 > EPS
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8

            if (this.zoomChanged ||
                lastPosition.distanceToSquared(this.object.position) > this.EPS ||
                8 * (1 - lastQuaternion.dot(this.object.quaternion)) > this.EPS) {

                lastPosition.copy(this.object.position);
                lastQuaternion.copy(this.object.quaternion);
                this.zoomChanged = false;

                return true;

            }

            return false;

        };

    }

};