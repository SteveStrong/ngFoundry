import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

import { foWorkspace } from "../foundry/foWorkspace.model";
import { foPage } from "../foundry/foPage.model";
import { Sceen2D } from "../foundryDrivers/canvasDriver";

import { SharingService } from "../common/sharing.service";
import { Lifecycle, foLifecycleEvent, Knowcycle } from "../foundry/foLifecycle";
import { BroadcastChange, foChangeEvent } from '../foundry/foChange';
import { RuntimeType } from 'app/foundry/foRuntimeType';

@Component({
  selector: 'foundry-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.css']
})
export class DrawingComponent implements OnInit, AfterViewInit {
  lifecycleEvent: Array<foLifecycleEvent> = new Array<foLifecycleEvent>()
  changeEvent: Array<foChangeEvent> = new Array<foChangeEvent>()


  @ViewChild('canvas')
  public canvasRef: ElementRef;
  @Input()
  public pageWidth = 1400;
  @Input()
  public pageHeight = 1000;

  screen2D: Sceen2D = new Sceen2D();
  currentPage: foPage;

  constructor(
    private sharing: SharingService) {
  }

  doClear() {
    this.currentPage.clearPage();
    this.sharing.clearPage();
  }

  doDelete() {
    this.currentPage.deleteSelected();
  }

  ngOnInit() {
    let max = 25;
    Lifecycle.observable.subscribe(event => {
      this.pushMax(event, max, this.lifecycleEvent);
    });

    Knowcycle.observable.subscribe(event => {
      this.pushMax(event, max, this.lifecycleEvent);
    });

    BroadcastChange.observable.subscribe(event => {
      this.pushMax(event, max, this.changeEvent);
    });

    this.currentPage = new foPage({
      myName: "Page 1",
      width: this.pageWidth,
      height: this.pageHeight,
    });
  }

  pushMax(value, max, array) {
    let length = array.length;
    if (length >= max) {
      array.splice(0, length - max + 1);
    }
    array.push(value);
  }

  doClearlifecycleEvents() {
    this.lifecycleEvent = [];
  }

  doClearChangeEvents() {
    this.changeEvent = [];
  }

  doRefreshRuntimeTypes() {
    Knowcycle.primitive(RuntimeType)
  }

  doRefreshStencil() {
    Knowcycle.defined()
  }


  public ngAfterViewInit() {

    this.currentPage.then(page => {
      this.screen2D.setRoot(this.canvasRef.nativeElement, this.pageWidth, this.pageHeight);

      this.screen2D.render = (ctx: CanvasRenderingContext2D) => {
        ctx.save();
        page.render(ctx);
        ctx.restore();
      }

      this.sharing.startSharing(page);
      this.screen2D.go();
    })
  }

}
