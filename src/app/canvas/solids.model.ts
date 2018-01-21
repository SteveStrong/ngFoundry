import { Tools } from '../foundry/foTools';
import { cPoint2D, cMargin } from '../foundry/foGeometry2D';
import { foGlyph2D } from "../foundry/foGlyph2D.model";
import { foGlyph3D } from "../foundry/foGlyph3D.model";
import { foShape2D, shape2DNames } from "../foundry/foShape2D.model";
import { foShape1D } from "../foundry/foShape1D.model";
import { foShape3D, foModel3D, foSphere } from "../foundry/foShape3D.model";
import { foText3D } from "../foundry/foText3D.model";
import { foImage3D } from "../foundry/foImage3D.model";
import { foNode } from "../foundry/foNode.model";
import { foObject } from "../foundry/foObject.model";
import { ThreeByThreeCircle, OneByOne, TwoByOne, TwoByTwo, TwoByFour, OneByTen, TenByTen } from "./legoshapes.model";

import { foStencilLibrary } from "../foundry/foStencil";
import { RuntimeType } from '../foundry/foRuntimeType';
import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";

import { SphereGeometry, JSONLoader, MultiMaterial, Material, Geometry, FontLoader, Font, TextGeometry, MeshPhongMaterial, MeshBasicMaterial, Mesh, Vector3 } from 'three';

export let SolidStencil: foStencilLibrary = new foStencilLibrary().defaultName();

SolidStencil.define<foGlyph3D>('block', foGlyph3D, {
  color: 'green',
  width: 100,
  height: 400,
  depth: 900
});

export class Sphere extends foSphere {
  doBigger() {
    this.radius += 30;
    this.smash();
  }

  doSmaller() {
    this.radius -= 30;
    this.smash();
  }

  doX() {
    this.x += 30;
  }

  doY() {
    this.y -= 30;
  }
}


SolidStencil.define<Sphere>('sphere', Sphere, {
  color: 'orange',
  radius: 100,
  width: function () { return this.radius },
  height: function () { return this.radius },
  depth: function () { return this.radius },
}).addCommands("doBigger", "doSmaller", "doX", "doY");



SolidStencil.define<foModel3D>('Model3D', foModel3D, {
  url: "assets/models/707.js"
});




SolidStencil.define<foText3D>('3D::Text', foText3D, {
  color: 'green',
  background: 'grey',
  text: 'HELLO STEVE',
  fontSize: 30,
});

SolidStencil.define<foImage3D>('3D::Image', foImage3D, {
  background: 'green',
  width: 400,
  height: 250
});