
import { foGlyph3D } from "../foundry/foGlyph3D.model";
import { JSONLoader, MultiMaterial, Material, Geometry } from 'three';

import { SphereGeometry } from 'three';


export class foShape3D extends foGlyph3D {
    public pinX = (): number => { return 0.5 * this.width; }
    public pinY = (): number => { return 0.5 * this.height; }
    public pinZ = (): number => { return 0.5 * this.depth; }
  
}

export class foSphere extends foShape3D {
    radius: number;
    geometry = (spec?: any): Geometry => {
        return new SphereGeometry(this.radius);
    }
}

export class foModel3D extends foShape3D {
    url: string;
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
        let url = this.url || "assets/models/707.js";
        new JSONLoader().load(url, (geometry, materials) => {
            self._geometry = geometry;
            self._material = materials;
            self.smash();
        });
        return this;
    };


}