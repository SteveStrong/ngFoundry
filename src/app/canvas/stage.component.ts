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

  screen2D: Sceen2D = new Sceen2D();


  constructor(private signalR: SignalRService) {
    super();
  }

  doClear() {
    this.clearAll();
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

  doCreateLego<T extends foShape2D>(type: { new(p?: any): T; }, properties?: any): T {
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
    let props = Tools.union(properties, compute)

    let instance = Stencil.create(type, props);
    return instance;
  }

  ngOnInit() {
    this.onItemChangedParent = (shape: foGlyph): void => {
      this.signalR.pubChannel("move", shape);
    }
    this.onItemChangedPosition = (shape: foGlyph): void => {
      this.signalR.pubChannel("move", shape);
    }
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
    let shape = this.doCreateLego(OneByOne, {
      color: 'black',
      name: OneByOne.typeName()
    });
    this.addToModel(shape);
    this.signalR.pubChannel("addShape", shape.asJson);
  }

  doAddTwoByOne() {
    let shape = this.doCreateLego(TwoByOne, {
      color: 'orange',
      name: TwoByOne.typeName()
    });
    this.addToModel(shape);
    this.signalR.pubChannel("addShape", shape.asJson);
  }

  doAddTwoByTwo() {
    let shape = this.doCreateLego(TwoByTwo, {
      color: 'pink',
      name: TwoByTwo.typeName()
    });
    this.addToModel(shape);
    this.signalR.pubChannel("addShape", shape.asJson);
  }

  doAddTwoByFour() {
    let shape = this.doCreateLego(TwoByFour, {
      color: 'green',
      angle: 45,
      name: TwoByFour.typeName()
    }).drop({
      x: 300,
      y: 300
    });

    this.addToModel(shape);
    this.signalR.pubChannel("addShape", shape.asJson);

    // setInterval( () => {
    //   let angle = shape.angle + 10;
    //   angle = angle >= 360 ? 0 : angle;
    //   shape.angle = angle;
    // }, 20);
  }

  doAddOneByTen() {
    let shape = Stencil.create(OneByTen, {
      color: 'white',
      height: 10,
      width: function (): number { return this.height / 4; }
    }).drop({
      x: 500,
      y: 500
    });
    this.addToModel(shape);
    this.signalR.pubChannel("addShape", shape.asJson);

    setInterval(() => {
      let angle = shape.height + 10;
      angle = angle >= 360 ? 0 : angle;
      shape.height = angle;
      shape.angle = angle;

    }, 20);
  }

  doAddTenByTen() {
    let shape = this.doCreateLego(TenByTen, {
      color: 'gray',
      name: TenByTen.typeName()
    }).drop({
      x: 600,
      y: 300
    });
    this.addToModel(shape);
    this.signalR.pubChannel("addShape", shape.asJson);
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

    let shape = this.doCreateLego(TenByTen, {
      opacity: .5,
      color: 'gray',
      angle: 0,
      name: TenByTen.typeName()
    }).drop({
      x: 600,
      y: 300
    });
    this.addToModel(shape);

    let subShape = this.doCreateLego(TwoByFour, {
      color: 'red',
      // typeName: TwoByFour.typeName(),
      // postDraw: function(ctx) { 
      //   this.drawPin(ctx);
      // }
    }).addAsSubcomponent(shape).drop({
      x: function () { return -shape.width / 4; },
      y: 150,
      angle: 0,
    });

    this.signalR.pubChannel("addShape", shape.asJson);

    // setInterval(() => {
    //   let width = subShape.width + 10;
    //   width = width >= 360 ? 0 : width;
    //   subShape.width = width;
    // }, 200);

    setInterval(() => {
      let angle = subShape.angle + 10;
      angle = angle >= 360 ? 0 : angle;
      subShape.angle = angle;
      //subShape.width = angle;
    }, 20);
  }

  add(shape: foShape2D): foShape2D {
    return this.addToModel(shape) as foShape2D;
  }
  doAddrotateDemo() {
    let shape = this.add(this.doCreateLego(rotateDemo, {
      color: 'white',
    })).drop({
      x: 500,
      y: 500
    });



    this.signalR.pubChannel("addShape", shape.asJson);
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

      this.signalR.subChannel("move", data => {
        this.found(data.myGuid, shape => {
          let loc = <iPoint>data;
          //console.log(loc);

          //shape.setLocation(loc);
          //loc['opacity'] = 0.5;
          loc['ease'] = Back.easeOut;
          //Toast.info(JSON.stringify(loc), "move");
          //TweenLite.to(shape, .8, loc);
        });
      });

      this.signalR.subChannel("addGlyph", json => {
        //console.log(json);
        this.findItem(json.myGuid, () => {
          Pallet.create(foGlyph, json, this.addToModel.bind(this));
        });
      });

      this.signalR.subChannel("addShape", json => {
        //console.log(json);
        this.findItem(json.myGuid, () => {
          let shape = Stencil.create(foShape2D, json);
          this.addToModel(shape);
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
      });

    });
  }
}




