import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Tools } from "../foundry/foTools";
import { EmitterService } from '../common/emitter.service';
import { PubSub } from "../foundry/foPubSub";

import { Toast } from '../common/emitter.service';
import { SignalRService } from "../common/signalr.service";

import { RuntimeType } from '../foundry/foRuntimeType';
import { Concept } from "../foundry/foConcept.model";
import { Stencil } from "../foundry/foStencil";


@Injectable()
export class SharingService {

  constructor(
    private signalR: SignalRService,
    private http: Http) {
  }

}
