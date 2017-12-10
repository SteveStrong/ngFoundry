import { Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { EmitterService } from '../common/emitter.service';


import { Sceen2D } from "../foundryDrivers/canvasDriver";
import { iShape, iPoint, iSize } from '../foundry/foInterface'

import { PubSub } from "../foundry/foPubSub";
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

  doCreateDisplay<T extends foDisplayObject>(type: { new(p?: any): T; }, properties?: any): T {
    let instance = Display.create(type, properties);
    return instance;
  }


  ngOnInit() {
    this.onItemChangedParent = (shape: foGlyph): void => {
      this.signalR.pubChannel("parent", shape.asJson);
    }
    this.onItemChangedPosition = (shape: foGlyph): void => {
      this.signalR.pubChannel("moveShape", shape.asJson);
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
    };

    Stencil.define(OneByOne, compute);

    Stencil.define(OneByOne, compute);
    Stencil.define(TwoByOne, compute);
    Stencil.define(TwoByTwo, compute);
    Stencil.define(TwoByFour, compute);
    Stencil.define(OneByTen, compute);
    Stencil.define(TenByTen, compute);
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
      x: 150,
      y: 100,
      height: 150,
      width: 200,
    }, this.addToModel.bind(this));
    this.signalR.pubChannel("addGlyph", shape.asJson);
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

  doAddRectangle() {

    let shape = this.doCreateDisplay(dRectangle, {
      color: 'black',
      x: 200,
      y: 150,
      width: 300,
      height: 100
    });
    this.addToModel(shape);

    let subShape = this.doCreateDisplay(dRectangle, {
      color: 'blue',
      x: 150,
      y: 150,
      width: 30,
      height: 100
    }); //.addAsSubcomponent(shape);
    this.addToModel(subShape);

    this.signalR.pubChannel("addDisp", shape.asJson);
  }


  doAddOneByOne() {
    let shape = Stencil.create(OneByOne, {
      color: 'black',
      name: OneByOne.typeName()
    });
    this.addToModel(shape);
    this.signalR.pubChannel("syncShape", shape.asJson);
  }

  doAddTwoByOne() {
    let shape = Stencil.create(TwoByOne, {
      color: 'orange',
      name: TwoByOne.typeName()
    });
    this.addToModel(shape);
    this.signalR.pubChannel("syncShape", shape.asJson);
  }

  doAddTwoByTwo() {
    let shape = Stencil.create(TwoByTwo, {
      color: 'pink',
      name: TwoByTwo.typeName()
    });
    this.addToModel(shape);
    this.signalR.pubChannel("syncShape", shape.asJson);
  }

  doAddTwoByFour() {
    let shape = Stencil.create(TwoByFour, {
      color: 'green',
      angle: 45,
      name: TwoByFour.typeName()
    }).drop({
      x: 300,
      y: 300
    });

    this.addToModel(shape);
    this.signalR.pubChannel("syncShape", shape.asJson);

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
    }).drop({
      x: 500,
      y: 500
    });
    this.addToModel(shape);
    this.signalR.pubChannel("syncShape", shape.asJson);

  }

  doAddTenByTen() {
    let shape = Stencil.create(TenByTen, {
      color: 'gray',
      name: TenByTen.typeName()
    }).drop({
      x: 600,
      y: 300
    });
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
    }).drop({
      x: 600,
      y: 300
    });
    this.addToModel(shape);

    this.signalR.pubChannel("syncShape", shape.asJson);

    let subShape = Stencil.create(TwoByFour, {
      color: 'red',
    }).addAsSubcomponent(shape).drop({
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
    })).drop({
      x: 500,
      y: 500
    });



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

      this.signalR.subChannel("moveShape", data => {
        this.found(data.myGuid, shape => {
          TweenLite.to(shape, .8, {
            x: data.x,
            y: data.y,
            ease: Back.easeInOut
          }).eventCallback("onComplete", () => { shape.override({}) });
        });
      });

      this.signalR.subChannel("addGlyph", json => {
        //console.log(json);
        this.findItem(json.myGuid, () => {
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
          shape.removeFromParent();
          if (json.parentGuid) {
            this.found(json.parentGuid, (item) => {
              item.addSubcomponent(shape,{x: json.x, y: json.y});
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

    });
  }
}




