
import { foKnowledge } from './foKnowledge.model'

export class foAttribute extends foKnowledge {

  constructor(spec: any = undefined) {
    super(spec);
    this.myType = 'foAttribute';
  }

}

export class foViewAttribute extends foAttribute {

  private _title:string;
  private _mySource: foAttribute = undefined;

  constructor(source: foAttribute, spec: any = undefined) {
    super(spec);
    this._mySource = source;
    this.myType = 'foViewAttribute';
  }

//https://toddmotto.com/typescript-setters-getter

  get title() {
    return this._title ? this._title : this.myName;
  }

  set title(name) {
    this._title = name;
  }

}

