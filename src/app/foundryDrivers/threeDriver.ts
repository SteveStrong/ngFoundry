
import { Scene, PerspectiveCamera, OrthographicCamera, BoxGeometry, MeshBasicMaterial, Mesh, WebGLRenderer } from 'three';

import { Vector3, Vector2, Object3D, Quaternion, EventDispatcher } from 'three';

let STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };

// The four arrow keys
let KEYS = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
let MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2 };

// Mouse buttons
let MOUSEBUTTONS = { ORBIT: MOUSE.LEFT, ZOOM: MOUSE.MIDDLE, PAN: MOUSE.RIGHT };


export class OrbitConstraint {
    camera;

    constructor(camera) {
        this.camera = camera;
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
        let te = this.camera.matrix.elements;
        // get X column of matrix
        v.set(te[0], te[1], te[2]);
        v.multiplyScalar(- distance);

        this.panOffset.add(v);
    }

    // pass in distance in world space to move up
    panUp(distance: number = 0) {
        let v = new Vector3();
        let te = this.camera.matrix.elements;

        // get Y column of matrix
        v.set(te[4], te[5], te[6]);
        v.multiplyScalar(distance);

        this.panOffset.add(v);
    }

    // pass in x,y of change desired in pixel space,
    // right and down are positive
    pan(deltaX: number, deltaY: number, screenWidth: number, screenHeight: number) {

        if (this.camera instanceof PerspectiveCamera) {

            // perspective
            let position = this.camera.position;
            let offset = position.clone().sub(this.target);
            let targetDistance = offset.length();

            // half of the fov is center to top of screen
            targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0);

            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            this.panLeft(2 * deltaX * targetDistance / screenHeight);
            this.panUp(2 * deltaY * targetDistance / screenHeight);

        } else if (this.camera instanceof OrthographicCamera) {

            // orthographic
            this.panLeft(deltaX * (this.camera.right - this.camera.left) / screenWidth);
            this.panUp(deltaY * (this.camera.top - this.camera.bottom) / screenHeight);

        } else {

            // camera neither orthographic or perspective
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');

        }

    };

    dollyIn(dollyScale: number) {

        if (this.camera instanceof PerspectiveCamera) {

            this.scale /= dollyScale;

        } else if (this.camera instanceof OrthographicCamera) {

            this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom * dollyScale));
            this.camera.updateProjectionMatrix();
            this.zoomChanged = true;

        } else {

            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');

        }

    };

    dollyOut(dollyScale: number) {

        if (this.camera instanceof PerspectiveCamera) {

            this.scale *= dollyScale;

        } else if (this.camera instanceof OrthographicCamera) {

            this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom / dollyScale));
            this.camera.updateProjectionMatrix();
            this.zoomChanged = true;

        } else {

            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');

        }

    };

    update() {

        let offset = new Vector3();

        // so camera.up is the orbit axis
        let quat = new Quaternion().setFromUnitVectors(this.camera.up, new Vector3(0, 1, 0));
        let quatInverse = quat.clone().inverse();

        let lastPosition = new Vector3();
        let lastQuaternion = new Quaternion();


        let position = this.camera.position;

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

        var radius = offset.length() * this.scale;

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

        this.camera.lookAt(this.target);

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
            lastPosition.distanceToSquared(this.camera.position) > this.EPS ||
            8 * (1 - lastQuaternion.dot(this.camera.quaternion)) > this.EPS) {

            lastPosition.copy(this.camera.position);
            lastQuaternion.copy(this.camera.quaternion);
            this.zoomChanged = false;
        }
        return true;
    }

};

export class CustomOrbitControls extends EventDispatcher {

    // This set of controls performs orbiting, dollying (zooming), and panning. It maintains
    // the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
    // supported.
    //
    //    Orbit - left mouse / touch: one finger move
    //    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
    //    Pan - right mouse, or arrow keys / touch: three finger swipe

