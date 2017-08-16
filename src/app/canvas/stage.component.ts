import { Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { EmitterService } from '../common/emitter.service';

import { iShape, iPoint } from "./shape";
import { cPoint } from "./point";
import { cCircle } from "./circle";
import { cRectangle } from "./rectangle";
import { cAsteroid } from "./asteroid";
import { cTriangle } from "./triangle";
import { cText } from "./text";
import { cClock } from "./clock";

import { Sceen2D } from "../foundryDrivers/canvasDriver";
import { shapeManager } from "./shapeManager";
import { selectionManager } from "./selectionManager";
import { PubSub } from "../foundry/foPubSub";



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

  constructor() {
  }

  findHitShape(loc:iPoint): iShape {
    for (var i: number = 0; i < this.shapes.length; i++) {
      let shape: iShape = this.shapes[i];
      if (shape.hitTest(loc)) {
        return shape
      }
    }
    return null;
  }

  setupMouseEvents(canvas: HTMLCanvasElement) {

    // Redraw the circle every time the mouse moves

    let shape: iShape = null;
    let mySelf = this;
    let offset: cPoint = null;

    PubSub.Sub('mousedown', (loc:iPoint, e) => {
      shape = mySelf.findHitShape(loc);
      if (shape) {
        shape.isSelected = true;
        mySelf.selections.push(shape);
        offset = shape.getOffset(loc);
      } else {
        let found = mySelf.selections.pop();
        found.isSelected = false;
      }

      let toast = {
        title: "Dockerecosystem Service",
        message: JSON.stringify(loc)
      }
      EmitterService.get("SHOWERROR").emit(toast);
    });

    PubSub.Sub('mousemove', (loc:iPoint, e) => {
      if (shape) {
        shape.doMove(loc, offset);
      }
      let overshape = mySelf.findHitShape(loc);
      if (overshape) {
        //overshape.drawHover(mySelf.context);
      }
    });

    PubSub.Sub('mouseup', (loc:iPoint, e) => {
      shape = null;
    });

  }


  public ngAfterViewInit() {

    let canvas = this.screen2D.setRoot(this.canvasRef.nativeElement, this.width, this.height);
    // we'll implement this method to start capturing mouse events
    this.setupMouseEvents(canvas);

    this.screen2D.render = (context: CanvasRenderingContext2D) => {
      context.fillStyle = "yellow";
      context.fillRect(0, 0, 1280, 720);

      for (var i: number = 0; i < this.shapes.length; i++) {
        let shape: iShape = this.shapes[i];
        shape.draw(context);
      }
    }

    this.screen2D.go();
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
    list.push(new cRectangle(400, 200, 180, 60));
    list.push(new cRectangle(100, 50, 80, 60));
    list.push(new cRectangle(300, 300, 120, 60));
    list.push(new cRectangle(500, 500, 80, 60));
  }


}




