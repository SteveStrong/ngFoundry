
import { Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, Mesh, WebGLRenderer } from 'three';

import { NgZone } from '@angular/core';

class block3D {
    mesh: Mesh;
    constructor(width: number, height: number, depth: number) {

        let geometry: BoxGeometry = new BoxGeometry(width, height, depth);
        let material: MeshBasicMaterial = new MeshBasicMaterial({ color: 0x990033, wireframe: false });

        this.mesh = new Mesh(geometry, material);
    }

    addToScene(sceen: Scene) {
        sceen.add(this.mesh);
    }


    preRender3D = () => {
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

    list: Array<any> = new Array();

    preRender3D: (screen:Screen3D) => void;

    constructor() {

        this.preRender3D = (screen) => {
            this.list.forEach(item => {
                item.preRender3D(screen)
            })
        };
    }


    public doAnimate = (): void => {
        // if ( NgZone.assertInAngularZone() ) {
        //     console.log('Screen3D: in the zone')
        // }
        this.preRender3D(this);
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

        this.camera = new PerspectiveCamera(75, this.width / this.height, 1, 10000);
        this.camera.position.z = 1000;

        this.renderer = new WebGLRenderer();
        this.renderer.setSize(this.width, this.height);

        nativeElement.appendChild(this.renderer.domElement);
        return nativeElement;
    }

    addToScene(obj: any) {
        this.list.push(obj);
        this.scene.add(obj.mesh);
    }

    addBlock(width: number, height: number, depth: number) {
        let obj = new block3D(width, height, depth);
        this.addToScene(obj);
    }

}