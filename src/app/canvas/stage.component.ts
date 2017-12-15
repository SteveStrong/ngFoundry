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

import { foGlyph, Pallet } from "../foundry/foGlyph.model";
import { foShape2D, Stencil } from "../foundry/foShape2D.model";
import { legoCore, brick, rotateDemo, Circle, OneByOne, TwoByOne, TwoByTwo, TwoByFour, OneByTen, TenByTen } from "./legoshapes.model";

import { foDisplayObject } from "../foundry/foDisplayObject.model";
import { dRectangle, Display } from "./displayshapes.model";

import { Toast } from '../common/emitter.service';
import { SignalRService } from "../common/signalr.service";

//https://greensock.com/docs/TweenMax
import { TweenLite, TweenMax, Back, Power0, Bounce } from "gsap";


@Component({
  selector: 'foundry-stage',
  templateUrl: './stage.component.html'
})
export class StageComponent extends foPage implements OnInit, AfterViewInit {
  // a reference to the canvas element from our template
  @ViewChild('canvas') public canvasRef: ElementRef;
  @Input() public width = 1000;
  @Input() public height = 800;

  message: Array<any> = [];
  screen2D: Sceen2D = new Sceen2D();


  constructor(private signalR: SignalRService) {
    super();
  }

  doClear() {
    this.clearAll();
    this.message = [];
    this.signalR.pubChannel("clearAll", {});
  }

  doUndo() {
  }

  doDelete() {
    this.deleteSelected(shape => {
      this.signalR.pubChannel("deleteShape", shape.asJson);
    });

  }

  doDuplicate() {
  }

  private computeSpec: any = {
    height: function () {
      let size = parseInt(this.size.split(':')[1]);
      return 25 * size;
    },
    width: function () {
      let size = parseInt(this.size.split(':')[0]);
      return 25 * size;
    }
  };

  ngOnInit() {
    this.onItemChangedParent = (shape: foGlyph): void => {
      this.signalR.pubChannel("parent", shape.asJson);
    }
    this.onItemChangedPosition = (shape: foGlyph): void => {
      this.signalR.pubChannel("moveShape", shape.asJson);
    }


    Pallet.define(foGlyph);

    let compute = this.computeSpec;
    Stencil.define(OneByOne, compute);

    Stencil.define(OneByOne, compute);
    Stencil.define(TwoByOne, compute);
    Stencil.define(TwoByTwo, compute);
    Stencil.define(TwoByFour, compute);
    Stencil.define(OneByTen, compute);
    Stencil.define(TenByTen, compute);
  }

  onMouseLocationChanged = (loc: cPoint, state: string): void => {
    this.mouseLoc = loc;
    this.mouseLoc.state = state;
    this.writeDisplayMessage(loc);
    this.writeShapeMessage(loc)
  }

  doDynamicCreate() {

    let shape = Pallet.create(foGlyph, {
      x: 150,
      y: 100,
      height: 50,
      width: 20,
    });
    this.addToModel(shape);
    this.signalR.pubChannel("syncGlyph", shape.asJson);
  }

  doAddGlyph() {
    let shape = Pallet.create(foGlyph, {
      color: 'cyan',
      x: 150,
      y: 100,
      height: 150,
      width: 200,
    }, this.addToModel.bind(this));
    this.signalR.pubCommand("Glyph", { guid: shape.myGuid }, shape.asJson);
  }

  doAddSubGlyph() {
    let shape = Pallet.create(foGlyph, {
      color: 'purple',
      height: 150,
      width: 200,
    }, this.addToModel.bind(this));

    Pallet.create(foGlyph, {
      color: 'blue',
      x: 25,
      y: 25,
      height: 50,
      width: 300,
    }).addAsSubcomponent(shape);

    this.signalR.pubChannel("addGlyph", shape.asJson);
  }

  public displayObj;
  writeDisplayMessage(loc: cPoint) {
    if (!this.displayObj) return;
    this.message = ['localToGlobal (10,20)']
    this.message.push(this.displayObj.localToGlobal(10, 20));
  }



