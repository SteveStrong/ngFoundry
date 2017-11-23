import { Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { EmitterService } from '../common/emitter.service';


import { Sceen2D } from "../foundryDrivers/canvasDriver";
import { iShape, iPoint, iSize } from '../foundry/foInterface'

import { PubSub } from "../foundry/foPubSub";
import { cPoint } from "../foundry/foGeometry";
import { Tools } from "../foundry/foTools";

import { foCollection } from "../foundry/foCollection.model";
import { foDictionary } from "../foundry/foDictionary.model";

import { foGlyph,  Pallet } from "../foundry/foGlyph.model";
import { foShape2D, Stencil } from "../foundry/foShape2D.model";
import { rawBrick, door, wall, house, legoCore } from "./shape.custom";


import { Toast } from '../common/emitter.service';
import { SignalRService } from "../common/signalr.service";

//https://greensock.com/docs/TweenMax
import { TweenLite, TweenMax, Back, Power0, Bounce } from "gsap";


@Component({
  selector: 'foundry-stage',
  templateUrl: './stage.component.html'
})
export class StageComponent implements OnInit, AfterViewInit {
  // a reference to the canvas element from our template
  @ViewChild('canvas') public canvasRef: ElementRef;
  @Input() public width = 1000;
  @Input() public height = 800;

  screen2D: Sceen2D = new Sceen2D();

  shapelist: foCollection<foGlyph> = new foCollection<foGlyph>();
  dictionary: foDictionary<foGlyph> = new foDictionary<foGlyph>();

  mouseLoc: any = {};
  sitOnShape: any = {};

  constructor(private signalR: SignalRService) {
  }

 
  findHitShape(loc: iPoint, exclude: foGlyph = null): foGlyph {
    for (var i: number = 0; i < this.shapelist.length; i++) {
      let shape: foGlyph = this.shapelist.getMember(i);
      if (shape != exclude && shape.hitTest(loc)) {
        return shape;
      }
    }
    return null;
  }

  findShapeUnder(source: foGlyph): foGlyph {
    for (var i: number = 0; i < this.shapelist.length; i++) {
      let shape: foGlyph = this.shapelist.getMember(i);
      if (shape != source && source.overlapTest(shape)) {
        return shape;
      }
    }
    return null;
  }

  setupMouseEvents(canvas: HTMLCanvasElement) {

    // Redraw the circle every time the mouse moves

    let shape: foGlyph = null;
    let overshape: foGlyph = null;
    //let mySelf = this;
    let offset: cPoint = null;

    PubSub.Sub('mousedown', (loc: iPoint, e) => {
      shape = this.findHitShape(loc);
      this.dictionary.applyTo(item => {
        item.isSelected = false;
      });

      if (shape) {
        this.shapelist.moveToTop(shape);
        shape.isSelected = true;
        //this.selections.push(shape);
        offset = shape.getOffset(loc);    
      }
      this.mouseLoc = loc;
      //Toast.success(JSON.stringify(loc), "mousedown");
    });

    PubSub.Sub('mousemove', (loc: iPoint, e) => {

      if (shape) {
        shape.doMove(loc, offset);

        if (!overshape) {
          overshape = this.findShapeUnder(shape);
          if (overshape) {
            overshape['hold'] = overshape.getSize(1);
            let size = overshape.getSize(1.1);
            let target = overshape.getSize(1.1);
            size['ease'] = Power0.easeNone;
            size['onComplete'] = () => {
              overshape.setColor('orange');
              overshape.override(target);
            }
            TweenMax.to(overshape, 0.3, size);
          }
        } else if (!overshape.overlapTest(shape)) {
          let target = overshape['hold'];
          let size = overshape['hold'];
          size['ease'] = Power0.easeNone;
          size['onComplete'] = () => {
            overshape.setColor('green');
            overshape.override(target);
            delete overshape['hold'];
            overshape = null;
          }
          TweenLite.to(overshape, 0.3, size);
        }

      }
      this.sitOnShape = overshape || {};
      this.mouseLoc = loc;

    });

    PubSub.Sub('mouseup', (loc: iPoint, e) => {
      if (!shape) return;

      this.shapelist.moveToTop(shape);
      let drop = shape.getLocation();
      drop['myGuid'] = shape['myGuid'];
      shape = null;
      //Toast.success(JSON.stringify(loc), "mouseup");
      this.signalR.pubChannel("move", drop);
    });

  }

  private createGlyph(init?: any): foGlyph {
    let base = {
      x: 50,
      y: 50,
      width: 200,
      height: 100
    }
    let shape = new foGlyph(Tools.union(base, init));
    return shape;
  }

  private addToModel(shape: foGlyph) {
    this.dictionary.findItem(shape.myGuid, () => {
      this.dictionary.addItem(shape.myGuid, shape);
      this.shapelist.addMember(shape);
    });
  }

  doAddShape() {
    let shape = this.createGlyph({
      x: 150,
      y: 100,
      height: 150,
      width: 200,
    });
    this.addToModel(shape);


    let subshape = this.createGlyph({
      color: 'blue',
      x: 450,
      y: 100,
      height: 50,
      width: 300,
    });
    shape.addSubcomponent(subshape);


    let json = shape.asJson;
    //Toast.success(JSON.stringify(json), "add shape");
    this.signalR.pubChannel("addShape", json);
  }

  doAddHouse() {
    let shape = Stencil.create(house, {
      color: 'green',
      x: 50,
      y: 50,
      height: 150,
      width: 300,
    });
    this.addToModel(shape);

    let subshape1 = Stencil.create(wall, {
      color: 'blue',
      height: 125,
      width: 75, 
    });
    shape.addSubcomponent(subshape1);

    let subshape2 = Stencil.create(wall, {
      color: 'black',
      height: 25,
      width: 25, 
      y: 50,
    });
    shape.addSubcomponent(subshape2);


    let json = shape.asJson;
    //Toast.success(JSON.stringify(json), "add shape");
    this.signalR.pubChannel("addShape", json);
  }

  public ngAfterViewInit() {

    let canvas = this.screen2D.setRoot(this.canvasRef.nativeElement, this.width, this.height);
    // we'll implement this method to start capturing mouse events
    this.setupMouseEvents(canvas);

    this.screen2D.render = (context: CanvasRenderingContext2D) => {
      context.fillStyle = "yellow";
      context.fillRect(0, 0, this.width, this.height);

      this.drawGrid(context);

      this.shapelist.forEach(item => item.render(context));
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

      this.signalR.subChannel("addShape", json => {
        console.log(json);
        this.dictionary.findItem(json.myGuid, () => {
          let shape = this.createGlyph(json);
          this.addToModel(shape);
        });
      });

    });
  }

  drawGrid(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'gray';
    //ctx.lineWidth = 0;

    let size = 50;
    //draw vertical...
    for (var i = 0; i < this.width; i += size) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, this.height);
    }

    //draw horizontal...
    for (var i = 0; i < this.height; i += size) {
      ctx.moveTo(0, i);
      ctx.lineTo(this.width, i);
    }


    ctx.stroke();
    ctx.restore();
  }

  ngOnInit() {
  }


}




