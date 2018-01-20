// angular service directive

var Scene3D = Scene3D || {};
var Foundry = Foundry || {};

(function (fo, tools, geo, undefined) {

    // Converts numeric degrees to radians
    if (typeof (Number.prototype.toRad) === "undefined") {
        Number.prototype.toRad = function () {
            return this * Math.PI / 180;
        }
    }
    if (typeof (Number.prototype.toDeg) === "undefined") {
        Number.prototype.toDeg = function () {
            return this * 180 / Math.PI;
        }
    }

    //Earth radius is the distance from the Earth's center to its surface, about 6,371 kilometers (3,959 mi). 

    var rootGeom;
    var light, camera, scene, webglRenderer, controls;

    var EARTH_RADIUS = 637;

    // couple of constants
    var POS_X = 1800;
    var POS_Y = 500;
    var POS_Z = 1800;
    var WIDTH = 1000;
    var HEIGHT = 600;


    //vars
    var goLeft = false;
    var goRight = false;
    var goUp = false;
    var goDown = false;


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


    /*  Check if the browser supports WebGL  Adapted from http://doesmybrowsersupportwebgl.com/*/
    function isWebGLSupported() {
        var cvs = document.createElement('canvas');
        var contextNames = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
        var ctx;
        if (navigator.userAgent.indexOf("MSIE") >= 0) {
            try {
                ctx = WebGLHelper.CreateGLContext(cvs, 'canvas');
            } catch (e) {
            }
        } else {
            for (var i = 0; i < contextNames.length; i++) {
                try {
                    ctx = cvs.getContext(contextNames[i]);
                    if (ctx) break;
                } catch (e) {
                }
            }
        }
        if (ctx) return true;
        return false;
    }

    //https://github.com/envisprecisely/THREE2STL
    function stlFromGeometry(geometry, options) {

        // calculate the faces and normals if they are not yet present
        geometry.computeFaceNormals()

        var addX = 0
        var addY = 0
        var addZ = 0
        var download = false

        if (options) {
            if (options.useObjectPosition) {
                addX = geometry.mesh.position.x
                addY = geometry.mesh.position.y
                addZ = geometry.mesh.position.z
            }

            if (options.download) {
                download = true
            }
        }


        var facetToStl = function (verts, normal) {
            var faceStl = ''
            faceStl += 'facet normal ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n'
            faceStl += 'outer loop\n'

            for (var j = 0; j < 3; j++) {
                var vert = verts[j]
                faceStl += 'vertex ' + (vert.x + addX) + ' ' + (vert.y + addY) + ' ' + (vert.z + addZ) + '\n'
            }

            faceStl += 'endloop\n'
            faceStl += 'endfacet\n'

            return faceStl
        }

        // start bulding the STL string
        var stl = ''
        stl += 'solid\n'

        for (var i = 0; i < geometry.faces.length; i++) {
            var face = geometry.faces[i]

            // if we have just a griangle, that's easy. just write them to the file
            if (face.d === undefined) {
                var verts = [
                    geometry.vertices[face.a],
                    geometry.vertices[face.b],
                    geometry.vertices[face.c]
                ]

                stl += facetToStl(verts, face.normal)

            } else {
                // if it's a quad, we need to triangulate it first
                // split the quad into two triangles: abd and bcd
                var verts = []
                verts[0] = [
                    geometry.vertices[face.a],
                    geometry.vertices[face.b],
                    geometry.vertices[face.d]
                ]
                verts[1] = [
                    geometry.vertices[face.b],
                    geometry.vertices[face.c],
                    geometry.vertices[face.d]
                ]

                for (var k = 0; k < 2; k++) {
                    stl += facetToStl(verts[k], face.normal)
                }

            }
        }

        stl += 'endsolid'

        if (download) {
            document.location = 'data:Application/octet-stream, ' + encodeURIComponent(stl)
        }

        return stl
    }

    /**
     * Based on https://github.com/mrdoob/three.js/blob/a72347515fa34e892f7a9bfa66a34fdc0df55954/examples/js/exporters/STLExporter.js
     * Tested on r68 and r70
     * @author kjlubick / https://github.com/kjlubick
     * @author kovacsv / http://kovacsv.hu/
     * @author mrdoob / http://mrdoob.com/
     */
    
    
    var parseStl = (function () {

            var vector = new THREE.Vector3();
            var normalMatrixWorld = new THREE.Matrix3();

            return function (scene) {

                var output = '';

                output += 'solid exported\n';

                scene.traverse(function (object) {

                    if (object instanceof THREE.Mesh) {

                        var geometry = object.geometry;
                        var matrixWorld = object.matrixWorld;
                        var mesh = object;

                        if (geometry instanceof THREE.Geometry) {

                            var vertices = geometry.vertices;
                            var faces = geometry.faces;

                            normalMatrixWorld.getNormalMatrix(matrixWorld);

                            for (var i = 0, l = faces.length; i < l; i++) {
                                var face = faces[i];

                                vector.copy(face.normal).applyMatrix3(normalMatrixWorld).normalize();

                                output += '\tfacet normal ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
                                output += '\t\touter loop\n';

                                var indices = [face.a, face.b, face.c];

                                for (var j = 0; j < 3; j++) {
                                    var vertexIndex = indices[j];
                                    if (mesh.geometry.skinIndices.length == 0) {
                                        vector.copy(vertices[vertexIndex]).applyMatrix4(matrixWorld);
                                        output += '\t\t\tvertex ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
                                    } else {
                                        vector.copy(vertices[vertexIndex]); //.applyMatrix4( matrixWorld );

                                        // see https://github.com/mrdoob/three.js/issues/3187
                                        boneIndices = [];
                                        boneIndices[0] = mesh.geometry.skinIndices[vertexIndex].x;
                                        boneIndices[1] = mesh.geometry.skinIndices[vertexIndex].y;
                                        boneIndices[2] = mesh.geometry.skinIndices[vertexIndex].z;
                                        boneIndices[3] = mesh.geometry.skinIndices[vertexIndex].w;

                                        weights = [];
                                        weights[0] = mesh.geometry.skinWeights[vertexIndex].x;
                                        weights[1] = mesh.geometry.skinWeights[vertexIndex].y;
                                        weights[2] = mesh.geometry.skinWeights[vertexIndex].z;
                                        weights[3] = mesh.geometry.skinWeights[vertexIndex].w;

                                        inverses = [];
                                        inverses[0] = mesh.skeleton.boneInverses[boneIndices[0]];
                                        inverses[1] = mesh.skeleton.boneInverses[boneIndices[1]];
                                        inverses[2] = mesh.skeleton.boneInverses[boneIndices[2]];
                                        inverses[3] = mesh.skeleton.boneInverses[boneIndices[3]];

                                        skinMatrices = [];
                                        skinMatrices[0] = mesh.skeleton.bones[boneIndices[0]].matrixWorld;
                                        skinMatrices[1] = mesh.skeleton.bones[boneIndices[1]].matrixWorld;
                                        skinMatrices[2] = mesh.skeleton.bones[boneIndices[2]].matrixWorld;
                                        skinMatrices[3] = mesh.skeleton.bones[boneIndices[3]].matrixWorld;

                                        var finalVector = new THREE.Vector4();
                                        for (var k = 0; k < 4; k++) {
                                            var tempVector = new THREE.Vector4(vector.x, vector.y, vector.z);
                                            tempVector.multiplyScalar(weights[k]);
                                            //the inverse takes the vector into local bone space
                                            tempVector.applyMatrix4(inverses[k])
                                            //which is then transformed to the appropriate world space
                                            .applyMatrix4(skinMatrices[k]);
                                            finalVector.add(tempVector);
                                        }
                                        output += '\t\t\tvertex ' + finalVector.x + ' ' + finalVector.y + ' ' + finalVector.z + '\n';
                                    }
                                }
                                output += '\t\tendloop\n';
                                output += '\tendfacet\n';
                            }
                        }
                    }

                });

                output += 'endsolid exported\n';

                return output;
            };
        }())


    // Use FileSaver.js 'saveAs' function to save the string
    function saveSTL(scene, name) {
        //var exporter = new THREE.STLExporter();
        var stlString = parseStl(scene);

       // var stlString = stlFromGeometry(scene);
        var blob = new Blob([stlString], { type: 'text/plain' });

        saveAs(blob, name + '.stl');
    }

    geo.export = function (name) {
        saveSTL(scene, name || 'scene');
    }

    geo.camera = function () {
        return camera;
    }

    geo.cameraPosition = function (x, y, z) {
        camera.position.x = x || 0;
        camera.position.y = y || 0;
        camera.position.z = z || 0;
        return camera;
    }
    //http://stackoverflow.com/questions/21229929/move-camera-to-a-fixed-position-and-axis
    geo.zoomToPosition = function (pos) {
        camera.position.set(pos.x, pos.y, pos.z);
    }

    geo.lookAtPosition = function (pos) {
        camera.lookAt(pos);
    }
 



    //http://www.johannes-raida.de/tutorials/three.js/tutorial04/tutorial04.htm
    function applyMeshTransformation(mesh) {

        // apply local matrix on geometry
        mesh.updateMatrixWorld();
        mesh.geometry.applyMatrix(mesh.matrixWorld);

        // reset local matrix
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 0, 0);
        mesh.scale.set(1, 1, 1);
        mesh.updateMatrixWorld();
    };

    function exportObject(mesh) {

        var objExporter = new THREE.ObjectExporter();
        var output = JSON.stringify(objExporter.parse(mesh), null, '\t');
        output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

        var blob = new Blob([output], { type: 'text/plain' });
        var objectURL = window.URL.createObjectURL(blob);

        window.open(objectURL, '_blank');

    };

    // Rotate an object around an arbitrary axis in object space
    // this may change the geometry
    function rotateAroundObjectAxis(object, axis, radians) {
        var rotObjectMatrix = new THREE.Matrix4();
        rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
        
        object.matrix.multiply(rotObjectMatrix);

        object.rotation.setFromRotationMatrix(object.matrix);
    }

    // Rotate an object around an arbitrary axis in world space       
    function rotateAroundWorldAxis(object, axis, radians) {
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

        rotWorldMatrix.multiply(object.matrix);                // pre-multiply
        object.matrix = rotWorldMatrix;

        object.rotation.setFromRotationMatrix(object.matrix);
    }



    http://chimera.labs.oreilly.com/books/1234000000802/ch04.html#shadows

    var axisX = new THREE.Vector3(1, 0, 0); // CHANGED
    var axisY = new THREE.Vector3(0, 1, 0); // CHANGED
    var axisZ = new THREE.Vector3(0, 0, 1); // CHANGED
    var binormal = new THREE.Vector3();
    var normal = new THREE.Vector3();


    function createMesh(geometry, materials) {
        fo.onCurrentSmash(function (mesh, newValue, formula, owner) {
            var parent = mesh.parent || scene;
            parent && parent.remove(mesh);
        });

        var mesh = new THREE.Mesh(geometry, materials);
        return mesh;

    }

    //http://threejs.org/docs/#Reference/Math/Euler

    //this is where static models get stores
    //var mesh3D = fo.defineClass('mesh3D', fo.Node)  
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
            applyMatrix: function(matrix){
                var mesh = this.mesh;
                mesh.applyMatrix(matrix);
                return this;
            },
            addTranslation: function (x,y,z) {
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
                if (root && root.mesh && root.mesh != scene) {
                    if (!root.mesh.parent) {
                        root.draw();
                    }
                }
                var target = root && root.mesh ? root.mesh : scene;
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


    //http://stackoverflow.com/questions/26456410/three-js-lines-normal-to-a-sphere

    var typeBody = fo.establishType('three::Body', {
        type: 'block',
        geometrySpec: {},
        geometry: function () {
            var spec = this.geometrySpec;
            var type = (spec && spec.type) || this.type;
            return geo.primitive(type, spec);
        },
        materialSpec: {},
        materials: function () {
            if (!this.materialSpec) return;
            var spec = tools.asSpecObject(this.materialSpec);
            var shade = (spec && spec.type) || 'phong';
            return geo.material(shade, spec);
        },

    }, mesh3D);


 

    var typePipe = fo.establishType('three::Pipe', {
        type: 'tube',
        geometrySpec: {},
        geometry: function () {
            var spec = this.geometrySpec;
            var type = (spec && spec.type) || this.type;
            return geo.primitive(type, spec, geo.spline(type, spec));
        },
        materialSpec: {},
        materials: function () {
            if (!this.materialSpec) return;
            var spec = this.materialSpec;
            var shade = (spec && spec.type) || 'line';
            return geo.material(shade, spec);
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
    geo.definePrimitive = definePrimitive;


    function defineModel(name, geometry, materials) {
        var namespace = '3dModel::' + name;
        var type = fo.establishType(namespace, {
            myName: name,
            geometry: geometry,
            materials: materials && geo.material('face', materials),
        }, mesh3D);

        return type;
    }
    geo.defineModel = defineModel;


    var globeMesh;
    geo.addGlobe = function (noTexture, radius) {
        if (globeMesh) return globeMesh;

        var material;
        var spGeo = new THREE.SphereGeometry(radius || EARTH_RADIUS, 50, 50);

        if (!noTexture) {
            var planetTexture = THREE.ImageUtils.loadTexture("assets/world-big-2-grey.jpg");
            material = new THREE.MeshPhongMaterial({
                map: planetTexture,
                shininess: 0.8
            });
        } else {
            material = new THREE.MeshBasicMaterial({
                color: 0x11ff11,
                wireframe: true
            });
        }

        globeMesh = new THREE.Mesh(spGeo, material);
        scene.add(globeMesh);

        camera = defaultCameras['perspective'];

        geo.zoomToPosition(new THREE.Vector3(0, 0, 1000));
        geo.lookAtPosition(new THREE.Vector3(0, 0, 0));

        return globeMesh;
    }

    geo.removeGlobe = function () {
        if (globeMesh) {
            scene.remove(globeMesh);
            globeMesh = undefined;
        }
    };


    function animate() {
        requestAnimationFrame(animate);

        controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

        if (geo.onNextAnimationFrame) {
            geo.onNextAnimationFrame();
        };

        if (geo.customRenderer) {
            geo.customRenderer(webglRenderer, scene, camera);
        } else {
            webglRenderer.render(scene, camera);
        }

    }
    geo.animate = animate;
    geo.onNextAnimationFrame;
    geo.jsonLoader = new THREE.JSONLoader();

    geo.customRenderer = function (renderer, scene, camera) {
        renderer.render(scene, camera)
    };
    geo.customRenderer = undefined;
    geo.renderScene = function (root, view) {
        webglRenderer.render(root || scene, view || camera);
    }


    //http://www.smartjava.org/content/render-open-data-3d-world-globe-threejs
    // convert the positions from a lat, lon to a position on a sphere.
    geo.latLongToVector3 = function (lat, lon, radius, height) {
        radius = radius ? radius : EARTH_RADIUS;
        height = height ? height : 0;

        var phi = (lat).toRad();
        var theta = (lon - 180).toRad();

        var x = -(radius + height) * Math.cos(phi) * Math.cos(theta);
        var y = (radius + height) * Math.sin(phi);
        var z = (radius + height) * Math.cos(phi) * Math.sin(theta);

        return new THREE.Vector3(x, y, z);
    }

    geo.bearingTo = function (lat1, lon1, lat2, lon2) {
        var lat1 = lat1.toRad();
        var lat2 = lat2.toRad();
        var dLon = (lon2 - lon1).toRad();

        var y = Math.sin(dLon) * Math.cos(lat2);
        var x = Math.cos(lat1) * Math.sin(lat2) -
                Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        var brng = Math.atan2(y, x);

        return (brng.toDeg() + 360) % 360;
    };

    geo.distanceTo = function (lat1, lon1, lat2, lon2, radius) {

        radius = radius ? radius : EARTH_RADIUS;
        var lat1 = lat1.toRad();
        var lon1 = lon1.toRad();
        var lat2 = lat2.toRad();
        var lon2 = lon2.toRad();
        var dLat = lat2 - lat1;
        var dLon = lon2 - lon1;

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = radius * c;
        return d;
    };

    geo.destinationTo = function (lat1, lon1, brng, dist, radius) {
        var lat1 = lat1.toRad();
        var lon1 = lon1.toRad();
        radius = radius ? radius : EARTH_RADIUS;
        var angDist = dist / radius;  // convert dist to angular distance in radians
        var brng = brng.toRad();  // 

        var lat2 = Math.asin(Math.sin(lat1) * Math.cos(angDist) +
                              Math.cos(lat1) * Math.sin(angDist) * Math.cos(brng));
        var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(angDist) * Math.cos(lat1),
                                     Math.cos(angDist) - Math.sin(lat1) * Math.sin(lat2));
        lon2 = (lon2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI;  // normalise to -180..+180º

        return {
            lat: (lat2).toDeg(),
            lon: (lon2).toDeg(),
        }
    }

    geo.destinationToVector3 = function (lat1, lon1, brng, dist, radius) {
        var pos = geo.destinationTo(lat1, lon1, brng, dist, radius)
        return geo.latLongToVector3(pos.lat, pos.lon, radius)
    },


    geo.cameraPrimitive = function (type, data) {
        type = data && data.type ? data.type : type;
        type = data.type ? data.type : type;
        switch (type) {
            case 'perspective':
                camera = new THREE.PerspectiveCamera(
                    data.fov || 75, // Camera frustum vertical field of view.
                    data.aspect || window.innerWidth / window.innerHeight,// Camera frustum aspect ratio.
                    data.near || 1,//  Camera frustum near plane.
                    data.far ||  10000// Camera frustum far plane
                );
                break;
            case 'cube':
                camera = new THREE.CubeCamera(
                    data.near || 1, //  The near clipping distance. 
                    data.far || 100000, // The far clipping distance 
                    data.cubeResolution  || 128 // Sets the width of the cube. 
                );
                break;
            case 'orthographic':
                camera = new THREE.OrthographicCamera(
                    data.left, // Camera frustum left plane.
                    data.right, // Camera frustum right plane.
                    data.top, // Camera frustum top plane.
                    data.bottom, // Camera frustum bottom plane.
                    data.near, // Camera frustum near plane.
                    data.far  //  Camera frustum far plane.                
                );
                break;
            case 'helper':
                camera = new THREE.CameraHelper(
                    data.camera
                );
                break;
        }
        return camera;
    }

    geo.spline = function (type, data) {
        var curve;
        type = data && data.type ? data.type : type;
        switch (type) {
            case 'spline':
            default:
                curve = new THREE.CatmullRomCurve3(data.points || []);
                break;
        }
        return curve;
    }

    geo.primitive = function (type, data, curve) {
        var geometry;
        type = data && data.type ? data.type : type;
        switch (type) {
            case 'block':
                geometry = new THREE.BoxGeometry(
                    data.width,
                    data.height,
                    data.depth,
                    data.widthSegments,
                    data.heightSegments,
                    data.depthSegments
                );
                //you can move the vertexes
                //geometry.applyMatrix(new THREE.Matrix4().makeTranslation(data.width / 2, 0, 0));
                break;
            case 'plane':
                geometry = new THREE.PlaneGeometry(
					data.width,
					data.height,
					data.widthSegments,
					data.heightSegments
                );
                break;
            case 'tube':
                if (curve && curve.points.length == 0) {
                    geometry = new THREE.Geometry();
                } else {
                    geometry = new THREE.TubeGeometry(
                        curve || data.curve,  //path
                        data.segments || 0,    //segments
                        data.radius || 0,     //radius
                        data.radiusSegments || 0,     //radiusSegments
                        data.closed || false  //closed
                    );
                }
                break;
            case 'circle':
                geometry = new THREE.CircleGeometry(
					data.radius,
					data.segments,
					data.thetaStart,
					data.thetaLength
                ); break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(
                    data.radiusTop,
                    data.radiusBottom,
                    data.height,
                    data.radialSegments,
                    data.heightSegments,
                    data.openEnded,
                    data.thetaStart,
                    data.thetaLength
                );
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(
                    data.radius,
                    data.widthSegments,
                    data.heightSegments,
                    data.phiStart,
                    data.phiLength,
                    data.thetaStart,
                    data.thetaLength
                );
                break;
            case 'dodecahedron':
                geometry = new THREE.DodecahedronGeometry(
                    data.radius,
                    data.detail
                );
                break;
            case 'icosahedron':
                geometry = new THREE.IcosahedronGeometry(
                    data.radius,
                    data.detail
                );
                break;
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(
                    data.radius,
                    data.detail
                );
                break;
            case 'tetrahedron':
                geometry = new THREE.TetrahedronGeometry(
                    data.radius,
                    data.detail
                );
                break;
            case 'ring':
                geometry = new THREE.RingGeometry(
                    data.innerRadius,
                    data.outerRadius,
                    data.thetaSegments,
                    data.phiSegments,
                    data.thetaStart,
                    data.thetaLength
                );
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(
                    data.radius,
                    data.tube,
                    data.radialSegments,
                    data.tubularSegments,
                    data.arc
                );
                break;
            case 'knot':
                geometry = new THREE.TorusKnotGeometry(
                    data.radius,
                    data.tube,
                    data.radialSegments,
                    data.tubularSegments,
                    data.p,
                    data.q,
                    data.heightScale
                );
                break;
            case 'text':
                geometry = new THREE.TextGeometry(
                    data.text,
                    data.data
                );
                break;
            case 'object':
                geometry = new THREE.Geometry();
                break;
            default:
                geometry = new THREE.Geometry();
                break;
        }
        return geometry;
    }

    geo.material = function (type, data) {
        var material;
        type = data && data.type ? data.type : type;
        switch (type) {
            case 'lambert':
                material = new THREE.MeshLambertMaterial(data);
                break;
            case 'depth':
                material = new THREE.MeshDepthMaterial(data);
                break;
            case 'normal':
                material = new THREE.MeshNormalMaterial(data);
                break;
            case 'face':
                material = new THREE.MeshFaceMaterial(data);
                break;
            case 'basic':
                material = new THREE.MeshBasicMaterial(data);          
                break;
            case 'line':
                material = new THREE.LineBasicMaterial(data);
                break;
            case 'phong':
                material = new THREE.MeshPhongMaterial(data);
                break;
            default:
                material = new THREE.MeshPhongMaterial(data);
                break;

        }
        return material;
    }

    geo.light = function (type, data) {
        var light;
        type = data && data.type ? data.type : type;
        switch (type) {
            case 'ambient':
            default:
                light = new THREE.AmbientLight(0xffffff); // soft white light
                break;

        }
        return light;
    }

    var defaultCameras = {
        perspective: geo.cameraPrimitive('perspective', {
            type: 'perspective',
            fov: 75,
            aspect: window.innerWidth / window.innerHeight,
            near: 1,
            far: 10000
        }),
        cube: geo.cameraPrimitive('cube', {
            type: 'cube',
        }),
        orthographic: geo.cameraPrimitive('orthographic', {
            type: 'orthographic',
            left: 15,
            right: -15,
            top: 15,
            bottom: -15,
            near: 1,
            far: 10000,
        })
    }

    geo.init = function (id, cameraType, zoomPos, lookPos) {
        scene = new THREE.Scene();
        webglRenderer = new THREE.WebGLRenderer();

        camera = defaultCameras[cameraType || 'perspective'];

        geo.zoomToPosition(zoomPos || new THREE.Vector3(0, 0, 100));
        geo.lookAtPosition(lookPos || new THREE.Vector3(0, 0, 0));


        //http://stackoverflow.com/questions/10341224/render-three-js-into-a-div-element
        var container = document.getElementById(id);
        if (container) {
            camera.aspect = container.offsetWidth / container.offsetHeight;

            webglRenderer.setSize(container.offsetWidth, container.offsetHeight);
            container.appendChild(webglRenderer.domElement);
        } else {
            webglRenderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(webglRenderer.domElement);
        }

        function onWindowResize() {
            if (container) {
                camera.aspect = container.offsetWidth / container.offsetHeight;
                webglRenderer.setSize(container.offsetWidth, container.offsetHeight);
            } else {
                camera.aspect = window.innerWidth / window.innerHeight;
                webglRenderer.setSize(window.innerWidth, window.innerHeight);
            }
            camera.updateProjectionMatrix();
        }

        window.addEventListener('resize', onWindowResize, false);


        controls = new THREE.OrbitControls(camera, webglRenderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        light = geo.light(); // soft white light
        scene.add(light);

        var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
        scene.add(light);


        var directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(0, 1, 0);
        scene.add(directionalLight);

        var directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(1, 0, 0);
        scene.add(directionalLight);

        var light = new THREE.PointLight(0xff0000, 1, 100);
        light.position.set(850, 850, 850);
        scene.add(light);

        controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
        webglRenderer.render(scene, camera);

        return scene;
    }


    var mesh3DType = mesh3D.exportType('mesh3D');
    geo.rootGeom = function () {
        if (!rootGeom) {
            rootGeom = mesh3DType.newInstance({
                light: function () { return light; },
                camera: function () { return camera; },
                mesh: function () { return scene; }
            });
        }
        return rootGeom;
    }



    geo.interactiveMovement = function () {
        var INTERSECTED, SELECTED;
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        var offset = new THREE.Vector3();
        var objects = [];

        var plane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2000, 2000, 8, 8),
            new THREE.MeshBasicMaterial({ visible: false })
        );

        scene.add(plane);


        function onDocumentMouseMove(event) {

            event.preventDefault();

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            if (SELECTED) {
                var intersects = raycaster.intersectObject(plane);

                if (intersects.length > 0) {
                    SELECTED.position.copy(intersects[0].point.sub(offset));
                }
                return;
            }

            //var intersects = raycaster.intersectObjects(objects);

            //if (intersects.length > 0) {

            //    if (INTERSECTED != intersects[0].object) {

            //        if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);

            //        INTERSECTED = intersects[0].object;
            //        INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

            //        plane.position.copy(INTERSECTED.position);
            //        plane.lookAt(camera.position);
            //    }

            //    //container.style.cursor = 'pointer';

            //} else {
            //    if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            //    INTERSECTED = null;
            //    //container.style.cursor = 'auto';
            //}

        }

        function onDocumentMouseDown(event) {

            event.preventDefault();
            raycaster.setFromCamera(mouse, camera);

            objects = scene.children;

            var intersects = raycaster.intersectObjects(objects);

            if (intersects.length > 0) {

                controls.enabled = false;
                SELECTED = intersects[0].object;

                var intersects = raycaster.intersectObject(plane);
                if (intersects.length > 0) {
                    offset.copy(intersects[0].point).sub(plane.position);
                }

                //container.style.cursor = 'move';
            }

        }

        function onDocumentMouseUp(event) {

            event.preventDefault();
            controls.enabled = true;

            if (INTERSECTED) {
                plane.position.copy(INTERSECTED.position);
                SELECTED = null;
            }

            //container.style.cursor = 'auto';
        }



        webglRenderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        webglRenderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        webglRenderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);

    }

 

}(Foundry, Foundry.tools,  Scene3D));



(function (app, fo, tools, geo, undefined) {

    app.service('render3DService', function ($q) {

        var self = this;
        self.THREE = THREE;

        self.init = geo.init;
        self.rootGeom = geo.rootGeom;
        self.export = geo.export;
        self.animate = geo.animate;
        self.addGlobe = geo.addGlobe;
        self.removeGlobe = geo.removeGlobe;
        self.addLights = geo.addLights;
        self.latLongToVector3 = geo.latLongToVector3;
        self.llToPosition = geo.latLongToVector3;
        self.llToBearing = geo.bearingTo;
        self.llToDistance = geo.distanceTo;
        self.llToDestination = geo.destinationTo;
        self.llToDestinationPosition = geo.destinationToVector3;
        self.renderScene = geo.renderScene;
        self.spline = geo.spline;
        self.defineSolid = geo.definePrimitive;


        self.zoomToPos = geo.zoomToPos;
        self.cameraPosition = geo.cameraPosition;

        self.setCustomRenderer = function (funct) {
            geo.customRenderer = funct;
        }

        self.setAnimation = function (funct) {
            geo.onNextAnimationFrame = funct;
        }

        //function camera(name, geometrySpec) {
        //    //if possable advoid creating duplicate definitions
        //    var model = geo.modelDB.newInstance({
        //        myName: name,
        //        camera: geo.camera(name, geometrySpec),
        //        helper: geo.camera('helper', this.camera),
        //    });

        //    return model;
        //}

        //self.camera = camera;



        function definePrimitive(name, geometrySpec, materialSpec) {
            var deferred = $q.defer();

            var model = geo.definePrimitive(name, geometrySpec, materialSpec);
            deferred.resolve(model);

            return deferred.promise;
        }
        self.definePrimitive = definePrimitive;


        function defineModel(name, file) {
            var deferred = $q.defer();

            geo.jsonLoader.load(file, function (geometry, materials) {
                var model = geo.defineModel(name, geometry, materials);
                deferred.resolve(model);
            });

            return deferred.promise;
        }
        self.defineModel = defineModel;


    });

    app.service('design3DService', function (render3DService) {

        var self = this;
        self.THREE = THREE;

        self.init = geo.init;
        self.cameraPosition = geo.cameraPosition;
        self.animate = geo.animate;
        self.rootGeom = geo.rootGeom;

        var entityType = fo.defineClass('entity', fo.Component);
        // var entityType = fo.defineClass('entity', fo.Node);


        function extractSpec(obj) {
            var type = fo.findType(obj.myType)
            var result = {
                myName: obj.myName,
            };
            var spec = type.getSpec();
            for (var key in spec) {
                result[key] = obj[key];
            };
            delete result.material;
            return result;
        }

        var entity3D = fo.establishType('3d::entity', {
            context: {},
            doOrientation: function (geom) {
                this.context.doOrientation && this.context.doOrientation(geom);
            },
            doAddHelpers: function (geom) {
                this.context.doAddHelpers && this.context.doAddHelpers(geom);
            },
            position: function () { return this.context.position; },
            rotation: function () { return this.context.rotation; },

            model: function () {
                var context = this.context;
                var material = context.material;
                var type = context.type || tools.getType(context);
                if (tools.isTyped(context)) {
                    context = extractSpec(context);
                }
                var model = geo.definePrimitive(type, context, material);
                return model;
            },
            instance: function () {
                var context = this.context;
                var parent = this.myParent && this.myParent.geom;
                var obj = this.model.newExactInstance(context, undefined, parent);
                return obj;
            },
            geom: function () {
                fo.onCurrentSmash(function (oldValue, newValue, formula, owner) {
                    //this will trigger a smash of mesh and removal from the scene
                    //probably shoule destroy geom model because a new
                    //one will be constructed
                    oldValue.smash();
                });

                //these rules force a geom to move it's mesh to the right place
                //it might be better for mesh to be demanded and force orientation
                //currently geom depends on mesh...
                //maybe mesh should only depend on geom
                //this could help the world flow simulation of growing the same tower
                var geom = this.instance;
                if (this.rotation) {
                    geom.rotation(this.rotation);
                }

                if (this.position) {
                    geom.position(this.position);
                }

                if (this.doOrientation) {
                    this.doOrientation(geom);
                }
                if (this.doAddHelpers) {
                    this.doAddHelpers(geom);
                }
                return geom;
            },
            //mesh: function() {
            //    var geom = this.geom;
            //    if (this.position) {
            //        geom.position(this.position);
            //    }
            //    if (this.doOrientation) {
            //        this.doOrientation(geom);
            //    }
            //    return geom.mesh;
            //},
            curve: function () {
                return this.instance.curve;
            },
            geometry: function () {
                return this.instance.geometry;
            },
            boundingBox: function () {
                return this.geom.boundingBox();
            }
        }, entityType)
        //.onCreationCompleted(function (properties, subcomponents, parent) {
        //    var name = properties && properties.context && properties.context.myName;
        //    this.myName = this.myName ? this.myName : name;
        //})

        .methods({
            stats: function () {
                var prop = this.getManagedProperty && this.getManagedProperty('geom');
                if (prop && prop.isValueKnown()) {
                    //may be too aggressive and only works if displayed
                    var geom = prop.getValue();
                    var result = {
                        geometrySpec: geom.geometrySpec,
                        materialSpec: geom.materialSpec,
                        position: geom.mesh.position,
                        rotation: geom.mesh.rotation,
                    }
                    return result;
                } else {
                    var geom = this.geom;
                    var result = {
                        geometrySpec: geom.geometrySpec,
                        materialSpec: geom.materialSpec,
                        position: geom.mesh.position,
                        rotation: geom.mesh.rotation,
                    }
                    return result;
                }
                return '?';
            },
            draw: function () {
                try {
                    var prop = this.getManagedProperty && this.getManagedProperty('geom');
                    if (prop) {
                        var parent = this.myParent && this.myParent.geom;
                        var geom = prop.getValue();
                        //drawing is the only way things get added to the scene
                        geom.draw(parent);
                    } else if (!tools.isaComponent(this)) {
                        var parent = this.myParent && this.myParent.geom;
                        this.geom.draw(parent);
                    }
                } catch (ex) {
                    alert("draw:" + ex);
                }
                return this;
            },
            hide: function () {
                try {
                    var prop = this.getManagedProperty && this.getManagedProperty('geom');
                    if (prop && prop.isValueKnown()) {
                        var geom = prop.getValue();
                        geom.hide();
                    } else if (!tools.isaComponent(this)) {
                        this.geom.hide();
                    }
                } catch (ex) {
                    alert("hide:" + ex);
                }
                return this;
            },
            undraw: function () {
                try {
                    var prop = this.getManagedProperty && this.getManagedProperty('geom');
                    if (prop && prop.isValueKnown()) {
                        var geom = prop.getValue();
                        geom.undraw();
                    } else if (!tools.isaComponent(this)) {
                        this.geom.undraw();
                    }
                } catch (ex) {
                    alert("undraw:" + ex);
                }
                return this;
            },
            render: function (show) {
                var self = this;
                return fo.suspendDependencies(function () {
                    show == undefined || show ? self.draw() : self.undraw();
                    self.mySubcomponents().forEach(function (item) {
                        item.render(show);
                    });
                    return self;
                })
            }
        });


        self.entity3D = entity3D;
        var entityDB = fo.db.getEntityDB('3d::entity');

        self.entityDB = entityDB;
        self.newInstance = function (properties, subcomponents, parent) {
            var obj = entityDB.newInstance(properties, subcomponents, parent);
            return obj;
        };


        function loadEntity(name, file) {
            var namespace = '3d::' + name;

            render3DService.defineModel(name, file)
            .then(function (modelDef) {
                fo.establishType(namespace, {
                    model: modelDef,
                });
                fo.establishSubType(namespace, entity3D);
            });
            return fo.establishType(namespace);
        }

        self.loadEntity = loadEntity;


        self.defineType = function (id, spec, constructorFn) {
            var type = fo.establishType(id, spec, constructorFn);
            //type.inheritsFromType(design3DService.entity3D);
            fo.establishSubType(id, entity3D);  //make this the job of render so things are efficent on terminal nodes.

            return type;
        }


        var viewModelDictionary = {};
        self.viewModel = undefined;

        function establishViewModel(context) {
            if (self.viewModel) {
                return self.viewModel;
            }

            var viewModel = self.newInstance({
                context: context.evaluate().unique(),  //compute values outside of render loop
                myName: context.myName,
                geom: function () {
                    return self.rootGeom();
                },
            });
            viewModel.myGuid = context.myGuid;
            self.viewModel = viewModel;
            viewModelDictionary = {};
            viewModelDictionary[viewModel.myGuid] = viewModel;
            return viewModel;
        }

        function lastRenderedParent(obj) {
            var parent = obj.myParent;
            if (!parent) {
                throw new Error('lastRenderedParent is missing!');
            }
            return viewModelDictionary[parent.myGuid];
        }

        function renderModelAs(context, isRoot) {
            if (context && isRoot) {
                return establishViewModel(context);
            }

            var entity = viewModelDictionary[context.myGuid];
            if (!entity) {
                var name = tools.computeNamespace('3d', context);
                var type = fo.findType(name) || self.entity3D;

                //now do the right stuff to create the 
                var model = {
                    context: context.evaluate().unique(),  //compute values outside of render loop
                    myName: context.myName,
                    myGuid: context.myGuid,
                };

                //the context should have a view rendered already
                var viewParent = lastRenderedParent(context);
                if (!viewParent) {
                    viewParent = renderModelAs(context.myParent);
                }

                entity = type.newInstance(model, undefined, viewParent);
                viewParent.capture(entity);
                viewModelDictionary[context.myGuid] = entity;

                //try to create subcomponentsWatcher dependency
                var prop = context.getManagedProperty('subcomponentsWatcher');
                var subcomponents = context.getCollection('subcomponents');
                if (!prop && subcomponents) {
                    prop = subcomponents.getManagedProperty('count');
                }

                entity.syncronizeManagedProperty(prop, function (sync) {
                    sync.onValueSmash = function (newValue, formula, owner) {
                        fo.publishNoLock && fo.publishNoLock('reexpand', [owner, this]);
                        var found = owner.getCollection('subcomponents');
                        found.forEach(function (child) {
                            var prop = child.getManagedProperty('geom');
                            prop && prop.smash();
                        });
                        found && found.reset();
                    };
                    sync.onValueDetermined = function (newValue, formula, owner) {
                        //maybe queue for circulation
                        fo.publishNoLock && fo.publishNoLock('expanded', [owner, this]);
                        renderModelAs(owner);
                    };
                });
            }

            var subcomponents = context && context.mySubcomponents();
            subcomponents && subcomponents.forEach(function (child) {
                renderModelAs(child);
            });

            return entity;
        };

        self.renderModelAs = function (obj, isRoot) {
            //return fo.suspendDependencies(function () {
                return renderModelAs(obj, isRoot);
            //});
        }

        self.flushModel = function () {
            var viewModel = self.viewModel;
            viewModel.render(false);
            viewModel.purgeMySubcomponents();
            viewModelDictionary = {};
            viewModelDictionary[viewModel.myGuid] = viewModel;
            return viewModel;
        }

        self.generateModel = function (model) {
            var viewModel = self.renderModelAs(model, true);
            self.renderModelAs(model);
            return viewModel;
        }

    });

}(foApp, Foundry, Foundry.tools, Scene3D));