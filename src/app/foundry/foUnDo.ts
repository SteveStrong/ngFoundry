import { PubSub } from './foPubSub';

export class foUnDo {
  private _undoID: number = 0;
  private _isDoing: boolean = false;
  private _isUndoing: boolean = false;
  private _undoRing: any[] = [];

  clear() {
    this._undoRing = [];
    return this;
  }

  canUndo() {
    return this._undoRing.length ? true : false;
  }

  isUndoing() {
    return this._isUndoing;
  }
  isDoing() {
    return this._isDoing;
  }

  private _doActions: any = {};
  private _undoActions: any = {};
  private _verifyKeep: any = {};

  do(action, item) {
    this._isDoing = true;
    const func = this._doActions[action];
    const undo = { action: action, payload: item, undoID: this._undoID++ };
    this.addItem(undo);
    undo.payload = func ? func.call(undo, item) : item;

    this._isDoing = false;
    PubSub.Pub('undoAdded', [undo]);
    return undo;
  }

  addItem(item: any) {
    this._undoRing.push(item);
    return this;
  }

  removeItem(item: any) {
    const index = this._undoRing.indexOf(item);
    if (index !== -1) { this._undoRing.splice(index, 1); }
    return this;
  }

  unDo(myUnDo?: any) {
    if (!this.canUndo()) { return; }

    this._isUndoing = true;
    let undo = myUnDo;
    if (undo) {
      this.removeItem(myUnDo);
    } else {
      const index = this._undoRing.length - 1;
      undo = this._undoRing.splice(index, 1)[0];
    }

    const item = undo.payload;
    const func = this._undoActions[undo.action];
    const payload = func ? func.call(undo, item) : item;
    this._isUndoing = false;
    PubSub.Pub('undoRemoved', [undo]);
    return payload;
  }

  //if the verify function return TRUE then keep the last undo action...
  verifyKeep(undo: any, item: any) {
    if (!undo) { return true; }
    const action = undo.action;
    const func = this._verifyKeep[action];
    const keep = func ? func.call(undo, item, undo.payload) : true;
    if (!keep) {
      //remove Undo from the queue
      this.removeItem(undo); //item has been removed..
    }
    return keep;
  }

  registerActions(action, doFunc?, undoFunc?, verifyKeepFunc?) {
    this._doActions[action] = doFunc
      ? doFunc
      : function(p) {
          return p;
        };
    this._undoActions[action] = undoFunc
      ? undoFunc
      : function(p) {
          return p;
        };
    this._verifyKeep[action] = verifyKeepFunc
      ? verifyKeepFunc
      : function(p) {
          return true;
        };
    return this;
  }
}

export let globalUnDo: foUnDo = new foUnDo();
