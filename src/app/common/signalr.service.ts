import { Injectable, OnInit } from '@angular/core';
import { HubConnection } from '@aspnet/signalr-client';
import { EmitterService, Toast } from "../common/emitter.service";

import { environment } from '../../environments/environment';

//https://blogs.msdn.microsoft.com/webdev/2017/09/14/announcing-signalr-for-asp-net-core-2-0/

@Injectable()
export class SignalRService {

  private _started: boolean = false;
  private hubURL = environment.signalRServer;
  private connection: HubConnection;

  constructor() {
    if (!this.connection) {
      this.connection = new HubConnection(this.hubURL);
    }
    this.ping();
  }

  public get hub(): HubConnection {
    return this._started && this.connection;
  }

  public send(text: string) {
    if (this.hub) {
      this.hub.invoke('send', text);
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

  ping() {
    this.connection.start()
      .then(() => {
        this._started = true;
        Toast.success("Connected..", this.hubURL);
      }).catch ( error => {
        Toast.error(JSON.stringify(error), this.hubURL);
      });


  }








}
