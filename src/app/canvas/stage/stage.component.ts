import { Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';

import { iShape } from "./shape";
import { cPoint } from "./point";
import { cCircle } from "./circle";
import { cRectangle } from "./rectangle";
import { cAsteroid } from "./asteroid";
import { cTriangle } from "./triangle";
import { cText } from "./text";
import { cClock } from "./clock";

function doAnimate(mySelf) {
  function animate() {
    requestAnimationFrame(animate);
    mySelf.draw(mySelf.context);
  }
  animate();
}


@Component({
  selector: 'foundry-stage',
  templateUrl: './stage.component.html',
  styleUrls: ['./stage.component.css']
})
export class StageComponent implements OnInit, AfterViewInit {
  // a reference to the canvas element from our template
  @ViewChild('canvas') public canvasRef: ElementRef;
  @Input() public width = 1000;
  @Input() public height = 800;

  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  shapes: Array<iShape> = new Array<iShape>();


  constructor() { }

  findHitShape(x: number, y: number): iShape {
    for (var i: number = 0; i < this.shapes.length; i++) {
      let shape: iShape = this.shapes[i];
      if (shape.hitTest(x, y)) {
        return shape
      }
    }
    return null;
  }

  setupMouseEvents(canvas: HTMLCanvasElement) {

    // Redraw the circle every time the mouse moves

    function getMousePos(evt) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }

    let shape: iShape = null;
    let mySelf = this;
    let offset: cPoint = new cPoint();

    canvas.addEventListener('mousedown', function (e) {
      let loc = getMousePos(e);
      shape = mySelf.findHitShape(loc.x, loc.y);
      if (!shape) return;
      shape.isSelected = true;
      offset.x = shape.x - loc.x;
      offset.y = shape.y - loc.y;
    });

    canvas.addEventListener('mousemove', function (e) {
      let loc = getMousePos(e);
      if (shape) {
        shape.x = loc.x + offset.x;
        shape.y = loc.y + offset.y;
      }
      let overshape = mySelf.findHitShape(loc.x, loc.y);
      if (overshape) {
        overshape.drawHover(mySelf.context);
      }
    });

    canvas.addEventListener('mouseup', function (e) {
      if (shape) {
        shape.isSelected = false;
      }
      shape = null;
    });

  }


  public ngAfterViewInit() {
    // get the context
    this.canvas = this.canvasRef.nativeElement;
    this.context = this.canvas.getContext("2d");

    // set the width and height
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // set some default properties about the line
    this.context.lineWidth = 3;
    this.context.lineCap = 'round';
    this.context.strokeStyle = '#000';

    // we'll implement this method to start capturing mouse events
    this.setupMouseEvents(this.canvas);

    this.go();
  }

  ngOnInit() {
    //this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
    var list = this.shapes;
    // list.push(new cAsteroid());
    // list.push(new cAsteroid());
    // list.push(new cAsteroid());
    // list.push(new cAsteroid());
    // list.push(new cAsteroid());

    //list.push(new cTriangle(20, 50, 500, 500));

    list.push(new cCircle(20, 50, 30));
    list.push(new cCircle(120, 70, 50));

    list.push(new cText(20, 50, "Steve"));
    //list.push(new cClock(320, 50));

    list.push(new cRectangle(500, 500, 80, 60));
  }

  go() {
    doAnimate(this);
  }

  draw(ctx: CanvasRenderingContext2D) {

    ctx.fillStyle = "yellow";
    ctx.fillRect(0, 0, 1280, 720);

    for (var i: number = 0; i < this.shapes.length; i++) {
      let shape: iShape = this.shapes[i];
      shape.draw(ctx);
    }

  }

}




