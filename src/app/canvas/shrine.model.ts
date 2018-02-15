import { Tools } from '../foundry/foTools';

import { foGlyph3D } from "../foundry/solids/foGlyph3D.model";

import { foShape3D, shape3DNames } from "../foundry/solids/foShape3D.model";
import { foModel3D, foSphere } from "../foundry/solids/foBody.model";
import { foText3D } from "../foundry/solids/foText3D.model";
import { foImage3D } from "../foundry/solids/foImage3D.model";
import { foPipe3D } from "../foundry/solids/foPipe3D.model";

import { foCone } from "../foundry/solids/foBody.model";

import { foStencilLibrary } from "../foundry/foStencil";
import { RuntimeType } from '../foundry/foRuntimeType';
import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";

import { LineCurve3, CurvePath, TubeGeometry, BoxGeometry, MultiMaterial, Material, Geometry, FontLoader, Font, TextGeometry, MeshPhongMaterial, MeshBasicMaterial, Mesh, Vector3 } from 'three';

export let ShrineStencil: foStencilLibrary = new foStencilLibrary().defaultName('Shrine');



//https://threejs.org/examples/#webgl_geometry_shapes



function doCrown(obj: foShape3D) {
  let thickness = 12.5;
  let width = obj.width;
  let depth = obj.depth;
  let y = (obj.height + thickness) / 2;

  let x = (width - thickness) / 2
  let z = (depth - thickness) / 2

  ShrineStencil.impermanent<foShape3D>('left', foShape3D)
    .newInstance({
      width: thickness,
      height: thickness,
      depth: depth,
      color: 'cyan'
    }).addAsSubcomponent(obj).dropAt(x, y, 0);

  ShrineStencil.impermanent<foShape3D>('right', foShape3D)
    .newInstance({
      width: thickness,
      height: thickness,
      depth: depth,
      color: 'cyan'
    }).addAsSubcomponent(obj).dropAt(-x, y, 0);


  ShrineStencil.impermanent<foShape3D>('front', foShape3D)
    .newInstance({
      width: width,
      height: thickness,
      depth: thickness,
      color: 'cyan'
    }).addAsSubcomponent(obj).dropAt(0, y, z);

  ShrineStencil.impermanent<foShape3D>('back', foShape3D)
    .newInstance({
      width: width,
      height: thickness,
      depth: thickness,
      color: 'cyan'
    }).addAsSubcomponent(obj).dropAt(0, y, -z);

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

let pedestal = ShrineStencil.define<foShape3D>('pedestal', foShape3D, {
  color: 'yellow',
  width: 200,
  height: 100,
  depth: 200,
}).onCreation(obj => {
});

let plate = ShrineStencil.define<foShape3D>('plate', foShape3D, {
  color: 'blue',
  width: 10,
  height: 10,
  depth: 10,
}).onCreation(obj => {
}).hide();

let minibox = ShrineStencil.define<foShape3D>('box', foShape3D, {
  color: 'blue',
  opacity: .6,
  width: 400,
  height: 500,
  depth: 400
}).onCreation(obj => {

  let lightspace = 100;
  let thickness = 12.5;

  obj.y = obj.height / 2;

  doBand(obj, (obj.depth / 2) - 40);
  doBand(obj, (-obj.depth / 2) + 40);



  ShrineStencil.impermanent<foShape3D>('center', foShape3D)
    .newInstance({
      opacity: .5,
      width: .95 * obj.width,
      height: .95 * obj.height - lightspace,
      depth: .95 * obj.depth,
      y: obj.height / 2,
      color: 'red'
    }).addAsSubcomponent(obj).dropAt(0, -lightspace / 2, 0).nullGeometry()



  ShrineStencil.impermanent<foCone>('light', foCone)
    .newInstance({
      width: .95 * obj.width,
      height: lightspace,
      depth: .95 * obj.depth,
      radius: 122,
      color: 'green'
    }).addAsSubcomponent(obj).dropAt(0, (obj.height - lightspace) / 2, 0);

  pedestal.makeComponent(obj, {}, stand => {
    stand.dropAt(0, -obj.height / 2 + stand.height / 2, 0);
  });

  plate.makeComponent(obj, {
    color: 'cyan',
    opacity: obj.opacity,
    width: obj.width - 2 * thickness,
    height: thickness,
    depth: obj.depth - 2 * thickness,
  }, base => {
    base.dropAt(0, -obj.height / 2 - base.height / 2, 0);
  })

  doCrown(obj)

}).hide();





ShrineStencil.define<foShape3D>('shrine', foShape3D, {
  width: 400,
  height: 500,
  depth: 400,
  y: function () { return this.height / 2 }
}).onCreation(obj => {

  //hide the gemoetry
  obj.nullGeometry();

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

