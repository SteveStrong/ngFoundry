import { Tools } from '../foundry/foTools';
import { cPoint2D, cMargin } from '../foundry/shapes/foGeometry2D';
import { foGlyph2D } from "../foundry/shapes/foGlyph2D.model";
import { foGlyph3D } from "../foundry/solids/foGlyph3D.model";
import { foShape2D, shape2DNames } from "../foundry/shapes/foShape2D.model";
import { foShape1D } from "../foundry/shapes/foShape1D.model";
import { foShape3D, shape3DNames } from "../foundry/solids/foShape3D.model";
import { foModel3D, foSphere } from "../foundry/solids/foBody.model";
import { foText3D } from "../foundry/solids/foText3D.model";
import { foImage3D } from "../foundry/solids/foImage3D.model";
import { foPipe3D } from "../foundry/solids/foPipe3D.model";
import { foNode } from "../foundry/foNode.model";
import { foObject } from "../foundry/foObject.model";
import { ThreeByThreeCircle, OneByOne, TwoByOne, TwoByTwo, TwoByFour, OneByTen, TenByTen } from "./legoshapes.model";

import { foStencilLibrary } from "../foundry/foStencil";
import { RuntimeType } from '../foundry/foRuntimeType';
import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";

import { LineCurve3, TubeGeometry, BoxGeometry, MultiMaterial, Material, Geometry, FontLoader, Font, TextGeometry, MeshPhongMaterial, MeshBasicMaterial, Mesh, Vector3 } from 'three';

export let SolidStencil: foStencilLibrary = new foStencilLibrary().defaultName();

SolidStencil.define<foGlyph3D>('block', foGlyph3D, {
  color: 'green',
  opacity: .5,
  width: 100,
  height: 400,
  depth: 900
});

SolidStencil.define<foShape3D>('box', foShape3D, {
  color: 'red',
  opacity: .5,
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
  opacity: .5,
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

class Pipe3d extends foPipe3D {
  //https://threejs.org/docs/#api/geometries/TubeGeometry
  // geometry = (spec?: any): Geometry => {
  //   let begin = this.begin().asVector();
  //   let end = this.end().asVector();
  //   let curve = new LineCurve3(begin, end)
  //   return new TubeGeometry(curve, 20, 2, 8, false);
  // }

  // material = (spec?: any): Material => {
  //   let props = Tools.mixin({
  //     color: this.color,
  //     wireframe: false
  //   }, spec)
  //   return new MeshBasicMaterial(props);
  // }
}

SolidStencil.define<foPipe3D>('3D::Pipe', foPipe3D, {
  color: 'blue',
  width: 100,
  height: 20,
  depth: 20,
  finishX: 100,
  finishY: 100,
  finishZ: 100
});


SolidStencil.define<foShape3D>('3D::glueShape', foShape3D, {
  depth: 100
});

SolidStencil.define<foPipe3D>('3D::glueLine', foPipe3D, {
  depth: 15,
});

SolidStencil.factory<foGlyph3D>('doGlue3D', (spec?: any) => {
  SolidStencil.isVisible = false;
  let results = Array<foGlyph3D>();

  let def = SolidStencil.define<foShape3D>('3D::glueShape', foShape3D, {
    color: 'blue',
    opacity: .4,
    width: 200,
    height: 150,
    depth: 100,
  });

  let shape1 = def.newInstance({ color: 'green' }).dropAt(300, 200).pushTo(results);
  let shape2 = def.newInstance().dropAt(600, 200).pushTo(results);

  let cord = SolidStencil.define<foPipe3D>('3D::glueLine', foPipe3D, {
    color: 'red',
    height: 15,
    depth: 15,
  });
  SolidStencil.isVisible = true;

  let wire = cord.newInstance().pushTo(results);


  //wire.glueStartTo(shape1, shape3DNames.right);
  //wire.glueFinishTo(shape2, shape3DNames.left);

  wire.glueStartTo(shape1, shape3DNames.center);
  wire.glueFinishTo(shape2, shape3DNames.center);

  return results;

});