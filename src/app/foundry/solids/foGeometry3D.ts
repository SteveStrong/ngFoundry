
import { iPoint3D } from '../foInterface';
import { Vector3 } from 'three';
export { Vector3, Matrix4 } from 'three';

export class cPoint3D extends Vector3 implements iPoint3D {

    public myName: string;

    constructor(x: number = 0, y: number = 0, z: number = 0, name?: string) {
        super(x, y, z);
        this.myName = name;
    }

    asVector(): Vector3 {
        return new Vector3(this.x, this.y, this.z)
    }

    setValues(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    clonePoint() {
        return new cPoint3D(this.x, this.y, this.z, this.myName);
    }

    addPoint(x: number = 0, y: number = 0, z: number = 0) {
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }

    subtractPoint(x: number = 0, y: number = 0, z: number = 0) {
        this.x -= x;
        this.y -= y;
        this.z += z;
        return this;
    }

    midPoint(pt: cPoint3D) {
        let x = (this.x + pt.x) / 2;
        let y = (this.y + pt.y) / 2;
        let z = (this.z + pt.z) / 2;
        return new cPoint3D(x, y, z, 'midPoint');
    }

    deltaBetween(p: cPoint3D) {
        let x = this.x - p.x;
        let y = this.y - p.y;
        let z = this.z - p.z;
        return new cPoint3D(x, y, z, 'delta');
    }
}

