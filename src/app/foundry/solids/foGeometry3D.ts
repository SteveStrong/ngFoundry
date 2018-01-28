
import { iPoint3D,  } from '../foInterface';
import { Vector3 } from 'three';

export class cPoint3D implements iPoint3D {
    public x: number;
    public y: number;
    public z: number;
    public myName: string;

    constructor(x: number = 0, y: number = 0, z: number = 0, name?: string) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.myName = name;
    }

    asVector():Vector3 {
        return new Vector3(this.x, this.y, this.z)
    }

    set(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    clone() {
        return new cPoint3D(this.x, this.y, this.z, this.myName);
    }

    add(x: number = 0, y: number = 0, z: number = 0) {
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }

    subtract(x: number = 0, y: number = 0, z: number = 0) {
        this.x -= x;
        this.y -= y;
        this.z += z;
        return this;
    }

    midpoint(pt: cPoint3D) {
        let x = (this.x + pt.x) / 2;
        let y = (this.y + pt.y) / 2;
        let z = (this.z + pt.z) / 2;
        return new cPoint3D(x, y, z);
    }
}

