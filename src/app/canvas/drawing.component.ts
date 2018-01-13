import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener  } from '@angular/core';

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";
import { foPage } from "../foundry/foPage.model";
import { foModel } from "../foundry/foModel.model";

import { Sceen2D } from "../foundryDrivers/canvasDriver";

import { SharingService } from "../common/sharing.service";
import { Lifecycle, foLifecycleEvent, Knowcycle } from "../foundry/foLifecycle";
import { BroadcastChange, foChangeEvent } from '../foundry/foChange';
import { RuntimeType } from 'app/foundry/foRuntimeType';
import { foDocument } from 'app/foundry/foDocument.model';


import { ParticleStencil, foShape2D } from "./particle.model";
import { ShapeStencil } from "./shapes.model";
import { PersonDomain } from "./domain.model";


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

  screen2D: Sceen2D = new Sceen2D();
  currentDocument: foDocument;
  currentPage: foPage;

  //https://stackoverflow.com/questions/37362488/how-can-i-listen-for-keypress-event-on-the-whole-page
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    alert( event.key);
  }

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
    this.currentPage = this.createPage()
      .then(page => {
        //this.doParticleEngine(page);
        //this.doSubShape(page);
      });

  
    let libs = this.rootWorkspace.stencil;
    libs.add(ParticleStencil).displayName = "Particle";
    libs.add(ShapeStencil).displayName = "Shape";
    
    this.rootWorkspace.library.add(PersonDomain);
    this.rootWorkspace.model.addItem('default', new foModel({}))
  }

  private createPage(): foPage {
    return this.currentDocument.createPage({
      width: this.pageWidth,
      height: this.pageHeight,
    });
  }

  doAddPage() {
    this.doGoToPage(this.createPage());
  }

  doDeletePage() {

  }

  doGoToPage(page: foPage) {
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

    this.sharing.currentPage = page;
    this.screen2D.clear();
    //with the render function you could
    //1) render a single page
    //2) render pages like layers
    //3) render pages side by side
    this.screen2D.render = (ctx: CanvasRenderingContext2D) => {
      page.render(ctx);
    }
    this.screen2D.go();

  }

  public ngAfterViewInit() {

    this.screen2D.setRoot(this.canvasRef.nativeElement, this.pageWidth, this.pageHeight);
    this.sharing.startSharing();

    this.currentPage.then(page => {
      this.doSetCurrentPage(page);
    })
  }

}
