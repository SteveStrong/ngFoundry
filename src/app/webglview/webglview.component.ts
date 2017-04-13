//import { element } from 'protractor/built';
import { Component, OnInit, ViewChild } from '@angular/core';

import * as THREE from 'three';
//import 'webvr-polyfill';
//import 'three/examples/js/controls/VRControls.js';
//import 'three/examples/js/effects/VREffect.js';

function doAnimate(mySelf) {
  function animate() {
    requestAnimationFrame(animate);

    mySelf.mesh.rotation.x += 0.01;
    mySelf.mesh.rotation.y += 0.02;

    mySelf.renderer.render(mySelf.scene, mySelf.camera);
  }
  animate();
}

@Component({
  selector: 'app-webglview',
  templateUrl: './webglview.component.html',
  styleUrls: ['./webglview.component.css']
})
export class WebglviewComponent implements OnInit {


  scene: any = {}
  camera: any = {};
  renderer: any = {}
  geometry: any = {};
  material: any = {};
  mesh: any = {};

  //https://www.npmjs.com/package/three

  constructor() { }

  ngOnInit() {
    this.init();
    this.renderer.render(this.scene, this.camera);
    doAnimate(this);
  }

  init() {

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = 1000;

    this.geometry = new THREE.BoxGeometry(100, 400, 900);
    this.material = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    var element = document.getElementById('drawhere')
    element.appendChild(this.renderer.domElement);
  }

}
