import { Tools } from '../foTools';
import { cMargin } from '../shapes/foGeometry2D';

import { foGlyph3D } from "./foGlyph3D.model";

import { foNode } from "../foNode.model";
import { foObject } from "../foObject.model";

import { Material, Geometry, FontLoader, Font, TextGeometry, MeshPhongMaterial } from 'three';
import { Screen3D } from "./threeDriver";

export class foText3D extends foGlyph3D {
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
  
    
    constructor(properties?: any, subcomponents?: Array<foGlyph3D>, parent?: foObject) {
      super(properties, subcomponents, parent);
  
      this.setupPreDraw();
    }
  
  
    get size(): number {
      return (this.fontSize || 12);
    }
  
    
    asyncFontLoader() {
      let self = this;
      let url = this.fontURL || 'assets/fonts/helvetiker_regular.typeface.json';
      new FontLoader().load(url, (font: Font) => {
        self.font = font;
        self.setupPreDraw();
      });
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
  
    setupPreDraw() {

      let preDraw = (screen: Screen3D) => { 
          this.preDraw3D = undefined;

          if ( !this.font) {
              this.asyncFontLoader()
          } else {
              let mesh = this.mesh;
              mesh.name = this.myGuid;
              let parent = this.myParent() as foGlyph3D;
              if ( parent && parent.hasMesh ) {
                  parent.mesh.add(mesh)
              } else {
                  screen.addToScene(mesh);
              }
          }
               
      }

      this.preDraw3D = preDraw;
  }

  //mesh might be loading...
  draw3D = (screen: Screen3D, deep: boolean = true) => {
      if (!this.hasMesh) return;
      let obj = this.mesh;
      obj.position.set(this.x, this.y, this.z);
      obj.rotation.set(this.angleX, this.angleY, this.angleZ);
  };

  
  }