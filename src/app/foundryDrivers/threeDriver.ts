
import { Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, Mesh, WebGLRenderer } from 'three';

function doAnimate(mySelf) {
    function animate() {
        requestAnimationFrame(animate);

        mySelf.doRotation(.01, .02, .03);
    }
    animate();
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
    geometry: BoxGeometry;
    material: MeshBasicMaterial;
    mesh: Mesh;

    render: (context: CanvasRenderingContext2D) => void;


    public doAnimate = (): void => {
        this.doRotation(.01, .02, .03);
        this.renderer.render(this.scene, this.camera);
        this._request = this.requestAnimation(this.doAnimate);
    }

    doRotation(x, y, z) {
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;

        this.renderer.render(this.scene, this.camera);
    }

    go() {
        doAnimate(this);
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

        this.camera = new PerspectiveCamera(75, this.width / this.height, 1, 10000);
        this.camera.position.z = 1000;

        this.geometry = new BoxGeometry(100, 400, 900);
        this.material = new MeshBasicMaterial({ color: 0x990033, wireframe: false });

        this.mesh = new Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        this.renderer = new WebGLRenderer();
        this.renderer.setSize(this.width, this.height);

        nativeElement.appendChild(this.renderer.domElement);
        return nativeElement;
    }

    // init(id) {
    //     this.scene = new THREE.Scene();

    //     this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    //     this.camera.position.z = 1000;

    //     this.geometry = new THREE.BoxGeometry(100, 400, 900);
    //     this.material = new THREE.MeshBasicMaterial({ color: 0x990033, wireframe: false });

    //     this.mesh = new THREE.Mesh(this.geometry, this.material);
    //     this.scene.add(this.mesh);

    //     this.renderer = new THREE.WebGLRenderer();
    //     this.renderer.setSize(window.innerWidth, window.innerHeight);

    //     var element = document.getElementById(id)
    //     element.appendChild(this.renderer.domElement);
    // }
}