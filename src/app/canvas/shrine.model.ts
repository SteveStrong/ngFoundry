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
    let begin = new Vector3(0, 0, 0)
    let end = new Vector3(100, 200, 300)
    let curve = new LineCurve3(begin, end)
    let radius = (this.height + this.depth) / 2;
    return new TubeGeometry(curve, this.segments, radius, this.radiusSegments, false);
  }
}






function doBand(obj: foShape3D, setback) {
  let bandwidth = 10;
  let thickness = 5;
  let width = obj.width + 2 * thickness;
  let height = obj.height + 2 * thickness;

  ShrineStencil.impermanent<foShape3D>('left', foShape3D)
    .newInstance({
      width: thickness,
      height: height,
      depth: bandwidth,
      color: 'yellow'
    }).addAsSubcomponent(obj).dropAt(obj.width / 2, 0, setback);

  ShrineStencil.impermanent<foShape3D>('right', foShape3D)
    .newInstance({
      width: thickness,
      height: height,
      depth: bandwidth,
      color: 'yellow'
    }).addAsSubcomponent(obj).dropAt(-obj.width / 2, 0, setback)

  ShrineStencil.impermanent<foShape3D>('top', foShape3D)
    .newInstance({
      width: width,
      height: thickness,
      depth: bandwidth,
      color: 'yellow'
    }).addAsSubcomponent(obj).dropAt(0, obj.height / 2, setback)

  ShrineStencil.impermanent<foShape3D>('bottom', foShape3D)
    .newInstance({
      width: width,
      height: thickness,
      depth: bandwidth,
      color: 'yellow'
    }).addAsSubcomponent(obj).dropAt(0, -obj.height / 2, setback)
}

function doBase(obj: foShape3D) {

  let step = obj.height / 2;
  let base = step / 2;
  let left = obj.width / 2;

  ShrineStencil.impermanent<foShape3D>('bottom', foShape3D)
    .newInstance({
      width: obj.width,
      height: step,
      depth: obj.depth,
      color: 'gray'
    }).addAsSubcomponent(obj).dropAt(left, -step / 2, 0)

  ShrineStencil.impermanent<foShape3D>('bottom', foShape3D)
    .newInstance({
      width: 2 * obj.width,
      height: base,
      depth: obj.depth,
      color: 'gray'
    }).addAsSubcomponent(obj).dropAt(0, -step - base / 2, 0)
}

let minibox = ShrineStencil.define<foShape3D>('box', foShape3D, {
  color: 'blue',
  opacity: .6,
  width: 400,
  height: 500,
  depth: 400
}).onCreation(obj => {

  let lightspace = 100;

  obj.y = obj.height / 2;

  doBand(obj, (obj.depth / 2) - 40);
  doBand(obj, (-obj.depth / 2) + 40);


  ShrineStencil.impermanent<foShape3D>('center', foShape3D)
  .newInstance({
    opacity: .5,
    width: .95 * obj.width,
    height: .95 * obj.height - lightspace,
    depth: .95 * obj.depth,
    y: obj.height / 2;
    color: 'red'
  }).addAsSubcomponent(obj).dropAt(0, -lightspace/2, 0)

}).hide();

ShrineStencil.define<foShape3D>('shrine', foShape3D, {
  color: 'green',
  opacity: 0,
  width: 400,
  height: 500,
  depth: 400,
  y: function () { return this.height / 2 }
}).onCreation(obj => {

  let left = obj.width / 2;
  let right = -obj.width / 2;

  let step = obj.height / 2;

  doBase(obj)

  minibox.makeComponent(obj)
    .dropAt(right, 0, 0)

  minibox.makeComponent(obj)
    .dropAt(left, step, 0)

  minibox.makeComponent(obj)
    .dropAt(right, 2 * step, 0)

  minibox.makeComponent(obj)
    .dropAt(left, 3 * step, 0)

  minibox.makeComponent(obj)
    .dropAt(right, 4 * step, 0)
})

