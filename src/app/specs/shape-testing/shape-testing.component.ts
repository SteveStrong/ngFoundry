import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'fo-shape-testing',
  templateUrl: './shape-testing.component.html'
})
export class ShapeTestingComponent implements OnInit, AfterViewInit {

  @ViewChild('canvas')
  public canvasRef: ElementRef;

  @Input()
  public pageWidth = 1400;
  @Input()
  public pageHeight = 800;

  constructor() { }

  ngOnInit() {
    let canvas = this.canvasRef.nativeElement;

    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(20, 20, 50, 100);
  }

  public ngAfterViewInit() {



  }

}
