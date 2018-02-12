import { Tools } from '../foTools';
import { cMargin } from '../shapes/foGeometry2D';

import { foShape3D } from "./foShape3D.model";

import { foGlyph3D } from "./foGlyph3D.model";
import { foObject } from "../foObject.model";

import { Material, Geometry, TextureLoader, ImageLoader, BoxGeometry, MeshPhongMaterial, MeshBasicMaterial, Mesh, Vector3 } from 'three';
//import { Screen3D } from "./threeDriver";


export class foImage3D extends foShape3D {

  protected _texture: any;

  public margin: cMargin;

  protected _imageURL: string;
  get imageURL(): string { return this._imageURL; }
  set imageURL(value: string) {
    this._imageURL = value;
  }

  protected _background: string;
  get background(): string {
    return this._background;
  }
  set background(value: string) {
    this._background = value;
  }


  constructor(properties?: any, subcomponents?: Array<foGlyph3D>, parent?: foObject) {
    super(properties, subcomponents, parent);
  }

  protected toJson(): any {
    return Tools.mixin(super.toJson(), {
      background: this.background,
      imageURL: this.imageURL,
      margin: this.margin,
    })
  }

  public override(properties?: any) {
    if (properties && properties.margin) {
      let m = properties.margin;
      properties.margin = new cMargin(m.left, m.top, m.right, m.bottom);
    }
    return super.override(properties);
  }

  get mesh(): Mesh {
    if (!this._mesh && this._texture) {
      let geom = this.geometry()
      let mat = this.material()
      this._mesh = (geom && mat) && new Mesh(geom, this.material());
    }
    return this._mesh;
  }
  set mesh(value: Mesh) { this._mesh = value; }

  geometry = (spec?: any): Geometry => {
    return this._texture && new BoxGeometry(this.width, this.height, this.depth);
  }

  material = (spec?: any): Material => {
    let props = Tools.mixin({
      color: this.background || 'white',
      shininess: 0.9,
      map: this._texture
    }, spec)

    return this._texture && new MeshBasicMaterial(props);
  }


  //deep hook for syncing matrix2d with geometry 
  public initialize(x: number = Number.NaN, y: number = Number.NaN, ang: number = Number.NaN) {
    let self = this;
    let url = this.imageURL || 'assets/edwards.png';
    let loader = new TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(url, texture => {
      self._texture = texture;
    });
    return this;
  };




}