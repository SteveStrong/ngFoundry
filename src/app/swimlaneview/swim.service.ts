import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { EmitterService } from '../common/emitter.service';

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
    EmitterService.error(errMsg, 'SwimService');
    return Observable.throw(errMsg);
  }


  getRootView() {
    let result = this.viewDef.newInstance() as svgShapeView;
    return result;
  }

  getEcosystem(callback): any {
    let source = this.http.get('caas.json');
    source.subscribe(res => {
      let body = res.json();

      let result = this.viewDef.newInstance() as svgShapeView;

      let lanes = [
        { 'title': "GitHub" },
        { 'title': "Docker" },
        { 'title': "Data Center" },
      ];

      lanes.map(item => {
        let found = this.viewLaneDef.newInstance(item) as svgShapeView;
        result.addSubcomponent(found);

        let elements = [
          { 'name': "Steve" },
          { 'name': "Debra" },
          { 'name': "Evan" },
        ];

        elements.map(item => {
           let element = this.viewElementDef.newInstance(item) as svgShapeView;
           found.addSubcomponent(element);
        });

      })

      callback && callback(result);

    }, this.handleError)

    return source;
  }

}
