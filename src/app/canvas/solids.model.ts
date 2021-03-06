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

import { LineCurve3, TubeGeometry, BoxGeometry, MultiMaterial, Material, Geometry, FontLoader, Font, TextGeometry, MeshPhongMaterial, MeshBasicMaterial, Mesh, Vector3 } from 'three';

export let SolidStencil: foStencilLibrary = new foStencilLibrary().defaultName('Solid');

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
})

SolidStencil.define<foShape3D>('subbox', foShape3D, {
  color: 'red',
  opacity: .5,
  width: 100,
  height: 400,
  depth: 900
}).onCreation(obj => {
  SolidStencil.impermanent<foShape3D>('empty', foShape3D)
    .newInstance({
      width: 160,
      height: 160,
      depth: 160,
      color: 'green'
    }).addAsSubcomponent(obj);

})

SolidStencil.factory<foShape3D>('corner', (spec?: any) => {

  let results = Array<foShape3D>();

  let def = SolidStencil.find<foShape3D>('box');

  let main = def.newInstance()
    .pushTo(results)

  main.dropAt(300, 200, 100);

  let corner1 = def.newInstance({
    width: 30,
    height: 130,
    depth: 30,
    color: 'blue'
  }).pushTo(results);

  corner1.afterMeshCreated = () => {
    let loc = main.getConnectionPoint('front');
    let pt = loc.getGlobalPosition();
    corner1.setGlobalPosition(pt)
  }

  let corner2 = def.newInstance({
    width: 160,
    height: 160,
    depth: 160,
    color: 'yellow'
  }).pushTo(results)

  corner2.afterMeshCreated = () => {
    let top = main.getConnectionPoint('top');
    let bottom = corner2.getConnectionPoint('bottom');
    bottom.alignTo(top);
  }

  let corner3 = def.newInstance({
    width: 160,
    height: 180,
    depth: 100,
    color: 'green'
  }).pushTo(results)

  corner3.afterMeshCreated = () => {
    let top = main.getConnectionPoint('back');
    let bottom = corner3.getConnectionPoint('left');
    bottom.alignTo(top);
  }

  return results;

});

SolidStencil.factory<foShape3D>('glue corner', (spec?: any) => {

  let results = Array<foShape3D>();

  let def = SolidStencil.find<foShape3D>('box');

  let main = def.newInstance()
    .pushTo(results)

  main.dropAt(-300, -200, -100);

  let corner1 = def.newInstance({
    width: 30,
    height: 130,
    depth: 30,
    color: 'blue'
  }).pushTo(results);


  corner1.glueConnectionPoints(main, shape3DNames.center, shape3DNames.front)

  //this one is right
  // corner1.afterMeshCreated = () => {
  //   let target = main.getConnectionPoint('front');
  //   let source = corner1.getConnectionPoint();
  //   target && source && source.alignTo(target)
  // }

  //this one is glue based and it is right now
  // corner1.afterMeshCreated = () => {
  //   let target1 = main.getConnectionPoint('front');
  //   let source1 = corner1.getConnectionPoint();

  //   let target = glue.targetHandle;
  //   let source = glue.sourceHandle;
  //   if (target1 != target) return;
  //   if (source1 != source) return;

  //   target && source && source.alignTo(target)
  // }







  //let glue = corner1.glue.first();
  //glue.targetMovedSyncGlue = glue.enforceAlignTo.bind(glue);

  // corner1.afterMeshCreated = () => {
  //   let self = corner1;

  //   self.glue.forEach(item => {
  //     //self.enforceAlignTo(item)
  //     item.targetMovedSyncGlue = item.enforceAlignTo.bind(item);
  //     item.targetMovedSyncGlue();
  //   })



  //   // this._glue && this.glue.forEach(item => {
  //   //   item.targetMovedSyncGlue();
  //   // })
  // }


  let corner2 = def.newInstance({
    width: 160,
    height: 160,
    depth: 160,
    color: 'yellow'
  }).pushTo(results)


  corner2.glueConnectionPoints(main, shape3DNames.bottom, shape3DNames.top)


  // corner2.afterMeshCreated = () => {
  //   let target = main.getConnectionPoint('top');
  //   let source = corner2.getConnectionPoint('bottom');
  //   target && source && source.alignTo(target)
  // }

  let corner3 = def.newInstance({
    width: 160,
    height: 180,
    depth: 100,
    color: 'green'
  }).pushTo(results)

  corner3.glueConnectionPoints(main, shape3DNames.left, shape3DNames.back)


  // corner3.afterMeshCreated = () => {
  //   let target = main.getConnectionPoint('back');
  //   let source = corner3.getConnectionPoint('left');
  //   target && source && source.alignTo(target)
  // }

  return results;

});

