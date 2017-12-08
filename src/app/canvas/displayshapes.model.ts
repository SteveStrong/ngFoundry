
import { foDisplayObject } from "../foundry/foDisplayObject.model";

//https://github.com/CreateJS/EaselJS


export class dRectangle extends foDisplayObject {
 
  constructor(properties?: any) {
    super(properties);
  }

}

export class Display {
  static create<T extends foDisplayObject>(type: { new(p?: any): T; }, properties?: any): T {
      let instance = new type(properties);
      return instance;
  }
}