  doAddRectangle() {

    let shape = Display.create(dRectangle, {
      color: 'black',
      width: 300,
      height: 100
    }).drop(100, 50);

    this.addToModel(shape);
    this.signalR.pubCommand("syncDisp", { guid: shape.myGuid }, shape.asJson);

    shape.updateContext(this.screen2D.context)
    this.displayObj = shape;

    // let subShape = Display.create(dRectangle, {
    //   color: 'blue',
    //   x: 150,
    //   y: 150,
    //   width: 30,
    //   height: 100
    // }).addAsSubcomponent(shape);
    // //this.addToModel(subShape);

    // this.signalR.pubChannel("syncDisp", subShape.asJson);
  }


  doAddOneByOne() {
    let shape = Stencil.create(OneByOne, {
      color: 'red'
    });
    this.addToModel(shape);
    this.signalR.pubChannel("syncShape", shape.asJson);
  }

  doAddTwoByOne() {
    let shape = Stencil.create(TwoByOne, {
      color: 'cyan'
    });
    this.addToModel(shape);
    this.signalR.pubChannel("syncShape", shape.asJson);
  }

  doAddTwoByTwo() {
    let shape = Stencil.create(TwoByTwo, {
      color: 'pink'
    });
    this.addToModel(shape);
    this.signalR.pubChannel("syncShape", shape.asJson);
  }

  public displayShape;
  writeShapeMessage(loc: cPoint) {
    if (!this.displayShape) return;

    let shape = this.displayShape;
    let angle = shape.rotation() * Math.PI / 180
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    let x = -shape.pinX();
    let y = -shape.pinY();

    let width = shape.width;
    let height = shape.height;
    //ctx.translate(this.x + x, this.y + y);
    //ctx.transform(cos, sin, -sin, cos, -x, -y);

    let mtx = new Matrix2D();
    //mtx.append(cos, sin, -sin, cos, -x, -y);
    mtx.append(cos, sin, -sin, cos, shape.x + x, shape.y + y);

    this.message = ['pt (10,0)'];
    this.message.push(mtx.transformPoint(10, 0));
    //this.message.push('pt (0,0) inv');
    //this.message.push( mtx.invertPoint(0, 0));

    //this.message.push(`pt (${loc.x},${loc.y}) `);
    //this.message.push(mtx.transformPoint(loc.x, loc.y));
    this.message.push(`pt (${loc.x},${loc.y}) inv`);
    let pt = mtx.invertPoint(loc.x, loc.y)
    this.message.push(pt);
    let xtrue = x < pt.x && pt.x < x + width;
    let ytrue = y < pt.y && pt.y < y + height;
    this.message.push(`x ${x} < ${pt.x} < ${x + width}  ${xtrue}`);
    this.message.push(`y ${y} < ${pt.y} < ${y + height}  ${ytrue}`);

    let isHit = shape.localHitTest(loc);
    shape.isSelected = isHit;
    this.message.push(`isHit ${isHit}`);
    this.message.push(mtx.invert());
  }

  doAddTwoByFour() {

    class localTwoByFour extends TwoByFour {
      public pinX = (): number => { return 0.6 * this.width; }
      public pinY = (): number => { return 0.0 * this.height; }
    }

    Stencil.define(localTwoByFour, this.computeSpec);

    let shape = Stencil.create(localTwoByFour, {
      color: 'green',
      angle: 90,
    }).drop(200, 200);

    this.addToModel(shape);
    this.signalR.pubChannel("syncShape", shape.asJson);
    this.displayShape = shape;
  }

  doAddOneByTen() {
    let shape = Stencil.create(OneByTen, {
      color: 'white',
      height: 10,
      width: function (): number { return this.height / 4; },
      Animation: function (): void {
        let angle = this.height + 10;
        angle = angle >= 360 ? 0 : angle;
        this.height = angle;
        this.angle = angle;
      }
    }).drop(500, 500);
    this.addToModel(shape);
    this.signalR.pubChannel("syncShape", shape.asJson);

  }

  doAddTenByTen() {
    let shape = Stencil.create(TenByTen, {
      color: 'gray',
      name: TenByTen.typeName()
    }).drop(600, 300);

    this.addToModel(shape);
    this.signalR.pubChannel("syncShape", shape.asJson);
  }

