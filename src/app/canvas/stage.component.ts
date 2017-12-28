import { Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Http, Response } from '@angular/http';

import { EmitterService } from '../common/emitter.service';


import { Sceen2D } from "../foundryDrivers/canvasDriver";
import { iShape, iPoint, iSize } from '../foundry/foInterface'

import { PubSub } from "../foundry/foPubSub";
import { Matrix2D } from "../foundry/foMatrix2D";
import { cPoint, cRect } from "../foundry/foGeometry";
import { Tools } from "../foundry/foTools";

import { foCollection } from "../foundry/foCollection.model";
import { foDictionary } from "../foundry/foDictionary.model";
import { Concept } from "../foundry/foConcept.model";

import { foPage } from "../foundry/foPage.model";

import { foHandle } from "../foundry/foHandle";

import { foGlue } from "../foundry/foGlue";
import { foGlyph, Pallet } from "../foundry/foGlyph.model";
import { foShape2D, Stencil } from "../foundry/foShape2D.model";
import { foShape1D } from "../foundry/foShape1D.model";
import { foText2D } from "../foundry/foText2D.model";
import { legoCore, OneByOne, TwoByOne, TwoByTwo, TwoByFour, OneByTen, TenByTen, Line } from "./legoshapes.model";

import { foDisplay2D } from "../foundry/foDisplay2D.model";
import { dRectangle, dGlue } from "./displayshapes.model";

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


  constructor(
    private signalR: SignalRService,
    private http: Http) {
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

  doVert(){
    this.layoutSubcomponentsVertical(false, 10)
  }

  doHorz(){
    this.layoutSubcomponentsHorizontal(false, 10)
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

  doDocker() {
    let block = Concept.define<foText2D>('text::block', foText2D, {
      color: 'black'
    });

    let body = Concept.define<foShape2D>('text::body', foShape2D, {
      color: 'cyan',
    }, (parent) => {
      parent.context.forEach(item => {
        block.newInstance({
          context: item,
        }).addAsSubcomponent(parent);
      });
    });



    let source = this.http.get('assets/caas.json');
    source.subscribe(res => {
      let data = res.json();

      let frame = body.newInstance({
        context: data.categories
      }).drop(300, 200).addAsSubcomponent(this);

      //give this a chance to render so sizes are right for text
      setTimeout(() => {
        frame.layoutSubcomponentsVertical();
        //frame.layoutSubcomponentsHorizontal(true, 10);
      }, 10);

      data.containers.forEach(item =>{
        block.newInstance({
          context: item,
        }).addAsSubcomponent(this);
      });

      setTimeout(() => {
        this.layoutSubcomponentsVertical(false)
      }, 10)

    });

  }

  doText() {
    let textBlock = Concept.define<foText2D>('text::block', foText2D, {
      color: 'black',
      text: 'Hello',
    });

    this.signalR.pubCommand("syncConcept", { guid: textBlock.myGuid }, textBlock.asJson);

    let wireConcept = Concept.define<foShape1D>('text::wire', foShape1D, {
      color: 'green',
    });

    let list = ['Steve', 'Stu', 'Don', 'Linda', 'Anne', 'Debra', 'Evan'];
    let objects = [];

    let y = 100;
    let size = 20;
    let last = undefined;
    list.forEach(item => {
      size += 2;
      let shape = textBlock.newInstance({
        text: 'Hello ' + item,
        fontSize: size,
      }).drop(350, y).addAsSubcomponent(this);
      y += 1.5 * shape.fontSize;
      this.signalR.pubCommand("syncShape", { guid: shape.myGuid }, shape.asJson);

      objects.push(shape)

      if (!last) {
        last = shape;
      } else {
        let wire = wireConcept.newInstance().addAsSubcomponent(this);

        this.signalR.pubCommand("syncGlue", wire.glueStart(last).asJson);
        this.signalR.pubCommand("syncGlue", wire.glueFinish(shape).asJson);
        last = shape;
      }
    })


    objects.forEach(shape => {
      shape.drop(shape.x + Tools.randomInt(-100, 100));
      this.signalR.pubCommand("moveShape", { guid: shape.myGuid }, shape.getLocation());
    })


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




  doAddTwoByFour(properties?: any) {

    class localTwoByFour extends TwoByFour {
      public pinX = (): number => { return 0.5 * this.width; }
      public pinY = (): number => { return 0.5 * this.height; }
    }

    Stencil.define(localTwoByFour, Stencil.spec(TwoByFour));

    let spec = {
      color: 'green',
      angle: 45
    }

    if (!properties) {
      let shape = Stencil.create(localTwoByFour, spec).drop(200, 200).addAsSubcomponent(this);
      this.signalR.pubCommand("callMethod", { func: 'doAddTwoByFour' }, shape.asJson);
    } else {
      Stencil.create(localTwoByFour, properties).addAsSubcomponent(this);
    }

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

  doAddStack(properties?: any) {

    let shape = Stencil.create(TenByTen, {
      myGuid: properties && properties.shape,
      opacity: .5,
      color: 'gray',
      angle: 10
    }).drop(600, 300).addAsSubcomponent(this);

    let subShape = Stencil.create(TwoByFour, {
      myGuid: properties && properties.subShape,
      color: 'red',
    }).addAsSubcomponent(shape, {
      x: function () { return shape.width / 4; },
      y: 150,
      angle: 0,
    });



    // => does a scope that moves the page
    // subShape.doAnimation = (): void => {
    //   let angle = this.angle + .5;
    //   angle = angle >= 360 ? 0 : angle;
    //   this.angle = angle;
    // }

    subShape.doAnimation = function (): void {
      let angle = this.angle + .5;
      angle = angle >= 360 ? 0 : angle;
      this.angle = angle;
    }


    !properties && this.signalR.pubCommand("callMethod", { func: 'doAddStack' }, {
      shape: shape.myGuid,
      subShape: subShape.myGuid
    });
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
    this.signalR.pubCommand("syncShape", { guid: fake.myGuid }, fake.asJson);

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
    this.signalR.pubCommand("syncShape", { guid: shape1.myGuid }, shape1.asJson);


    let shape2 = Stencil.create(TwoByOne, {
      color: 'cyan',
      opacity: .8,
    }).drop(300, 400).addAsSubcomponent(this);
    shape2.pinX = (): number => { return 0.0; }
    this.signalR.pubCommand("syncShape", { guid: shape2.myGuid }, shape2.asJson);

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
    this.signalR.pubCommand("syncShape", { guid: shape.myGuid }, shape.asJson);

    let wire = Stencil.create(Line, {
      opacity: .5,
      height: 30,
      startX: pt1.x,
      startY: pt1.y,
      finishX: pt2.x,
      finishY: pt2.y,
      color: 'black',
    }).addAsSubcomponent(this);
    this.signalR.pubCommand("syncShape", { guid: wire.myGuid }, wire.asJson);



    this.signalR.pubCommand("syncGlue", wire.createGlue('begin', shape1).asJson);
    this.signalR.pubCommand("syncGlue", wire.createGlue('end', shape2).asJson);
  }

  doObjGlue() {

    let wire = Stencil.create(Line, {
      opacity: .5,
      height: 20,
      color: 'black',
    }).drop(400, 400).addAsSubcomponent(this);

    this.signalR.pubCommand("syncShape", { guid: wire.myGuid }, wire.asJson);

    let shape1 = Stencil.create(dGlue).addAsSubcomponent(this);

    let shape2 = Stencil.create(dGlue).addAsSubcomponent(this);
    shape2.pinX = (): number => { return 0.0; }

    wire.createGlue('begin', shape1);
    wire.createGlue('end', shape2);



    shape1.drop(100, 200, 30);
    shape2.drop(400, 250);

    this.signalR.pubCommand("syncShape", { guid: shape1.myGuid }, shape1.asJson);
    this.signalR.pubCommand("syncShape", { guid: shape2.myGuid }, shape2.asJson);

    wire.glue.forEach(glue => {
      this.signalR.pubCommand("syncGlue", glue.asJson);
    })

  }

  doDropGlue() {
    let subShape = Stencil.create(dGlue, {
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

    let subShape = Stencil.create(objRect, {
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

    let shape = Stencil.create(myRect, {
      color: 'purple',
      myName: 'root  dRectangle',
      width: 300,
      height: 100
    }).drop(150, 150, 0);

    this.addSubcomponent(shape);
    this.signalR.pubCommand("syncDisp", { guid: shape.myGuid }, shape.asJson);

    let subShape = Stencil.create(dRectangle, {
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
          }).eventCallback("onUpdate", () => {
            shape.drop();
          }).eventCallback("onComplete", () => {
            shape.moveTo(data.x, data.y);
          });
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

      this.signalR.subCommand("syncConcept", (cmd, data) => {
        alert(JSON.stringify(data, undefined, 3));
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


      this.signalR.subCommand("callMethod", (cmd, data) => {
        let func = cmd.func;
        func && this[func](data);
      });


      this.signalR.subCommand("syncDisp", (cmd, data) => {
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

      this.signalR.subCommand("syncGlue", (cmd, data) => {
        let cmdx = cmd;
        this.found(cmd.sourceGuid, (source) => {
          this.found(cmd.targetGuid, (target) => {
            let glue = (<foShape2D>source).createGlue(cmd.sourceHandle, (<foShape2D>target));
            (<foShape2D>target).drop();
          });
        });
      })

    });
  }
}




