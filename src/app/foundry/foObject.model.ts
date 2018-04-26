import { Tools, foNames } from './foTools';
import { iObject, ModelRef } from './foInterface';
//import { setTimeout } from 'timers';

export interface IDisposable {
  dispose();
}

export function using<T extends IDisposable>(
  resource: T,
  func: (resource: T) => any
) {
  let result: any;
  try {
    result = func(resource);
  } finally {
    resource.dispose();
  }
  return result;
}

// // Example use:
// class Camera implements IDisposable {
//     takePicture() { /* omitted */ }
//     // etc...
//     dispose() {
//         navigator.camera.cleanup();
//     }
// }

// using(new Camera(), (camera) => {
//     camera.takePicture();
// });

export class foObject implements iObject {
  static beep() {
    const snd = new Audio(
      // tslint:disable-next-line:max-line-length
      'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU='
    );
    snd.play();
  }

  static jsonAlert(obj: any, title: string = 'JSON Alert') {
    try {
      alert(title + '\r' + JSON.stringify(obj, undefined, 3));
    } catch (ex) {
      alert(title + '\r' + JSON.stringify(obj.asJson, undefined, 3));
      alert(ex);
    }
  }

  private _myGuid: string;
  myName: string = foNames.UNKNOWN;
  myParent: ModelRef<iObject>;

  private _isVisible: boolean = true;
  get isVisible(): boolean {
    return this._isVisible;
  }
  set isVisible(value: boolean) {
    this._isVisible = value;
  }
  get isInvisible(): boolean {
    return !this._isVisible;
  }
  set isInvisible(value: boolean) {
    this._isVisible = !value;
  }

  show(value: boolean = true) {
    this._isVisible = value ? true : false;
    return this;
  }
  hide() {
    this._isVisible = false;
    return this;
  }

  get isPublic() {
    return this._isVisible;
  }

  constructor(properties?: any, parent?: foObject) {
    if (parent) {
      this.myParent = () => {
        return parent;
      };
    }

    this.override(properties);
  }

  //https://www.npmjs.com/package/reflect-metadata
  //https://stackoverflow.com/questions/13613524/get-an-objects-class-name-at-runtime-in-typescript

  get myType(): string {
    const comp: any = this.constructor;
    return comp.name;
  }
  set myType(ignore: string) {}

  get myGuid(): string {
    if (!this._myGuid) {
      this._myGuid = Tools.generateUUID();
    }
    return this._myGuid;
  }

  set myGuid(value) {
    if (!this._myGuid) {
      this._myGuid = value;
    }
  }

  public generateName() {
    const short = this.myGuid.slice(-6);
    this.myName = `${this.myType}_${short}`;
    return this;
  }

  public defaultName(name?: string) {
    if (name) {
      this.myName = name;
    } else if (Tools.matches(this.myName, foNames.UNKNOWN)) {
      this.generateName();
    }
    return this;
  }

  protected _displayName: string;
  get displayName() {
    if (this._displayName) {
      return this._displayName;
    }
    return `${this.myName} - ${this.myType}`;
  }
  set displayName(value: string) {
    this._displayName = value;
  }

  setName(name) {
    this.myName = name;
    return this;
  }

  is2D() {
    return false;
  }
  is3D() {
    return false;
  }

  asReference(): string {
    const parent = this.myParent && this.myParent();
    if (!parent) {
      return foNames.ROOT;
    }
    return `${this.myName}.${parent.asReference()}`;
  }

  then(next: (obj) => void) {
    next(this);
    return this;
  }

  hasAncestor(member: iObject): boolean {
    if (member === this) {
      return true;
    }

    const parent = this.myParent && this.myParent();
    if (member === parent) {
      return true;
    }
    return parent && parent.hasAncestor(member);
  }

  get hasParent() {
    const parent = this.myParent && this.myParent();
    return parent ? true : false;
  }

  removeParent(parent: foObject) {
    if (this.hasParent && this.myParent() === parent) {
      this.myParent = undefined;
    }
    return this.hasParent;
  }

  setParent(newParent: foObject) {
    const parent = this.myParent && this.myParent();
    if (parent !== newParent) {
      this.myParent = () => {
        return newParent;
      };
    }
    return this;
  }

  public wait(time: number, func: () => void) {
    setTimeout(func, time);
    return this;
  }

  public getChildAt(i: number): iObject {
    return undefined;
  }

  public extract(keys?: string[], target?) {
    const spec = target ? target : {};
    keys &&
      keys.forEach(key => {
        spec[key] = this[key];
      });
    return spec;
  }

  public override(properties?: any) {
    properties && Tools.overrideComputed(this, properties);
    return this;
  }

  public extend(properties?: any) {
    properties && Tools.extendComputed(this, properties);
    return this;
  }

  getMethodList() {
    //consider moveing this code to baseobject
    function getAllMethods(object) {
      return Object.getOwnPropertyNames(object).filter(function(property) {
        return typeof object[property] === 'function';
      });
    }

    const names = getAllMethods(this);

    const self = this;
    const obj1 = {};
    names.forEach(item => {
      obj1[item] = self[item](); //evaluate all methods
    });

    return names;
  }

  get debug() {
    return Tools.stringify(this);
    //return JSON.stringify(this,undefined,3);
  }

  get asJsonRaw() {
    const data = Tools.stringify(this);
    return JSON.parse(data);
  }

  get asJson() {
    return this.toJson();
  }
  protected toJson(): any {
    return {
      myName: this.myName,
      myGuid: this.myGuid,
      myType: this.myType
    };
  }

  protected jsonMerge(source: any) {
    const result = Tools.asJson(this);
    if (!Tools.isEmpty(source)) {
      Tools.forEachKeyValue(source, (key, value) => {
        if (!result[key] && !Tools.isEmpty(value)) {
          const json = value && value.asJson;
          result[key] = json ? json : value;
        }
      });
    }
    return result;
  }
}