  doAddStack() {
    // this.addToModel(this.doCreateLego(Circle, {
    //   x: 600,
    //   y: 300
    // }));
    // this.addToModel(this.doCreateLego(Circle, {
    //   x: 475,
    //   y: 175
    // }));

    let shape = Stencil.create(TenByTen, {
      opacity: .5,
      color: 'gray',
      angle: 0,
      name: TenByTen.typeName()
    }).drop(600, 300);

    this.addToModel(shape);

    this.signalR.pubChannel("syncShape", shape.asJson);

    let subShape = Stencil.create(TwoByFour, {
      color: 'red',
    }).addAsSubcomponent(shape).override({
      x: function () { return -shape.width / 4; },
      y: 150,
      angle: 0,
      Animation: function () {
        let angle = this.angle + 10;
        angle = angle >= 360 ? 0 : angle;
        this.angle = angle;
      },
    });

    this.signalR.pubChannel("syncShape", subShape.asJson);
    //this.signalR.pubChannel("parent", subShape.asJson);
  }

  add(shape: foShape2D): foShape2D {
    return this.addToModel(shape) as foShape2D;
  }
  doAddrotateDemo() {
    let shape = this.add(Stencil.create(rotateDemo, {
      color: 'white',
    })).drop(500, 500);



    this.signalR.pubChannel("syncShape", shape.asJson);
  }

  public ngAfterViewInit() {

    this.screen2D.setRoot(this.canvasRef.nativeElement, this.width, this.height);

    this.screen2D.render = (context: CanvasRenderingContext2D) => {
      context.save();
      context.fillStyle = "yellow";
      context.fillRect(0, 0, this.width, this.height);
      context.restore();

      this.render(context);
    }

    this.screen2D.go();

    this.signalR.start().then(() => {

      this.signalR.subChannel("moveShape", json => {
        this.found(json.myGuid, shape => {
          TweenLite.to(shape, .8, {
            x: json.x,
            y: json.y,
            ease: Back.easeInOut
          }).eventCallback("onComplete", () => { shape.override({ x: json.x, y: json.y }) });
        });
      });

      this.signalR.subChannel("addGlyph", json => {
        //console.log(json);
        this.findItem(json.myGuid, () => {
          Pallet.create(foGlyph, json, this.addToModel.bind(this));
        });
      });

      this.signalR.subCommand("Glyph", (cmd, json) => {
        //console.log(json);
        this.findItem(cmd.guid, () => {
          Pallet.create(foGlyph, json, this.addToModel.bind(this));
        });
      });



      this.signalR.subChannel("deleteShape", json => {
        //console.log(json);
        this.found(json.myGuid, shape => {
          this.removeFromModel(shape)
        });
      });

      this.signalR.subChannel("clearAll", json => {
        this.clearAll();
        this.message = [];
      });


      this.signalR.subChannel("parent", json => {
        this.found(json.myGuid, (shape) => {
          this.message.push(json);
          this.removeFromModel(shape);
          shape.removeFromParent();
          if (json.parentGuid) {
            this.found(json.parentGuid, (item) => {
              item.addSubcomponent(shape, { x: json.x, y: json.y });
              // TweenLite.to(shape, .8, {
              //   x: json.x,
              //   y: json.y,
              //   ease: Back.easeInOut
              // }).eventCallback("onComplete", () => { shape.override({ x: json.x, y: json.y }) });

            });
          } else {
            this.addToModel(shape);
          }

        });
      });

      this.signalR.subChannel("syncGlyph", json => {
        this.findItem(json.myGuid, () => {
          let type = json.myType;
          let shape = Pallet.makeInstance(type, json)
          this.addToModel(shape);
        });
      });

      this.signalR.subChannel("syncShape", json => {
        this.findItem(json.myGuid, () => {
          //this.message.push(json);
          let type = json.myType;
          let parent = json.parentGuid;
          delete json.parentGuid;
          let shape = Stencil.makeInstance(type, json);
          if (parent) {
            this.found(parent, (item) => {
              item.addSubcomponent(shape);
            });
          } else {
            this.addToModel(shape);
          }

        });
      });


      this.signalR.subCommand("syncDisp", (cmd, json) => {
        this.findItem(cmd.guid, () => {
          //this.message.push(json);
          let type = json.myType;
          let parent = json.parentGuid;
          delete json.parentGuid;
          let shape = Display.makeInstance(type, json);
          if (parent) {
            this.found(parent, (item) => {
              item.addSubcomponent(shape);
            });
          } else {
            this.addToModel(shape);
          }

        });
      });

    });
  }
}