SolidStencil.factory<foShape3D>('stack', (spec?: any) => {

  let results = Array<foShape3D>();

  let def = SolidStencil.define<foShape3D>('Element', foShape3D, {
    color: 'blue',
    opacity: .3,
    width: 200,
    height: 150,
    depth: 100,
    x: function () {
      return this.hasParent ? 0.5 * (this.width + this.myParent().width) : 0;
    },
    y: function () {
      return this.hasParent ? 0.5 * (this.height - this.myParent().height) : 0;
    },
    z: function () {
      return this.hasParent ? 0.5 * (this.depth - this.myParent().depth) : 0;
    }
  });

  let main = def.newInstance()
    .pushTo(results);

  let last = main;
  last.myName = last.color;
  let colors = ['red', 'grey', 'green', 'orange'];

  for (let i = 0; i < colors.length; i++) {
    let next = def.newInstance({
      color: colors[i],

      width: function () {
        return this.hasParent ? this.myParent().width * .7 : 100;
      },
      height: function () {
        return this.hasParent ? this.myParent().height * 1.2 : 100;
      },
      depth: function () {
        return this.hasParent ? this.myParent().depth * .8 : 100;
      },
      // x: function(){
      //   return this.hasParent ? 0.5 * (this.width + this.myParent().width) : 0;
      // },
      // y: function(){
      //   return this.hasParent ? 0.5 * (this.height - this.myParent().height) : 0;
      // },
      // z: function(){
      //   return this.hasParent ? 0.5 * (this.width - this.myParent().width) : 0;
      // }
    });

    next.myName = next.color;
    last = last.addSubcomponent(next) as foShape3D;
  }

  main.dropAt(300, 200, 100)



  return results;

});


SolidStencil.factory<foShape3D>('stackWithGlue', (spec?: any) => {

  let results = Array<foShape3D>();

  let def = SolidStencil.define<foShape3D>('Element', foShape3D, {
    color: 'blue',
    opacity: .3,
    width: 200,
    height: 150,
    depth: 100,
  });

  let main = def.newInstance()
    .pushTo(results);

  let last = main;
  last.myName = last.color;
  let colors = ['red', 'green', 'orange'];

  for (let i = 0; i < colors.length; i++) {
    let next = def.newInstance({
      color: colors[i],
      myName: function () { return this.color; },
      width: function () {
        return this.hasParent ? this.myParent().width * .7 : 100;
      },
      height: function () {
        return this.hasParent ? this.myParent().height * 1.5 : 100;
      },
      depth: function () {
        return this.hasParent ? this.myParent().depth * .8 : 100;
      },
    });

    // next.myName = next.color;
    last = last.addSubcomponent(next) as foShape3D;
    next.glueConnectionPoints(last, shape3DNames.bottom, shape3DNames.top)
  }


  return results;

});

export class Sphere extends foSphere {
  doBigger() {
    this.radius += 30;
    this.clearMesh();
  }

  doSmaller() {
    this.radius -= 30;
    this.clearMesh();
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
    opacity: .4,
    height: 55,
    radiusSegments: 50
  });


  let wire1 = cord.newInstance({ myName: 'wire1' }).pushTo(results);
  wire1.glueStartTo(shape1, shape3DNames.left);
  wire1.glueFinishTo(shape2, shape3DNames.right);

  let wire2 = cord.newInstance({
    myName: 'wire2',
    color: 'green',
    opacity: .4,
    height: 15,
    radiusSegments: 3
  }).pushTo(results);
  wire2.glueStartTo(shape1);
  wire2.glueFinishTo(shape2);


  let wire3 = cord.newInstance({
    myName: 'wire3',
    color: 'blue',
    opacity: .7,
    height: 40
  }).pushTo(results) as foPipe3D;

  wire3.afterMeshCreated = () => {
    let front = shape1.getConnectionPoint('front');
    let back = shape2.getConnectionPoint('back');
    wire3.startAt(front.getGlobalPosition())
    wire3.finishAt(back.getGlobalPosition())
  }


  return results;

});