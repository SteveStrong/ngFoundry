
import { Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, Mesh, WebGLRenderer }  from 'three';

function doAnimate(mySelf) {
    function animate() {
        requestAnimationFrame(animate);

        mySelf.doRotation(.01, .02, .03);
    }
    animate();
}

export class Screen3D {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    geometry: BoxGeometry;
    material: MeshBasicMaterial;
    mesh: Mesh;

    width:number = window.innerWidth;
    height:number = window.innerHeight;

    doRotation(x, y, z) {
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;

        this.renderer.render(this.scene, this.camera);
    }

    go() {
        doAnimate(this);
    }

    clear() {
        this.scene = new Scene();
    }

    setRoot(nativeElement: HTMLElement, width: number= Number.NaN, height: number= Number.NaN): HTMLElement {

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