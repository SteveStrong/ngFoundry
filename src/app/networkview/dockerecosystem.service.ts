
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, Response } from '@angular/http';




import { foTools } from '../foundry/foTools'
import { EmitterService } from '../common/emitter.service';

@Injectable()
export class DockerecosystemService {

  constructor(private http: HttpClient) { }

  getModel() {
    let model = new Observable(observer => {
      setTimeout(() => {
        observer.next(21);
      },1000);
      setTimeout(() => {
        observer.next(22);
      },2000);
      setTimeout(() => {
        observer.complete();
      },3000);
    });
    return model;
  }

  private extractData(res: Response) {
    let body = res.json();
    return body || {};
  }

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
    console.error(errMsg);
    let toast = {
      title: "Dockerecosystem Service",
      message: errMsg
    }
    EmitterService.get("SHOWERROR").emit(toast);
    return observableThrowError(errMsg);
  }

  getEcosystem() {
    let source = this.http.get('dockerecosystem.json');
    //source.do(this.extractData)
    //  .catch(this.handleError);
    return source;
  }

}
