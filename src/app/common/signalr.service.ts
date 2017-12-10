import { Injectable, OnInit } from '@angular/core';
import { HubConnection } from '@aspnet/signalr-client';
import { EmitterService, Toast } from "../common/emitter.service";

import { Tools } from "../foundry/foTools";
import { PubSub } from "../foundry/foPubSub";

import { environment } from '../../environments/environment';

//https://blogs.msdn.microsoft.com/webdev/2017/09/14/announcing-signalr-for-asp-net-core-2-0/

@Injectable()
export class SignalRService {

  private _started: boolean = false;
  //private hubURL = environment.signalRServer;
  private hubURL = environment.local ? environment.signalRServer : environment.signalfoundry;
  private connection: HubConnection;
  private _guid:string = Tools.generateUUID();

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
      console.log('text: ' + text);
      this.hub.invoke('send', text);
    }
  }

  public pubChannel(name: string, payload?: any) {
    if (this.hub) {
      //console.log('pubChannel ' + name)
      payload._channel = this._guid;
      this.hub.invoke("broadcast", name, payload);
    }
  }

  public subChannel(name: string, callback) {
    if (this.hub) {
      //console.log('subChannel ' + name)
      this.hub.on(name, data => {
        //console.log(name + ':  ' + JSON.stringify(data, undefined, 3));
        if ( data._channel != this._guid) {
          delete data._channel;
          callback(data);
        }
      });
    } else {
      Toast.warning("cannot connect at this moment", this.hubURL);
    }
  }


  public pubCommand(name: string, command: any, payload?: any) {
    if (this.hub) {
      //console.log('pubChannel ' + name)
      command._channel = this._guid;
      this.hub.invoke("command", name, command, payload);
    }
  }

  public subCommand(name: string, callback) {
    if (this.hub) {
      //console.log('subChannel ' + name)
      this.hub.on(name, (command, payload) => {
        //console.log(name + ':  command: ' + JSON.stringify(command, undefined, 3));
        //console.log(name + ':  payload: ' + JSON.stringify(payload, undefined, 3));
        if ( command._channel != this._guid) {
          callback(command, payload);
        }
      });
    } else {
      Toast.warning("cannot connect at this moment", this.hubURL);
    }
  }
  public receive(callback) {
    if (this.hub) {
      this.hub.on('send', data => {
        console.log('receive: ' + JSON.stringify(data, undefined, 3));
        callback(data);
      });
    } else {
      Toast.warning("cannot connect at this moment", this.hubURL);
    }
  }

  public askforVersion() {
    if (this.hub) {
      this.hub.invoke('version');
      this.hub.on('version', massage => {
        Toast.success(this.hubURL, massage);
      });
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
        this.askforVersion()
      }).catch(error => {
        Toast.error(JSON.stringify(error), this.hubURL);
      });
    }
    return promise;
  }








}
