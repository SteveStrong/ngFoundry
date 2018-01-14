import { Component, Input, OnInit, AfterViewInit, ViewContainerRef, ElementRef, ViewChild, HostListener } from '@angular/core';

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";
import { foPage } from "../foundry/foPage.model";
import { foModel } from "../foundry/foModel.model";

import { Screen2D } from "../foundryDrivers/canvasDriver";
import { BroadcastChange } from '../foundry/foChange';

import { cPoint } from "../foundry/foGeometry";
import { foGlyph } from "../foundry/foGlyph.model";

import { SharingService } from "../common/sharing.service";
import { Lifecycle, foLifecycleEvent, Knowcycle } from "../foundry/foLifecycle";
import { foChangeEvent } from '../foundry/foChange';

import { foDocument } from 'app/foundry/foDocument.model';


import { ParticleStencil, foShape2D } from "./particle.model";
import { ShapeStencil } from "./shapes.model";
import { PersonDomain } from "./domain.model";
import { foObject } from 'app/foundry/foObject.model';


@Component({
  selector: 'foundry-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.css']
})
export class DrawingComponent implements OnInit, AfterViewInit {
  label: string = 'Off';
  lifecycleEvent: Array<foLifecycleEvent> = new Array<foLifecycleEvent>()
  changeEvent: Array<foChangeEvent> = new Array<foChangeEvent>()

  rootWorkspace: foWorkspace = globalWorkspace.defaultName();

  @ViewChild('canvas')
  public canvasRef: ElementRef;
  @Input()
  public pageWidth = 1400;
  @Input()
  public pageHeight = 1000;

  screen2D: Screen2D = new Screen2D();
  currentDocument: foDocument;

  //https://stackoverflow.com/questions/37362488/how-can-i-listen-for-keypress-event-on-the-whole-page
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    alert(event.key);
  }

  constructor(
    private sharing: SharingService) {
  }

  doClear() {
    this.currentDocument.currentPage.clearPage();
    this.sharing.clearPage();
  }

  doDelete() {
    this.currentDocument.currentPage.deleteSelected();
  }

  doOnOff() {
    this.label = this.screen2D.toggleOnOff() ? "On" : "Off"
  }

  doParticleEngine(page: foPage) {

    ParticleStencil.find<foShape2D>('engine')
      .newInstance().defaultName()
      .dropAt(500, 500).addAsSubcomponent(page)
      .then(item => {
        item.doStart();
      });
  }

  doSubShape(page: foPage) {

    let result = ShapeStencil.factories.getItem('doAddSubGlyph').run();
    result.addAsSubcomponent(page)
  }



  ngOnInit() {
    this.currentDocument = this.rootWorkspace.document.override({
      pageWidth: this.pageWidth,
      pageHeight: this.pageHeight,
    });



    this.currentDocument.currentPage
      .then(page => {
        //this.doParticleEngine(page);
        //this.doSubShape(page);
      });

    Lifecycle.observable.subscribe(event => {
      console.log(event.id, event.cmd, event.myGuid, JSON.stringify(event.value));
    })

    let libs = this.rootWorkspace.stencil;
    libs.add(ParticleStencil).displayName = "Particle";
    libs.add(ShapeStencil).displayName = "Shape";

    this.rootWorkspace.library.add(PersonDomain);
    this.rootWorkspace.model.addItem('default', new foModel({}))
  }


  doAddPage() {
    this.currentDocument.createPage();
  }

  doDeletePage() {

  }

  doGoToPage(page: foPage) {
    this.currentDocument.currentPage = page;
  }



  doSetCurrentPage(page: foPage) {

    this.screen2D.clear();
    //with the render function you could
    //1) render a single page
    //2) render pages like layers
    //3) render pages side by side
    this.screen2D.render = (ctx: CanvasRenderingContext2D) => {
      page.render(ctx);
    }
    this.screen2D.go();

    this.addEventHooks(page);
  }

  public ngAfterViewInit() {

    this.screen2D.setRoot(this.canvasRef.nativeElement, this.pageWidth, this.pageHeight);
    this.sharing.startSharing();

    BroadcastChange.observable.subscribe(item => {
      if ( item.isCmd('currentPage')) {
        this.doSetCurrentPage(this.currentDocument.currentPage);
      }
    });
    
    this.doSetCurrentPage(this.currentDocument.currentPage);

  }

  addEventHooks(page: foPage) {

    page.onItemHoverEnter = (loc: cPoint, shape: foGlyph, keys?: any): void => {
      if (shape) {
        shape.drawHover = function (ctx: CanvasRenderingContext2D) {
          ctx.strokeStyle = "yellow";
          ctx.lineWidth = 4;
          shape.drawOutline(ctx);
        }
      }
    }

    page.onItemHoverExit = (loc: cPoint, shape: foGlyph, keys?: any): void => {
      if (shape) {
        shape.drawHover = undefined;
      }
    }

    page.onItemOverlapEnter = (loc: cPoint, shape: foGlyph, shapeUnder: foGlyph, keys?: any): void => {

      if (shapeUnder) {
        shapeUnder.drawHover = function (ctx: CanvasRenderingContext2D) {
          ctx.strokeStyle = "green";
          ctx.lineWidth = 8;
          shapeUnder.drawOutline(ctx);
          ctx.strokeStyle = "yellow";
          ctx.lineWidth = 4;
          shapeUnder.drawOutline(ctx);
        }
      }
    }

    page.onItemOverlapExit = (loc: cPoint, shape: foGlyph, shapeUnder: foGlyph, keys?: any): void => {

      if (shapeUnder) {
        shapeUnder.drawHover = undefined;
      }
    }

  }

}
