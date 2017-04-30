import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { EmitterService } from '../common/emitter.service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

import { Tools } from '../foundry/foTools'
import { SwimDictionary, SwimElementDef, SwimLaneDef, SwimDef, SwimElementView, SwimLaneView, SwimView } from "./swim.model";

@Injectable()
export class SwimService {
  Dictionary: SwimDictionary = new SwimDictionary();
  viewElementDef: SwimElementDef = this.Dictionary.swimElementDef;
  viewLaneDef: SwimLaneDef = this.Dictionary.swimLaneDef;
  viewDef: SwimDef = this.Dictionary.swimDef;

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

  getModel(total: number): SwimElementView[] {
    let elements = [
      { 'name': "Steve" },
      { 'name': "Stu" },
      { 'name': "Don" },
      { 'name': "Linda" },
      { 'name': "Anne" },
      { 'name': "Debra" },
      { 'name': "Evan" },
    ].slice(0, total)

    let i = 0;
    let result = elements.map(item => {
      (item as any).index = i++;
      return this.viewElementDef.newInstance(item) as SwimElementView;
    });

    return result;
  }

  getSwimLanes(): SwimLaneView[] {
    let lanes = [
      { 'title': "GitHub" },
      { 'title': "Docker" },
      { 'title': "Data Center" },
      { 'title': "done" },
      { 'title': "vvvvv" }
    ];

    let i = 0;
    let result = lanes.map(item => {
      (item as any).index = i++;
      let elements = this.getModel(i);

      let found = this.viewLaneDef.newInstance(item, elements) as SwimLaneView;

      return found;
    });


    return result;
  }


  getRootView() {
    let result = this.viewDef.newInstance() as SwimView;
    return result;
  }

  getEcosystem(callback): any {
    let source = this.http.get('caas.json');
    source.subscribe(res => {
      let body = res.json();
      //let lanes = this.getSwimLanes();
      let result = this.viewDef.newInstance() as SwimView;

      let lanes = [
        { 'title': "GitHub" },
        { 'title': "Docker" },
        { 'title': "Data Center" },
      ];

      lanes.map(item => {
        let found = this.viewLaneDef.newInstance(item) as SwimLaneView;
        result.addSubcomponent(found);

        let elements = [
          { 'name': "Steve" },
          { 'name': "Debra" },
          { 'name': "Evan" },
        ];

        elements.map(item => {
           let element = this.viewElementDef.newInstance(item) as SwimElementView;
           found.addSubcomponent(element);
        });

      })

      callback && callback(result);

    }, this.handleError)

    return source;
  }

}