    constraint: OrbitConstraint;
    camera: any;
    target: any;

    domElement;

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

    // Set to false to disable this control
    enabled = true;

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

    constructor(camera, domElement) {
        super()
        this.constraint = new OrbitConstraint(camera);

        this.domElement = domElement !== undefined ? domElement : document;

        this.domElement.addEventListener('contextmenu', this.contextmenu, false);

        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        this.domElement.addEventListener('mousewheel', this.onMouseWheel.bind(this), false);
        this.domElement.addEventListener('DOMMouseScroll', this.onMouseWheel.bind(this), false); // firefox

        this.domElement.addEventListener('touchstart', this.touchstart.bind(this), false);
        this.domElement.addEventListener('touchend', this.touchend.bind(this), false);
        this.domElement.addEventListener('touchmove', this.touchmove.bind(this), false);

        window.addEventListener('keydown', this.onKeyDown.bind(this), false);

    }

    getPolarAngle() {
        return this.constraint.getPolarAngle();
    };

    getAzimuthalAngle() {
        return this.constraint.getAzimuthalAngle();
    };


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

        this.camera.updateProjectionMatrix();
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

            document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
            document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
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

        if (this.state !== STATE.NONE) {
            this.update();
        }

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


class block3D {
    mesh: Mesh;
    constructor(width: number, height: number, depth: number) {

        let geometry: BoxGeometry = new BoxGeometry(width, height, depth);
        let material: MeshBasicMaterial = new MeshBasicMaterial({ color: 0x990033, wireframe: false });

        this.mesh = new Mesh(geometry, material);
    }

    render3D = () => {
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;
    };

}


export class Screen3D {
    private stopped: boolean = true;
    width: number = window.innerWidth;
    height: number = window.innerHeight;

    //https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
    requestAnimation = window.requestAnimationFrame || window.webkitRequestAnimationFrame; // || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;;
    cancelAnimation = window.cancelAnimationFrame; // || window.mozCancelAnimationFrame;

    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    controls: any;
    body: Object3D = new Object3D();

    render3D = (screen: Screen3D, deep: boolean = true) => void {};

    constructor() {
    }


    public doAnimate = (): void => {
        this.render3D(this);
        //this.controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

        //this.body.animate && this.body.animate();
        this.renderer.render(this.scene, this.camera);
        this._request = this.requestAnimation(this.doAnimate);
    }


    private _request: any;
    go(next?: () => {}) {
        this.stopped = false;
        this.doAnimate();
        next && next();
    }


    stop(next?: () => {}) {
        this.stopped = true;
        this.cancelAnimation(this._request)
        next && next();
    }

    toggleOnOff(): boolean {
        this.stopped ? this.go() : this.stop();
        return this.stopped;
    }

    clear() {
        this.scene = new Scene();
    }

    setRoot(nativeElement: HTMLElement, width: number = Number.NaN, height: number = Number.NaN): HTMLElement {

        // // set the width and height
        this.width = Number.isNaN(width) ? window.innerWidth : width;
        this.height = Number.isNaN(height) ? window.innerHeight : height;

        this.scene = new Scene();
        this.scene.add(this.body)

        this.camera = new PerspectiveCamera(75, this.width / this.height, 1, 10000);
        this.camera.position.z = 1000;

        this.renderer = new WebGLRenderer();
        this.renderer.setSize(this.width, this.height);

        this.controls = new CustomOrbitControls(this.camera, this.renderer.domElement);
        //this.controls.addEventListener('change', this.renderer); // add this only if there is no animation loop (requestAnimationFrame)
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;

        nativeElement.appendChild(this.renderer.domElement);
        return nativeElement;
    }

    addToScene(obj: any) {
        this.body.add(obj.mesh);
        //this.scene.add(obj.mesh);
    }

    addBlock(width: number, height: number, depth: number) {
        let obj = new block3D(width, height, depth);
        this.addToScene(obj);
    }

}