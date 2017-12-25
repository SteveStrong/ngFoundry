import { Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { EmitterService } from '../common/emitter.service';


import { Sceen2D } from "../foundryDrivers/canvasDriver";
import { iShape, iPoint, iSize } from '../foundry/foInterface'

import { PubSub } from "../foundry/foPubSub";
import { Matrix2D } from "../foundry/foMatrix2D";
import { cPoint, cRect } from "../foundry/foGeometry";
import { Tools } from "../foundry/foTools";

import { foCollection } from "../foundry/foCollection.model";
import { foDictionary } from "../foundry/foDictionary.model";


import { foPage } from "../foundry/foPage.model";

import { foHandle } from "../foundry/foHandle";
import { foGlue } from "../foundry/foGlue";
import { foGlyph, Pallet } from "../foundry/foGlyph.model";
import { foShape2D, Stencil } from "../foundry/foShape2D.model";
import { legoCore, OneByOne, TwoByOne, TwoByTwo, TwoByFour, OneByTen, TenByTen, Line } from "./legoshapes.model";

import { foDisplay2D } from "../foundry/foDisplay2D.model";
import { dRectangle, dGlue, Display } from "./displayshapes.model";

import { Toast } from '../common/emitter.service';
import { SignalRService } from "../common/signalr.service";

//https://greensock.com/docs/TweenMax
import { TweenLite, TweenMax, Back, Power0, Bounce } from "gsap";
import { foObject } from 'app/foundry/foObject.model';


@Component({
  selector: 'foundry-stage',
  templateUrl: './stage.component.html'
})
export class StageComponent extends foPage implements OnInit, AfterViewInit {
  // a reference to the canvas element from our template
  @ViewChild('canvas') public canvasRef: ElementRef;
  @Input() public pageWidth = 1000;
  @Input() public pageHeight = 800;

  message: Array<any> = [];
  screen2D: Sceen2D = new Sceen2D();


  constructor(private signalR: SignalRService) {
    super();
  }

  doClear() {
    this.clearAll();
    this.message = [];
    this.signalR.pubCommand("clearAll", {});
  }

  doUndo() {
  }

  doDelete() {
    this.deleteSelected(shape => {
      this.signalR.pubCommand("deleteShape", { guid: shape.myGuid });
    });

  }

  doDuplicate() {
  }


  ngOnInit() {
    this.onItemChangedParent = (shape: foGlyph): void => {
      this.signalR.pubCommand("parent", { guid: shape.myGuid, parentGuid: shape.myParent().myGuid });
    }

    this.onItemChangedPosition = (shape: foGlyph): void => {
      this.signalR.pubCommand("moveShape", { guid: shape.myGuid }, shape.getLocation());
    }

    this.onItemHoverEnter = (loc: cPoint, shape: foGlyph): void => {

      this.message = [];
      this.message.push(`Hover (${loc.x},${loc.y}) Enter`);
      shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      this.message.push(shape);

      if (shape) {
        shape.drawHover = function (ctx: CanvasRenderingContext2D) {
          ctx.strokeStyle = "yellow";
          ctx.lineWidth = 4;
          shape.drawOutline(ctx);
        }
      }
    }

    this.onItemHoverExit = (loc: cPoint, shape: foGlyph): void => {

      this.message = [];
      this.message.push(`Hover (${loc.x},${loc.y}) Exit`);
      shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      this.message.push(shape);

      if (shape) {
        shape.drawHover = undefined;
      }
    }

    this.onHandleHoverEnter = (loc: cPoint, handle: foHandle, keys?: any): void => {
      //let shape = handle.myParentGlyph();

      this.message = [];
      //this.message.push(`Hover (${loc.x},${loc.y}) Enter  ${shape.myName}`);
      //shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      //this.message.push(shape);
      this.message.push(`Handle Hover (${loc.x},${loc.y}) Enter ${handle && handle.myName}`);
      handle && this.message.push(handle.globalToLocal(loc.x, loc.y));
      //this.message.push(handle);
    }

    this.onTrackHandles = (loc: cPoint, handles: foCollection<foHandle>, keys?: any): void => {
      this.message = [];
      handles.forEach(handle => {
        //if (handle.hitTest(loc)) {
        //foObject.beep();
        //}
        this.message.push(`onTrackHandles (${loc.x},${loc.y}) Move ${handle && handle.myName}`);
        handle && this.message.push(handle.globalToLocal(loc.x, loc.y));
      })

    }

    this.onHandleMoving = (loc: cPoint, handle: foHandle, keys?: any): void => {
      //let shape = handle.myParentGlyph();

      this.message = [];
      //this.message.push(`Hover (${loc.x},${loc.y}) Move  ${shape.myName}`);
      //shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      //this.message.push(shape);
      this.message.push(`Handle Hover (${loc.x},${loc.y}) Move ${handle && handle.myName}`);
      handle && this.message.push(handle.globalToLocal(loc.x, loc.y));
      //this.message.push(handle);
    }

    this.onHandleHoverExit = (loc: cPoint, handle: foHandle, keys?: any): void => {
      //let shape = handle.myParentGlyph();

      this.message = [];
      //this.message.push(`Hover (${loc.x},${loc.y}) Exit ${shape.myName}`);
      //shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      //this.message.push(shape);
      this.message.push(`Handle Hover (${loc.x},${loc.y}) Exit ${handle && handle.myName}`);
      handle && this.message.push(handle.globalToLocal(loc.x, loc.y));
      //this.message.push(handle);

    }


    Pallet.define(foGlyph);

    let compute = {
      height: function () {
        let size = parseInt(this.size.split(':')[1]);
        return 25 * size;
      },
      width: function () {
        let size = parseInt(this.size.split(':')[0]);
        return 25 * size;
      }
    }
    Stencil.define(OneByOne, compute);

    Stencil.define(OneByOne, compute);
    Stencil.define(TwoByOne, compute);
    Stencil.define(TwoByTwo, { width: 50, height: 50 });
    Stencil.define(TwoByFour, compute);
    Stencil.define(OneByTen, compute);
    Stencil.define(TenByTen, { width: 250, height: 250 });
  }

  onMouseLocationChanged = (loc: cPoint, state: string, keys?: any): void => {
    this.mouseLoc = loc;
    this.mouseLoc.state = state; 212
    this.mouseLoc.keys = keys;
  }

  doDynamicCreate() {

    let shape = Pallet.create(foGlyph, {
      x: 150,
      y: 100,
      height: 50,
      width: 20,
    });
    this.addSubcomponent(shape);
    this.signalR.pubCommand("syncGlyph", { guid: shape.myGuid }, shape.asJson);
  }

  doAddGlyph() {
    let shape = Pallet.create(foGlyph, {
      color: 'cyan',
      x: 150,
      y: 100,
      height: 150,
      width: 200,
    }).addAsSubcomponent(this);
    this.signalR.pubCommand("Glyph", { guid: shape.myGuid }, shape.asJson);
  }

  doAddSubGlyph() {
    let shape = Pallet.create(foGlyph, {
      color: 'purple',
      height: 150,
      width: 200,
    }).addAsSubcomponent(this);

    Pallet.create(foGlyph, {
      color: 'blue',
      x: 25,
      y: 25,
      height: 50,
      width: 300,
    }).addAsSubcomponent(shape);

    this.signalR.pubCommand("addGlyph", { guid: shape.myGuid }, shape.asJson);
  }




  doAddOneByOne() {
    let shape = Stencil.create(OneByOne, {
      color: 'red',
      x: 200,
      y: 200,
    });
    this.addSubcomponent(shape);
    this.signalR.pubCommand("syncShape", { guid: shape.myGuid }, shape.asJson);
  }

  doAddTwoByOne() {
    let shape = Stencil.create(TwoByOne, {
      color: 'cyan'
    });
    this.addSubcomponent(shape);
    this.signalR.pubCommand("syncShape", { guid: shape.myGuid }, shape.asJson);
  }

  doAddTwoByTwo() {

    let shape = Stencil.create(TwoByTwo, {
      color: 'pink',
      myName: "main shape"
    }).drop(200, 200).addAsSubcomponent(this);

    this.signalR.pubCommand("syncShape", { guid: shape.myGuid }, shape.asJson);
  }




  doAddTwoByFour() {

    class localTwoByFour extends TwoByFour {
      public pinX = (): number => { return 0.5 * this.width; }
      public pinY = (): number => { return 0.5 * this.height; }
    }

    Stencil.define(localTwoByFour, Stencil.spec(TwoByFour));

    let shape = Stencil.create(localTwoByFour, {
      color: 'green',
      angle: 45,
    }).drop(200, 200);

    this.addSubcomponent(shape);
    this.signalR.pubCommand("syncShape", { guid: shape.myGuid }, shape.asJson);
  }

  doAddOneByTen() {
    let shape = Stencil.create(OneByTen, {
      color: 'yellow',
      // height: 10,
      // width: function (): number { return this.height / 4; },
      Animation: function (): void {
        let angle = this.angle + 10;
        angle = angle >= 360 ? 0 : angle;
        //this.height = angle;
        this.angle = angle;
      }
    }).drop(500, 500);
    this.addSubcomponent(shape);
    this.signalR.pubCommand("syncShape", { guid: shape.myGuid }, shape.asJson);
  }

  doAddTenByTen() {
    let shape = Stencil.create(TenByTen, {
      color: 'gray',
      name: TenByTen.typeName()
    }).drop(600, 300);

    this.addSubcomponent(shape);
    this.signalR.pubCommand("syncShape", { guid: shape.myGuid }, shape.asJson);
  }

  doAddStack() {
    let shape = Stencil.create(TenByTen, {
      opacity: .5,
      color: 'gray',
      angle: 10
    }).drop(600, 300);

    this.addSubcomponent(shape);

    this.signalR.pubCommand("syncShape", { guid: shape.myGuid }, shape.asJson);

    let subShape = Stencil.create(TwoByFour, {
      color: 'red',
    }).addAsSubcomponent(shape).override({
      x: function () { return shape.width / 4; },
      y: 150,
      angle: 0,
    });

    // => does a scope that moves the page
    subShape.doAnimation = (): void => {
      let angle = this.angle + .5;
      angle = angle >= 360 ? 0 : angle;
      this.angle = angle;
    }

    subShape.doAnimation = function (): void {
      let angle = this.angle + .5;
      angle = angle >= 360 ? 0 : angle;
      this.angle = angle;
    }

    this.signalR.pubCommand("syncShape", { guid: shape.myGuid }, shape.asJson);
    //this.signalR.pubChannel("parent", subShape.asJson);
  }

  doShape1D() {

    let height = 20;
    let x1 = 150;
    let y1 = 100;
    let x2 = 350;
    let y2 = 200;

    let dX = x2 - x1;
    let dY = y2 - y1;

    let spec = {
      angle: foGlyph.RAD_TO_DEG * Math.atan2(dY, dX),
      length: Math.sqrt(dX * dX + dY * dY),
      cX: (x2 + x1) / 2,
      cY: (y2 + y1) / 2,
    }

    let fake = Stencil.create(foShape2D, {
      opacity: .5,
      color: 'gray',
      angle: spec.angle,
      width: spec.length,
      height: height,
    }).drop(400, 400).addAsSubcomponent(this);


    let shape = Stencil.create(Line, {
      opacity: .5,
      color: 'gray',
      startX: x1,
      startY: y1,
      finishX: x2,
      finishY: y2,
      height: height,
    }).drop(400, 300).addAsSubcomponent(this);

    this.signalR.pubCommand("syncShape", { guid: shape.myGuid }, shape.asJson);
  }

  doShapeGlue() {
    let shape1 = Stencil.create(TwoByOne, {
      color: 'cyan',
      opacity: .8,

    }).drop(100, 300, 45).addAsSubcomponent(this);


    let shape2 = Stencil.create(TwoByOne, {
      color: 'cyan',
      opacity: .8,
    }).drop(300, 400, 0).addAsSubcomponent(this);
    shape2.pinX = (): number => { return 0.0; }

    let pt1 = shape1.localToGlobal(shape1.pinX(), shape1.pinY());
    let pt2 = shape2.localToGlobal(shape2.pinX(), shape2.pinY());
    let pc = pt1.midpoint(pt2);


    let shape = Stencil.create(Line, {
      opacity: .5,
      color: 'gray',
      height: 30,
      startX: pt1.x,
      startY: pt1.y,
      finishX: pt2.x,
      finishY: pt2.y,
    }).drop(600, 350).addAsSubcomponent(this);

    let wire = Stencil.create(Line, {
      opacity: .5,
      height: 30,
      startX: pt1.x,
      startY: pt1.y,
      finishX: pt2.x,
      finishY: pt2.y,
      color: 'black',
    }).addAsSubcomponent(this);


    wire.createGlue('begin', shape1);
    wire.createGlue('end', shape2);
  }

  doObjGlue() {
    let shape1 = Display.create(dGlue, {
    }).drop(100, 200, 30).addAsSubcomponent(this);

    let shape2 = Display.create(dGlue, {
    }).drop(400, 250).addAsSubcomponent(this);
    shape2.pinX = (): number => { return 0.0; }


    let wire = Stencil.create(Line, {
      opacity: .5,
      height: 20,
      color: 'black',
    }).drop(400, 400).addAsSubcomponent(this);

    wire.createGlue('begin', shape1);
    wire.createGlue('end', shape2);
  }

  doDropGlue() {
    let subShape = Display.create(dGlue, {
    }).drop(500, 300, 30);
    this.addSubcomponent(subShape);

    // this.signalR.pubChannel("syncDisp", subShape.asJson);
  }

  doObjRect() {
    class objRect extends dRectangle {
      pinX = (): number => { return 0.0 * this.width; }
      pinY = (): number => { return 0.5 * this.height; }

      Animation = (): void => {
        let angle = this.angle + .5;
        angle = angle >= 360 ? 0 : angle;
        this.angle = angle;
      }
    }

    let subShape = Display.create(objRect, {
      color: 'blue',
      width: 150,
      height: 100,
    }).drop(300, 300, 0);
    subShape.doAnimation = subShape.Animation;

    subShape.isSelected = true;

    this.addSubcomponent(subShape);

    // this.signalR.pubChannel("syncDisp", subShape.asJson);
  }

  doObjGroup() {

    class myRect extends dRectangle {
      public pinX = (): number => { return 50; }
    }

    let shape = Display.create(myRect, {
      color: 'purple',
      myName: 'root  dRectangle',
      width: 300,
      height: 100
    }).drop(150, 150, 0);

    this.addSubcomponent(shape);
    this.signalR.pubCommand("syncDisp", { guid: shape.myGuid }, shape.asJson);

    let subShape = Display.create(dRectangle, {
      color: 'blue',
      myName: 'blue  child',
      width: 50,
      height: 100
    }).addAsSubcomponent(shape).drop(100, 50);
    // //this.addSubcomponent(subShape);

    subShape.doAnimation = function () {
      let angle = this.angle + .5;
      angle = angle >= 360 ? 0 : angle;
      this.angle = angle;
    }

    shape.doAnimation = subShape.doAnimation;

    // this.signalR.pubChannel("syncDisp", subShape.asJson);
  }


  public ngAfterViewInit() {
    this.width = this.pageWidth;
    this.height = this.pageHeight;

    this.screen2D.setRoot(this.canvasRef.nativeElement, this.pageWidth, this.pageHeight);

    this.screen2D.render = (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      this.render(ctx);
      ctx.restore();
    }

    this.preDraw = (ctx: CanvasRenderingContext2D): void => {
      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, this.pageWidth, this.pageHeight);
    }


    this.screen2D.go();

    this.signalR.start().then(() => {

      this.signalR.subCommand("moveShape", (cmd, data) => {
        this.found(cmd.guid, shape => {
          TweenLite.to(shape, .8, {
            x: data.x,
            y: data.y,
            ease: Back.easeInOut
          }).eventCallback("onComplete", () => { shape.override({ x: data.x, y: data.y }) });
        });
      });

      this.signalR.subCommand("addGlyph", (cmd, data) => {
        //console.log(json);
        this.findItem(cmd.guid, () => {
          Pallet.create(foGlyph, data).addAsSubcomponent(this);
        });
      });

      this.signalR.subCommand("Glyph", (cmd, data) => {
        //console.log(json);
        this.findItem(cmd.guid, () => {
          Pallet.create(foGlyph, data).addAsSubcomponent(this);
        });
      });



      this.signalR.subCommand("deleteShape", (cmd, data) => {
        //console.log(json);
        this.found(cmd.guid, shape => {
          this.removeSubcomponent(shape)
        });
      });

      this.signalR.subCommand("clearAll", (cmd, data) => {
        this.clearAll();
        this.message = [];
      });


      this.signalR.subCommand("parent", (cmd, data) => {
        this.found(cmd.guid, (shape) => {
          this.message.push(data);
          this.removeSubcomponent(shape);
          shape.removeFromParent();
          if (cmd.parentGuid) {
            this.found(cmd.parentGuid, (item) => {
              item.addSubcomponent(shape, { x: data.x, y: data.y });
              // TweenLite.to(shape, .8, {
              //   x: json.x,
              //   y: json.y,
              //   ease: Back.easeInOut
              // }).eventCallback("onComplete", () => { shape.override({ x: json.x, y: json.y }) });

            });
          } else {
            this.addSubcomponent(shape);
          }

        });
      });

      this.signalR.subCommand("syncGlyph", (cmd, data) => {
        this.findItem(cmd.guid, () => {
          let type = data.myType;
          let shape = Pallet.makeInstance(type, data)
          this.addSubcomponent(shape);
        });
      });


      this.signalR.subCommand("syncShape", (cmd, data) => {
        this.findItem(cmd.guid, () => {
          //this.message.push(json);
          let type = data.myType;
          let shape = Stencil.makeInstance(type, data);
          this.found(cmd.parentGuid,
            (item) => { item.addSubcomponent(shape); },
            (miss) => { this.addSubcomponent(shape); }
          );
        });
      });


      this.signalR.subCommand("syncDisp", (cmd, data) => {
        this.findItem(cmd.guid, () => {
          //this.message.push(json);
          let type = data.myType;
          let shape = Display.makeInstance(type, data);
          this.found(cmd.parentGuid,
            (item) => { item.addSubcomponent(shape); },
            (miss) => { this.addSubcomponent(shape); }
          );

        });
      });

    });
  }
}




