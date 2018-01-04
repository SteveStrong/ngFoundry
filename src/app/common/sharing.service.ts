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

import { foNode } from "../foundry/foNode.model";
import { foGlyph } from "../foundry/foGlyph.model";
import { foShape2D } from "../foundry/foShape2D.model";
import { foPage } from "../foundry/foPage.model";


//https://greensock.com/docs/TweenMax
import { TweenLite, TweenMax, Back, Power0, Bounce } from "gsap";
import { foObject } from 'app/foundry/foObject.model';
import { LifecycleLock, Lifecycle } from 'app/foundry/foLifecycle';

@Injectable()
export class SharingService {

  private _page: foPage;



  constructor(
    private signalR: SignalRService,
    private http: Http) {

    this.initLifecycle();
  }

  initLifecycle() {

    //might be able to use a filter on events
    Lifecycle.observable.subscribe(event => {

      LifecycleLock.whenUnprotected(event.myGuid, this, _ => {
        let cmd = this[event.cmd];
        let obj = event.object
        if (cmd) {
          cmd = cmd.bind(this);
          cmd(event.object, event.value);
        } else {
          this.signalR.pubCommand(event.cmd, { guid: obj.myGuid }, obj.asJson);
          console.log('pubCommand:', event.cmd, event);
        }
      })

    });
  }

  public created(shape: foNode) {
    this.signalR.pubCommand("syncShape", { guid: shape.myGuid }, shape.asJson);
    return this;
  }

  public reparent(shape: foNode) {
    this.signalR.pubCommand("syncParent", { guid: shape.myGuid }, shape.myParent().myGuid);
    return this;
  }

  public destroyed(shape: foGlyph) {
    this.signalR.pubCommand("destroyed", { guid: shape.myGuid });
    return this;
  }

  public moved(shape: foGlyph) {
    this.signalR.pubCommand("dropShape", { guid: shape.myGuid }, shape.getLocation());
    return this;
  }

  public easeTo(shape: foGlyph) {
    this.signalR.pubCommand("easeTo", { guid: shape.myGuid }, shape.getLocation());
  }

  public easeTween(shape: foGlyph, value?: any) {
    this.signalR.pubCommand("easeTween", { guid: shape.myGuid }, value);
  }


  public selected(shape: foGlyph) {
    this.signalR.pubCommand("selectShape", { guid: shape.myGuid }, shape.isSelected);
    return this;
  }


  //--------------------------------
  public clearPage() {
    this.signalR.pubCommand("clearPage", {});
    return this;
  }



  public syncStencil(know: foObject) {
    this.signalR.pubCommand("syncStencil", { guid: know.myGuid }, know.asJson);
    return this;
  }

  public syncConcept(know: foObject) {
    this.signalR.pubCommand("syncConcept", { guid: know.myGuid }, know.asJson);
    return this;
  }


  public syncGlue(target: foObject) {
    this.signalR.pubCommand("syncGlue", target.asJson);
    return this;
  }

  public callMethod(cmd: string, target: foObject) {
    this.signalR.pubCommand("callMethod", { func: cmd }, target.asJson);
    return this;
  }

  public broadcast(cmd: string, data: any) {
    this.signalR.pubCommand("callMethod", { func: cmd }, data);
    return this;
  }


  //------------------------------------------------
  public startSharing(page: foPage) {

    this._page = page;

    this.signalR.start().then(() => {

      this.signalR.subCommand("dropShape", (cmd, data) => {
        LifecycleLock.protected(cmd.guid, this, _ => {
          this._page.found(cmd.guid, shape => {
            shape.drop(data.x, data.y, data.angle);
          });
        });
      });

      this.signalR.subCommand("easeTo", (cmd, data) => {
        LifecycleLock.protected(cmd.guid, this, _ => {
          this._page.found(cmd.guid, shape => {
            shape.easeTo(data.x, data.y, .8, Back.easeInOut);
          });
        });
      });


      this.signalR.subCommand("selectShape", (cmd, data) => {
        LifecycleLock.protected(cmd.guid, this, _ => {
          this._page.found(cmd.guid, shape => {
            shape.isSelected = data;
          });
        });
      });

      this.signalR.subCommand("destroyed", (cmd, data) => {
        LifecycleLock.protected(cmd.guid, this, _ => {
          this._page.found(cmd.guid, shape => {
            this._page.destroyed(shape);
          });
        });
      });

      this.signalR.subCommand("clearPage", (cmd, data) => {
        this._page.clearPage();
      });

      this.signalR.subCommand("syncStencil", (cmd, data) => {
        foObject.jsonAlert(data);
        Stencil.override(data);
      });

      this.signalR.subCommand("syncConcept", (cmd, data) => {
        foObject.jsonAlert(data);
        Concept.override(data);
      });

      this.signalR.subCommand("syncParent", (cmd, parentGuid) => {
        //foObject.jsonAlert(cmd);

        LifecycleLock.protected(cmd.guid, this, _ => {
          this._page.found(cmd.guid, (shape) => {
            this._page.found(parentGuid,
              (item) => { shape.reParent(item) },
              (miss) => { shape.reParent(this._page) })
          });
        });

      });



      this.signalR.subCommand("syncShape", (cmd, data) => {
        //foObject.jsonAlert(data);

        LifecycleLock.protected(cmd.guid, this, _ => {
          this._page.findItem(cmd.guid, () => {
            //this.message.push(json);
            let spec = Stencil.find(data.myClass);
            let shape = spec ? spec.newInstance(data) : RuntimeType.newInstance(data.myType, data);
            this._page.found(cmd.parentGuid,
              (item) => { item.addSubcomponent(shape); },
              (miss) => { this._page.addSubcomponent(shape); }
            );
          }, found => {
            found.override(data);
          });
        });

      });

      this.signalR.subCommand("easeTween", (cmd, value) => {
        //foObject.jsonAlert(value);
        LifecycleLock.protected(cmd.guid, this, _ => {
          let { time, ease, to } = value;
          this._page.found(cmd.guid, item => {
            item.easeTween(to, time, Back[ease]);
          });
        });

      });

      this.signalR.subCommand("callMethod", (cmd, data) => {
        let func = cmd.func;
        func && this[func](data);
      });


      this.signalR.subCommand("syncGlue", (cmd, data) => {
        //foObject.jsonAlert(data);
        this._page.found(cmd.sourceGuid, (source) => {
          this._page.found(cmd.targetGuid, (target) => {
            let glue = (<foShape2D>source).createGlue(cmd.sourceHandle, (<foShape2D>target));
            (<foShape2D>target).drop();
          });
        });
      });
    });
  }

}
