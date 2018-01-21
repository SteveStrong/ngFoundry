import { Tools } from '../foundry/foTools';
import { cMargin } from '../foundry/foGeometry2D';

import { foGlyph3D } from "../foundry/foGlyph3D.model";

import { foNode } from "../foundry/foNode.model";
import { foObject } from "../foundry/foObject.model";

import { Material, Geometry, FontLoader, Font, TextGeometry, MeshPhongMaterial, MeshBasicMaterial, Mesh, Vector3 } from 'three';


export class foImage3D extends foGlyph3D {
    public fontURL: string;
    public text: string;
  
    public margin: cMargin;
    public fontSize: number;
    public font: Font;
    public height: number;
  
    protected _background: string;
    get background(): string {
      return this._background;
    }
    set background(value: string) {
      this._background = value;
    }
  
    
    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
      super(properties, subcomponents, parent);
  
      this.setupPreDraw();
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
      let url = this.fontURL || 'assets/fonts/helvetiker_regular.typeface.json';
      new FontLoader().load(url, (font: Font) => {
        self.font = font;
        self.smash();
      });
      return this;
    };
  
  
  }