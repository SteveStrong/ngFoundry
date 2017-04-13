import * as THREE from 'three';

function doAnimate(mySelf) {
    function animate() {
        requestAnimationFrame(animate);

        mySelf.doRotation(.01, .02, .03);
    }
    animate();
}

export class Sceen3D {
    scene: any = {}
    camera: any = {};
    renderer: any = {}
    geometry: any = {};
    material: any = {};
    mesh: any = {};

    doRotation(x, y, z) {
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;

        this.renderer.render(this.scene, this.camera);
    }

    go() {
        doAnimate(this);
    }

    init(id) {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.z = 1000;

        this.geometry = new THREE.BoxGeometry(100, 400, 900);
        this.material = new THREE.MeshBasicMaterial({ color: 0x990033, wireframe: false });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        var element = document.getElementById(id)
        element.appendChild(this.renderer.domElement);
    }
}