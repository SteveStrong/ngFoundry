import { Tools } from '../foundry/foTools';

import { foGlyph3D } from "../foundry/solids/foGlyph3D.model";

import { foShape3D, shape3DNames } from "../foundry/solids/foShape3D.model";
import { foModel3D, foSphere } from "../foundry/solids/foBody.model";
import { foText3D } from "../foundry/solids/foText3D.model";
import { foImage3D } from "../foundry/solids/foImage3D.model";
import { foPipe3D } from "../foundry/solids/foPipe3D.model";

import { ThreeByThreeCircle, OneByOne, TwoByOne, TwoByTwo, TwoByFour, OneByTen, TenByTen } from "./legoshapes.model";

import { foStencilLibrary } from "../foundry/foStencil";
import { RuntimeType } from '../foundry/foRuntimeType';
import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";

import { LineCurve3, CurvePath, TubeGeometry, BoxGeometry, MultiMaterial, Material, Geometry, FontLoader, Font, TextGeometry, MeshPhongMaterial, MeshBasicMaterial, Mesh, Vector3 } from 'three';

export let ShrineStencil: foStencilLibrary = new foStencilLibrary().defaultName();

ShrineStencil.define<foShape3D>('shrine body', foShape3D, {
  color: 'green',
  opacity: .3,
  width: 200,
  height: 400,
  depth: 200
});

//https://threejs.org/examples/#webgl_geometry_shapes

class band extends foShape3D {
  protected _segments: number;
  protected _radiusSegments: number;

  get segments(): number { return this._segments || 10; }
  set segments(value: number) {
      value != this._segments && this.clearMesh();
      this._segments = value;
  }
  get radiusSegments(): number { return this._radiusSegments || 10; }
  set radiusSegments(value: number) {
      value != this._radiusSegments && this.clearMesh();
      this._radiusSegments = value;
  }
  
  geometry = (spec?: any): Geometry => {
    let begin = new Vector3(0,0,0)
    let end = new Vector3(100,200,300)
    let curve = new LineCurve3(begin, end)
    let radius = (this.height + this.depth) / 2;
    return new TubeGeometry(curve, this.segments, radius, this.radiusSegments, false);
}
}

ShrineStencil.define<foShape3D>('band', band, {
  color: 'yellow',
  width: 200,
  height: 400,
  depth: 200
});

ShrineStencil.define<foShape3D>('boxsegment', foShape3D, {
  color: 'yellow',
  width: 200,
  height: 10,
  depth: 10
});


ShrineStencil.define<foShape3D>('openbox', foShape3D, {
  color: 'yellow',
  opacity: .5,
  width: 200,
  height: 400,
  depth: 10
});


ShrineStencil.define<foShape3D>('shrine', foShape3D, {
  color: 'blue',
  opacity: .1,
  width: 200,
  height: 400,
  depth: 200
}).subComponent('body',ShrineStencil.find<foShape3D>('shrine body' ), {
  width: 20
});

