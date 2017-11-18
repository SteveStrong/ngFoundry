import { Injectable, OnInit } from '@angular/core';
import { HubConnection } from '@aspnet/signalr-client';
import { EmitterService, Toast } from "../common/emitter.service";

import { PubSub } from "../foundry/foPubSub";

import { environment } from '../../environments/environment';

//https://blogs.msdn.microsoft.com/webdev/2017/09/14/announcing-signalr-for-asp-net-core-2-0/

@Injectable()
export class SignalRService {

  private _started: boolean = false;
  //private hubURL = environment.signalRServer;
  private hubURL = environment.signalfoundry;
  private connection: HubConnection;

  constructor() {
    if (!this.connection) {
      this.connection = new HubConnection(this.hubURL);
    }
  }

  public get hub(): HubConnection {
    return this._started && this.connection;
  }

  public send(text: string) {
    if (this.hub) {
      this.hub.invoke('send', text);
    }
  }

  public pubChannel(name: string, payload: any) {
    if (this.hub) {
      this.hub.invoke("broadcast", name, payload);
    }
  }

  public subChannel(name: string, callback) {
    if (this.hub) {
      this.hub.on(name, data => {
        callback(data);
      });
    } else {
      Toast.warning("cannot connect at this moment", this.hubURL);
    }
  }

  public receive(callback) {
    if (this.hub) {
      this.hub.on('send', data => {
        callback(data);
      });
    } else {
      Toast.warning("cannot connect at this moment", this.hubURL);
    }
  }

  start(): Promise<void> {
    let promise: Promise<void>;

    if (this._started) {
      promise = Promise.resolve(undefined);
    } else {
      promise = this.connection.start();

      promise.then(() => {
        this._started = true;
        Toast.success("Connected..", this.hubURL);
      }).catch(error => {
        Toast.error(JSON.stringify(error), this.hubURL);
      });
    }
    return promise;
  }








}
