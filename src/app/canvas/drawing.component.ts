import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

import { foWorkspace } from "../foundry/foWorkspace.model";
import { foPage } from "../foundry/foPage.model";
import { Sceen2D } from "../foundryDrivers/canvasDriver";

import { SharingService } from "../common/sharing.service";
import { Lifecycle, foLifecycleEvent, Knowcycle } from "../foundry/foLifecycle";
import { BroadcastChange, foChangeEvent } from '../foundry/foChange';
import { RuntimeType } from 'app/foundry/foRuntimeType';
import { foDocument } from 'app/foundry/foDocument.model';


import { Stencil } from "../foundry/foStencil";
import { foGlyph } from "../foundry/foGlyph.model";
import { particleEngine } from "./particle.model";

@Component({
  selector: 'foundry-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.css']
})
export class DrawingComponent implements OnInit, AfterViewInit {
  label:string = '';
  lifecycleEvent: Array<foLifecycleEvent> = new Array<foLifecycleEvent>()
  changeEvent: Array<foChangeEvent> = new Array<foChangeEvent>()

  rootWorkspace: foWorkspace = new foWorkspace({
    myName: 'The workspace manages the user', //, their models and documents'
  })

  @ViewChild('canvas')
  public canvasRef: ElementRef;
  @Input()
  public pageWidth = 1400;
  @Input()
  public pageHeight = 1000;

  screen2D: Sceen2D = new Sceen2D();
  currentDocument: foDocument;
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

  doOnOff() {
    this.label = this.screen2D.toggleOnOff()? "On" : "Off"
  }

  doParticleEngine(page: foPage) {

    let def = Stencil.define<foGlyph>('particle', particleEngine, {
      color: 'white',
      particleCount: 100,
      opacity: .1,
      width: 700,
      height: 700,
    }).addCommands("doStart", "doStop", "doRotate");


    let shape = def.newInstance();

    shape.dropAt(500, 500).addAsSubcomponent(page)
      .then(item => {
        item.doStart();
      });
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

    this.currentDocument = this.rootWorkspace.document;
    this.currentPage = this.currentDocument.createPage({
      width: this.pageWidth,
      height: this.pageHeight,
    }).then(page => {
      this.doParticleEngine(page);
    });
  }

  doAddPage() {
    let page = this.currentDocument.createPage();
    this.doGoToPage(page);
  }

  doDeletePage() {

  }

  doGoToPage(page:foPage) {
    this.currentPage = page;
    this.doSetCurrentPage(this.currentPage);
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

  doSetCurrentPage(page: foPage) {

    this.screen2D.setRoot(this.canvasRef.nativeElement, this.pageWidth, this.pageHeight);

    this.screen2D.render = (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      page.render(ctx);
      ctx.restore();
    }

    this.sharing.startSharing(page);
  }

  public ngAfterViewInit() {

    this.currentPage.then(page => {
      this.doSetCurrentPage(page);
      this.screen2D.go();
      this.label = "Off"
    })
  }

}
