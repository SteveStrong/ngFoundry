import { Tools } from '../foundry/foTools';
import { cPoint2D, cMargin } from '../foundry/foGeometry2D';
import { foGlyph2D } from "../foundry/foGlyph2D.model";
import { foGlyph3D } from "../foundry/foGlyph3D.model";
import { foShape2D, shape2DNames } from "../foundry/foShape2D.model";
import { foShape1D } from "../foundry/foShape1D.model";
import { foText2D } from "../foundry/foText2D.model";
import { foImage } from "../foundry/foImage.model";
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

export class Sphere extends foGlyph3D {
  radius: number;
  geometry = (spec?: any): Geometry => {
    return new SphereGeometry(this.radius);
  }

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



export class Model3D extends foGlyph3D {
  url: string = "assets/models/707.js";
  private _geometry;
  private _material;

  geometry = (spec?: any): Geometry => {
    return this._geometry;
  }

  material = (spec?: any): Material => {
    return new MultiMaterial(this._material);
  }

  //deep hook for syncing matrix2d with geometry 
  public initialize(x: number = Number.NaN, y: number = Number.NaN, ang: number = Number.NaN) {
    let self = this;
    new JSONLoader().load(this.url, (geometry, materials) => {
      self._geometry = geometry;
      self._material = materials;
      self.smash();
    });
    return this;
  };


}

SolidStencil.define<Model3D>('Model3D', Model3D, {
});


export class Text3D extends foGlyph3D {
  url: string = "assets/fonts/helvetiker_regular.typeface.json";
  text: string;

  public margin: cMargin;
  fontSize: number;
  font: Font;
  height: number;

  protected _background: string;
  get background(): string {
    return this._background;
  }
  set background(value: string) {
    this._background = value;
  }

  public pinX = (): number => { return 0.5 * this.width; }
  public pinY = (): number => { return 0.5 * this.height; }


  constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
    super(properties, subcomponents, parent);

    this.extend({
      text: function () {
        if (this.context && this.context.text) {
          return this.context.text;
        } if (this.context && Tools.isObject(this.context)) {
          return JSON.stringify(this.context, undefined, 3);
        }
        return this.context;
      }
    });
  }


  get size(): number {
    return (this.fontSize || 12);
  }

  geometry = (spec?: any): Geometry => {
    if (!this.font) return undefined;

    return new TextGeometry(this.text, {
      font: this.font,
      size: this.fontSize || 80,
      height: this.height || 5,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 10,
      bevelSize: 8
    });
  }

  material = (spec?: any): Material => {
    let props = Tools.mixin({
      color: this.color || 'white',
      specular: 0xffffff
    }, spec)
    return new MeshPhongMaterial(props);
  }


  //deep hook for syncing matrix2d with geometry 
  public initialize(x: number = Number.NaN, y: number = Number.NaN, ang: number = Number.NaN) {
    let self = this;
    new FontLoader().load(this.url, (font: Font) => {
      self.font = font;
      self.smash();
    });
    return this;
  };


}



SolidStencil.define<Text3D>('3D::Text', Text3D, {
  color: 'green',
  background: 'grey',
  context: 'HELLO',
  fontSize: 30,
});