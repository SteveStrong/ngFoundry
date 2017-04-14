import { Injectable } from '@angular/core';

@Injectable()
export class LocalCasheService {

  private _LocalCashe: any = {}

  public addItem(key, item) {
    this._LocalCashe[key] = item;
    return item;
  }

  public findItem(key) {
    return this._LocalCashe[key];
  }

  public totalItems() {
    return Object.keys(this._LocalCashe).length;
  }

  public getItems() {
    let list = [];
    for (var key in this._LocalCashe) {
      list.push(this._LocalCashe[key]);
    }
    return list;
  }

  public getItemsWhere(filterFn?) {
    let list = this.getItems()
    if (filterFn) {
      list = list.filter(filterFn)
    }
    return list;
  }
}