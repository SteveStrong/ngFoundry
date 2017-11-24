import { Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { EmitterService } from '../common/emitter.service';


import { Sceen2D } from "../foundryDrivers/canvasDriver";
import { iShape, iPoint, iSize } from '../foundry/foInterface'

import { PubSub } from "../foundry/foPubSub";
import { cPoint } from "../foundry/foGeometry";
import { Tools } from "../foundry/foTools";

import { foCollection } from "../foundry/foCollection.model";
import { foDictionary } from "../foundry/foDictionary.model";

import { foPage } from "../foundry/foPage.model";

import { foGlyph, Pallet } from "../foundry/foGlyph.model";
import { foShape2D, Stencil } from "../foundry/foShape2D.model";
import { legoCore, brick, OneByOne, TwoByOne, TwoByTwo, TwoByFour, OneByTen, TenByTen } from "./shape.custom";


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


  doDelete() {
    let found = this.shapelist.filter(item => { return item.isSelected; })[0];
    if (found) {
      this.removeFromModel(found);
    }
  }

  doDuplicate() {
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

  doAddOneByOne() {
    let shape = this.doCreateLego(OneByOne, {
      color: 'black',
      size: '1:1',
      name: OneByOne.typeName()
    });
    this.addToModel(shape);
    this.signalR.pubChannel("addShape", shape.asJson);
  }

  doAddTwoByOne() {
    let shape = this.doCreateLego(TwoByOne, {
      color: 'orange',
      size: '2:1',
      name: TwoByOne.typeName()
    });
    this.addToModel(shape);
    this.signalR.pubChannel("addShape", shape.asJson);
  }

  doAddTwoByTwo() {
    let shape = this.doCreateLego(TwoByTwo, {
      color: 'pink',
      size: '2:2',
      name: TwoByTwo.typeName()
    });
    this.addToModel(shape);
    this.signalR.pubChannel("addShape", shape.asJson);
  }

  doAddTwoByFour() {
    let shape = this.doCreateLego(TwoByFour, {
      color: 'green',
      size: '2:4',
      name: TwoByFour.typeName()
    });
    this.addToModel(shape);
    this.signalR.pubChannel("addShape", shape.asJson);
  }

  doAddOneByTen() {
    let shape = this.doCreateLego(OneByTen, {
      color: 'white',
      size: '1:10',
      name: OneByTen.typeName()
    });
    this.addToModel(shape);
    this.signalR.pubChannel("addShape", shape.asJson);
  }

  doAddTenByTen() {
    let shape = this.doCreateLego(TenByTen, {
      color: 'gray',
      size: '10:10',
      name: TenByTen.typeName()
    });
    this.addToModel(shape);
    this.signalR.pubChannel("addShape", shape.asJson);
  }

  doAddStack() {
    let shape = this.doCreateLego(TenByTen, {
      opacity: .5,
      color: 'gray',
      size: '10:10',
      name: TenByTen.typeName()
    });
    this.addToModel(shape);

    let subShape = this.doCreateLego(TwoByFour, {
      color: 'red',
      size: '2:4',
      name: TwoByFour.typeName()
    }).addAsSubcomponent(shape).drop({
      x: 50,
      y: 50,
      angle: 30
    });

    this.signalR.pubChannel("addShape", shape.asJson);
  }

  public ngAfterViewInit() {

    let canvas = this.screen2D.setRoot(this.canvasRef.nativeElement, this.width, this.height);

    this.screen2D.render = (context: CanvasRenderingContext2D) => {
      context.fillStyle = "yellow";
      context.fillRect(0, 0, this.width, this.height);

      this.render(context);
    }

    this.screen2D.go();

    this.signalR.start().then(() => {

      this.signalR.subChannel("move", data => {
        this.dictionary.found(data.myGuid, shape => {
          let loc = <iPoint>data;
          console.log(loc);

          //shape.setLocation(loc);
          //loc['opacity'] = 0.5;
          loc['ease'] = Back.easeOut;
          //Toast.info(JSON.stringify(loc), "move");
          TweenLite.to(shape, .8, loc);
        });


      });

      this.signalR.subChannel("addGlyph", json => {
        console.log(json);
        this.dictionary.findItem(json.myGuid, () => {
          Pallet.create(foGlyph, json);
        });
      });

    });
  }
}




