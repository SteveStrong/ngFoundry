import { Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { EmitterService } from '../common/emitter.service';

import { iShape, iPoint } from "./shape";
import { cPoint } from "./point";
import { cCircle } from "./circle";
//import { cRectangle } from "./crectangle";
import { cAsteroid } from "./asteroid";
import { cTriangle } from "./triangle";
import { cText } from "./text";
import { cClock } from "./clock";

import { Sceen2D } from "../foundryDrivers/canvasDriver";
import { shapeManager } from "./shapeManager";
import { selectionManager } from "./selectionManager";
import { PubSub } from "../foundry/foPubSub";
import { foShape } from "./shape.model";

import { Toast } from '../common/emitter.service';
import { SignalRService } from "../common/signalr.service";


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
  shapeManager: shapeManager = new shapeManager();
  selectionManager: selectionManager = new selectionManager();

  shapes: Array<iShape> = new Array<iShape>();
  selections: Array<iShape> = new Array<iShape>();


  model = [this.shapes];

  constructor(private signalR: SignalRService) {
  }

  findHitShape(loc: iPoint): iShape {
    for (var i: number = 0; i < this.shapes.length; i++) {
      let shape: iShape = this.shapes[i];
      if (shape.hitTest(loc)) {
        return shape;
      }
    }
    return null;
  }

  setupMouseEvents(canvas: HTMLCanvasElement) {

    // Redraw the circle every time the mouse moves

    let shape: iShape = null;
    let mySelf = this;
    let offset: cPoint = null;

    PubSub.Sub('mousedown', (loc: iPoint, e) => {
      shape = mySelf.findHitShape(loc);
      if (shape) {
        shape.isSelected = true;
        mySelf.selections.push(shape);
        offset = shape.getOffset(loc);
      } else {
        let found = mySelf.selections.pop();
        if (found) {
          found.isSelected = false;
        }

      }

      //Toast.success(JSON.stringify(loc), "mousedown");
    });

    PubSub.Sub('mousemove', (loc: iPoint, e) => {
      if (shape) {
        shape.doMove(loc, offset);
      }
      let overshape = mySelf.findHitShape(loc);
      if (overshape) {
        //overshape.drawHover(mySelf.context);
      }
    });

    PubSub.Sub('mouseup', (loc: iPoint, e) => {
      let drop = shape.getLocation();
      shape = null;
      Toast.success(JSON.stringify(loc), "mouseup");
      this.signalR.pubChannel("move", JSON.stringify(drop));
    });

  }


  public ngAfterViewInit() {



    let canvas = this.screen2D.setRoot(this.canvasRef.nativeElement, this.width, this.height);
    // we'll implement this method to start capturing mouse events
    this.setupMouseEvents(canvas);

    this.screen2D.render = (context: CanvasRenderingContext2D) => {
      context.fillStyle = "yellow";
      context.fillRect(0, 0, this.width, this.height);

      this.drawGrid(context);
      for (var i: number = 0; i < this.shapes.length; i++) {
        let shape: iShape = this.shapes[i];
        shape.draw(context);
      }
    }

    this.screen2D.go();

    this.signalR.start().then( () => {
      this.signalR.subChannel("move", data => {
        let shape: iShape = this.shapes[0];

        let xxx = JSON.parse(data)
        let loc = <iPoint>JSON.parse(xxx);
        console.log(loc);
       

        shape.setLocation(loc);
        Toast.info(JSON.stringify(loc), "move");
        this.screen2D.go();
        
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
    var list = this.shapes;
    // list.push(new cAsteroid());
    // list.push(new cAsteroid());
    // list.push(new cAsteroid());
    // list.push(new cAsteroid());
    // list.push(new cAsteroid());

    //list.push(new cTriangle(20, 50, 500, 500));

    // list.push(new cCircle(20, 50, 30));
    // list.push(new cCircle(120, 70, 50));

    // list.push(new cText(20, 50, "Steve"));
    // //list.push(new cClock(320, 50));
    list.push(new foShape({
      _x: 20,
      _y: 10,
      _width: 190,
      _height: 100
    }));

    // list.push(new cRectangle(400, 200, 180, 60));
    // list.push(new cRectangle(100, 50, 80, 60));
    // list.push(new cRectangle(300, 300, 120, 60));
    // list.push(new cRectangle(500, 500, 80, 60));


  }


}




