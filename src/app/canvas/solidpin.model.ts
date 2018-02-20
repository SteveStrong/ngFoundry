import { Tools } from '../foundry/foTools';



import { foShape3D } from "../foundry/solids/foShape3D.model";


import { foStencilLibrary } from "../foundry/foStencil";


import { Mesh } from 'three';

export let PinStencil: foStencilLibrary = new foStencilLibrary().defaultName("Pins");


class foPinnedShape3D extends foShape3D {
  

  protected setMeshMatrix(obj: Mesh) {

    let pos = this.originPosition();

    obj.position.set(pos.x, pos.y, pos.z);
    obj.rotation.set(this.angleX, this.angleY, this.angleZ);
    return obj;
  }
}

PinStencil.define<foPinnedShape3D>('Center', foPinnedShape3D, {
  color: 'green',
  opacity: .7,
  width: 100,
  height: 200,
  depth: 100,
}).onCreation(obj => {
  obj.dropAt(0, 0, 0);
})


class BottomCenter extends foPinnedShape3D {
  public pinY = (): number => { return 0.0 * this.height; }
}

PinStencil.define<foPinnedShape3D>('BottomCenter', BottomCenter, {
  color: 'green',
  opacity: .7,
  width: 100,
  height: 200,
  depth: 100,
}).onCreation(obj => {
  obj.dropAt(0, 0, 0);
})

class LeftTopFront extends foPinnedShape3D {
  public pinX = (): number => { return 0.0 * this.width; }
  public pinY = (): number => { return 1.0 * this.height; }
  public pinZ = (): number => { return 0.0 * this.depth; }
}

PinStencil.define<foPinnedShape3D>('LeftTopFront', LeftTopFront, {
  color: 'green',
  opacity: .7,
  width: 100,
  height: 200,
  depth: 100,
}).onCreation(obj => {
  obj.dropAt(0, 0, 0);
})

PinStencil.define<foPinnedShape3D>('RightRearCenter', LeftTopFront, {
  color: 'green',
  opacity: .7,
  width: 100,
  height: 200,
  depth: 100,
}).onCreation(obj => {
  obj.pinX = (): number => { return 1.0 * obj.width; }
  obj.pinY = (): number => { return 0.5 * obj.height; }
  obj.pinZ = (): number => { return 1.0 * obj.depth; }
  obj.dropAt(0, 0, 0);
})

