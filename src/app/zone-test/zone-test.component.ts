import { Component, NgZone, ViewChild, Input, ElementRef, OnInit, AfterViewInit } from '@angular/core';

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";

import { ParticleStencil, foShape2D } from "../canvas/particle.model";


@Component({
  selector: 'fo-zone-test',
  templateUrl: './zone-test.component.html',
  styleUrls: ['./zone-test.component.css']
})
export class ZoneTestComponent implements OnInit, AfterViewInit {
  workspace: foWorkspace = globalWorkspace.defaultName();
  @ViewChild('canvas')
  public canvasRef: ElementRef;
  @Input()
  public pageWidth = 1400;
  @Input()
  public pageHeight = 1000;




  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  progress: number = 0;
  maxProgress: number = 1000;
  label: string;

  constructor(private _ngZone: NgZone) { }

  ngOnInit() {
    let doc = this.workspace.document.override({
      pageWidth: this.pageWidth,
      pageHeight: this.pageHeight,
    });


    ParticleStencil.find<foShape2D>('engine')
      .newInstance({
        particleCount: 1000,
      }).defaultName()
      .dropAt(500, 500).addAsSubcomponent(doc.currentPage)
      .then(item => {
        item.doStart();
      });
  }

  public ngAfterViewInit() {

    this.canvas = this.canvasRef.nativeElement;
    this.context = this.canvas.getContext("2d");

    // set the width and height
    this.canvas.width = this.pageWidth;
    this.canvas.height = this.pageHeight;
  }



  // Loop inside the Angular zone
  // so the UI DOES refresh after each setTimeout cycle
  processWithinAngularZone() {
    this.label = 'inside';
    this.progress = 0;

    let page = this.workspace.document.currentPage;
    let last: any = 0;
    let context = this.context;
    let requestAnimation = window.requestAnimationFrame || window.webkitRequestAnimationFrame; // || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;;
    let cancelAnimation = window.cancelAnimationFrame; // || window.mozCancelAnimationFrame;


    function doAnimate() {
      page.render(context);
      last = requestAnimation(doAnimate);
    }

    doAnimate();
    this._increaseProgress(() => {
      cancelAnimation(last)
      console.log('Inside Done!');
    });
  }

  // Loop outside of the Angular zone
  // so the UI DOES NOT refresh after each setTimeout cycle
  processOutsideOfAngularZone() {
    this.label = 'outside';
    this.progress = 0;

    let page = this.workspace.document.currentPage;
    let last: any = 0;
    let context = this.context;
    let requestAnimation = window.requestAnimationFrame || window.webkitRequestAnimationFrame; // || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;;
    let cancelAnimation = window.cancelAnimationFrame; // || window.mozCancelAnimationFrame;


    function doAnimate() {
      page.render(context);
      last = requestAnimation(doAnimate);
    }

    this._ngZone.runOutsideAngular(() => {

      doAnimate();
      this._increaseProgress(() => {
        // reenter the Angular zone and display done
        this._ngZone.run(() => {
          cancelAnimation(last)
          console.log('Outside Done!');
        });
      });
    });
  }

  _increaseProgress(doneCallback: () => void) {
    this.progress += 1;
    //console.log(`Current progress: ${this.progress}%`);

    if (this.progress < this.maxProgress) {
      window.setTimeout(() => this._increaseProgress(doneCallback), 10);
    } else {
      doneCallback();
    }
  }
}
