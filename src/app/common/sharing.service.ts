import { Injectable } from '@angular/core';

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";
import { SignalRService } from "../common/signalr.service";

import { RuntimeType } from '../foundry/foRuntimeType';
import { Stencil } from "../foundry/foStencil";

import { foNode } from "../foundry/foNode.model";
import { foGlyph2D } from "../foundry/foGlyph2D.model";
import { foShape2D } from "../foundry/foShape2D.model";


//https://greensock.com/docs/TweenMax
import { Back } from "gsap";
import { foObject } from 'app/foundry/foObject.model';
import { LifecycleLock, Lifecycle, KnowcycleLock, Knowcycle } from 'app/foundry/foLifecycle';
import { foGlue, iGlueSignature } from 'app/foundry/foGlue';

@Injectable()
export class SharingService {

  private workspace: foWorkspace = globalWorkspace;


  constructor(
    private signalR: SignalRService) {

    this.initLifecycle();
    this.initKnowcycle();
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

  //this method is a noop
  public unparent(shape: foNode) {
    return this;
  }

  //this method is a noop
  public primitive(name: string) {
    return this;
  }

  initKnowcycle() {

    //might be able to use a filter on events
    Knowcycle.observable.subscribe(event => {

      KnowcycleLock.whenUnprotected(event.myGuid, this, _ => {
        let cmd = this[event.cmd];
        let obj = event.object
        if (cmd) {
          cmd = cmd.bind(this);
          cmd(obj, event.value);
        } else {
          this.signalR.pubCommand(event.cmd, { guid: obj.myGuid }, obj.asJson);
          console.log('pubCommand:', event.cmd, event);
        }
      })

    });
  }

  public syncPage(page: foNode) {
    this.signalR.pubCommand("syncPage", { guid: page.myGuid, name: page.myName }, page.asJson);
    return this;
  }

  public created(shape: foNode) {
    this.signalR.pubCommand("syncShape", { guid: shape.myGuid }, shape.asJson);
    return this;
  }

  public reparent(shape: foNode) {
    this.signalR.pubCommand("syncParent", { guid: shape.myGuid }, shape.myParent().myGuid);
    return this;
  }



  public destroyed(shape: foGlyph2D) {
    this.signalR.pubCommand("destroyed", { guid: shape.myGuid });
    return this;
  }

  public dropped(shape: foGlyph2D) {
    this.signalR.pubCommand("dropShape", { guid: shape.myGuid }, shape.getLocation());
    return this;
  }

  public moved(shape: foGlyph2D, value?: any) {
    this.signalR.pubCommand("moveShape", { guid: shape.myGuid }, value ? value : shape.getLocation());
    return this;
  }

  public glued(glue: foGlue) {
    this.signalR.pubCommand("syncGlue", glue.signature, glue.asJson);
    return this;
  }

  public unglued(glue: foGlue) {
    this.signalR.pubCommand("syncUnGlue", glue.signature, glue.asJson);
    return this;
  }

  public handle(shape: foGlyph2D, value?: any) {
    let parentGuid = shape.myParent().myGuid;
    this.signalR.pubCommand("syncHandle", { guid: shape.myGuid, parentGuid: parentGuid, value: value }, shape.asJson);
    return this;
  }

  public easeTo(shape: foGlyph2D, value?: any) {
    this.signalR.pubCommand("easeTo", { guid: shape.myGuid }, value ? value : shape.getLocation());
  }

  public easeTween(shape: foGlyph2D, value?: any) {
    this.signalR.pubCommand("easeTween", { guid: shape.myGuid }, value);
  }


  public selected(shape: foGlyph2D) {
    this.signalR.pubCommand("selectShape", { guid: shape.myGuid }, shape.isSelected);
    return this;
  }

  public defined(know: foObject) {
    this.signalR.pubCommand("syncKnow", { guid: know.myGuid, type: know.myType }, know.asJson);
    return this;
  }

  public command(know: foObject, value: any) {
    this.signalR.pubCommand("syncCommand", { guid: know.myGuid, method: value }, know.asJson);
    return this;
  }

  public run(know: foObject, value: any) {
    let action = value.action;
    let params = value.params;
    this.signalR.pubCommand("syncRun", { guid: know.myGuid, action: action }, params);
    return this;
  }

  public layout(know: foObject, value?: any) {
    this.signalR.pubCommand("syncLayout", { guid: know.myGuid }, value);
    return this;
  }

  //--------------------------------
  public clearPage() {
    this.signalR.pubCommand("clearPage", {});
    return this;
  }



  //------------------------------------------------
  public startSharing(next?: (self:SharingService) => {}) {

  
    this.signalR.start().then(() => {

      // function forceParent(shape: foGlyph) {
      //   let parent = shape.myParent && shape.myParent();
      //   if (!parent) shape.reParent(this.workspace.activePage);
      // }

      this.signalR.subCommand("dropShape", (cmd, data) => {
        LifecycleLock.protected(cmd.guid, this, _ => {
          this.workspace.activePage.found(cmd.guid, shape => {
            shape.dropAt(data.x, data.y, data.angle);
            //forceParent(shape);
          });
        });
      });

      this.signalR.subCommand("moveShape", (cmd, data) => {
        LifecycleLock.protected(cmd.guid, this, _ => {
          this.workspace.activePage.found(cmd.guid, shape => {
            shape.move(data.x, data.y, data.angle);
            //forceParent(shape);
          });
        });
      });

      this.signalR.subCommand("easeTo", (cmd, data) => {
        LifecycleLock.protected(cmd.guid, this, _ => {
          this.workspace.activePage.found(cmd.guid, shape => {
            shape.easeTo(data.x, data.y, .8, Back.easeInOut);
            //forceParent(shape);
          });
        });
      });

      this.signalR.subCommand("selectShape", (cmd, data) => {
        LifecycleLock.protected(cmd.guid, this, _ => {
          this.workspace.activePage.found(cmd.guid, shape => {
            shape.isSelected = data;
          });
        });
      });

      this.signalR.subCommand("destroyed", (cmd, data) => {
        LifecycleLock.protected(cmd.guid, this, _ => {
          this.workspace.activePage.found(cmd.guid, shape => {
            this.workspace.activePage.destroyed(shape);
          });
        });
      });

      this.signalR.subCommand("clearPage", (cmd, data) => {
        this.workspace.activePage.clearPage();
      });

      this.signalR.subCommand("syncKnow", (cmd, data) => {
        //foObject.jsonAlert(data);
        KnowcycleLock.protected(cmd.guid, this, _ => {
          Stencil.hydrate(data);
        });

      });

      // this.signalR.subCommand("syncHandle", (cmd, data) => {
      //   //foObject.jsonAlert(cmd);
      //   let { parentGuid, value } = cmd;
      //   LifecycleLock.protected(parentGuid, this, _ => {
      //     this.workspace.activePage.found(parentGuid,
      //       (item) => { item.moveHandle(data, value) }
      //     );
      //   });

      // });

      this.signalR.subCommand("syncParent", (cmd, parentGuid) => {
        //foObject.jsonAlert(cmd);

        LifecycleLock.protected(cmd.guid, this, _ => {
          this.workspace.activePage.found(cmd.guid, (shape) => {
            this.workspace.activePage.found(parentGuid,
              (item) => { shape.reParent(item) },
              (miss) => { shape.reParent(this.workspace.activePage) })
          });
        });

      });

      this.signalR.subCommand("syncPage", (cmd, data) => {
        let pages = globalWorkspace.document.pages;
        LifecycleLock.protected(cmd.guid, this, _ => {
          pages.findItem(cmd.name, () => {  
            globalWorkspace.document.createPage(data);         
          }, found => {
            found.override(data);
          });
        });

      });


      this.signalR.subCommand("syncShape", (cmd, data) => {
        //foObject.jsonAlert(data);

        LifecycleLock.protected(cmd.guid, this, _ => {
          this.workspace.activePage.findItem(cmd.guid, () => {
            //this.message.push(json);            
            let concept = Stencil.find(data.myClass);
            let shape = concept ? concept.newInstance(data) : RuntimeType.newInstance(data.myType, data);
            //foObject.jsonAlert(shape);
            this.workspace.activePage.found(cmd.parentGuid,
              (item) => { shape.reParent(item); },
              (miss) => { shape.reParent(this.workspace.activePage); }
            );
          }, found => {
            found.override(data);
          });
        });

      });

      this.signalR.subCommand("syncLayout", (cmd, value) => {
        // foObject.jsonAlert(value);
        let self = this;
        let { method, resize, space } = value;
        this.workspace.activePage.found(cmd.guid, item => {
          item.wait(10, () =>
            LifecycleLock.protected(cmd.guid, self, _ => {
              item[method](resize, space)
            }));
        });
      });

      this.signalR.subCommand("easeTween", (cmd, value) => {
        //foObject.jsonAlert(value);
        LifecycleLock.protected(cmd.guid, this, _ => {
          let { time, ease, to } = value;
          this.workspace.activePage.found(cmd.guid, item => {
            item.easeTween(to, time, Back[ease]);
          });
        });

      });

      this.signalR.subCommand("syncCommand", (cmd, data) => {
        let method = cmd.method;
        method && this.workspace.activePage[method](data);
      });

      this.signalR.subCommand("syncRun", (cmd, value) => {
        // foObject.jsonAlert(value);
        let self = this;
        this.workspace.activePage.found(cmd.guid, item => {
          let action = cmd.action;
          LifecycleLock.protected(cmd.guid, self, _ => {
            item[action](value);
          });
        });
      });


      this.signalR.subCommand("syncGlue", (cmd, data) => {
        //foObject.jsonAlert(data);
        let { sourceGuid, sourceName, targetGuid, targetName } = cmd as iGlueSignature;
        this.workspace.activePage.found<foShape2D>(sourceGuid, (source) => {
          this.workspace.activePage.found<foShape2D>(targetGuid, (target) => {
            source.establishGlue(sourceName, target, targetName);
          });
        });
      });

      next && next(this);

    });



  }
}

