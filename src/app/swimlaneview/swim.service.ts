import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Toast } from '../common/emitter.service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

import { Tools } from '../foundry/foTools'
import { SwimDictionary, svgConcept, svgShapeView } from "./swim.model";

@Injectable()
export class SwimService {
  Dictionary: SwimDictionary = new SwimDictionary();
  viewElementDef: svgConcept = this.Dictionary.swimElementDef;
  viewLaneDef: svgConcept = this.Dictionary.swimLaneDef;
  viewDef: svgConcept = this.Dictionary.swimDef;

  constructor(private http: Http) { }

  private handleError(error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    Toast.error(errMsg, 'SwimService');
    return Observable.throw(errMsg);
  }


  getRootView() {
    let result = this.viewDef.newInstance() as svgShapeView;
    return result;
  }

  // load() {
  //   console.log('json called');
  //   return new Promise(resolve => {
  //     this.http.get('sampledata/caas.json').map(response => {
  //       this.data = response.json();
  //       resolve(this.data);
  //     });
  //   });
  // }

  getEcosystem(callback): any {
    let source = this.http.get('assets/caas.json');
    source.subscribe(res => {
      let body = res.json();

      let categories = body.categories;

      let result = this.viewDef.newInstance() as svgShapeView;

      //categories = Tools.distinctItems(body.products.map(Tools.pluck('category')));
      let lanes = categories.map(item => {
        return { 'title': item, 'myName': item }
      });

      lanes.map(item => {
        let found = this.viewLaneDef.newInstance(item) as svgShapeView;
        result.addSubcomponent(found);
        result[item.myName] = found;
      });

      let groups = Tools.groupBy(Tools.pluck('category'), body.products)

      Tools.mapOverKeyValue(groups, (key, list) => {
        let product = result[key] as svgShapeView;
        list.forEach(item => {
          let spec = { 'name': item.product, 'myName': item.product }
          let element = this.viewElementDef.newInstance(spec) as svgShapeView;
          product.addSubcomponent(element);
        })

      })



      callback && callback(result);

    }, this.handleError)

    return source;
  }

}
