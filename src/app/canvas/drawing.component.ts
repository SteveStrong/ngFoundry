import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";
import { foPage } from "../foundry/foPage.model";
import { foModel } from "../foundry/foModel.model";

import { Screen2D } from "../foundryDrivers/canvasDriver";
import { Screen3D } from "../foundryDrivers/threeDriver";

import { BroadcastChange } from '../foundry/foChange';

import { cPoint2D } from '../foundry/foGeometry2D';
import { foGlyph2D } from "../foundry/foGlyph2D.model";

import { SharingService } from "../common/sharing.service";
import { Lifecycle, foLifecycleEvent, Knowcycle } from "../foundry/foLifecycle";
import { foChangeEvent } from '../foundry/foChange';

import { foDocument } from 'app/foundry/foDocument.model';
import { foStudio } from 'app/foundry/foStudio.model';
import { foStage } from 'app/foundry/foStage.model';


import { ParticleStencil, foShape2D } from "./particle.model";
import { ShapeStencil } from "./shapes.model";
import { PersonDomain } from "./domain.model";
import { foObject } from 'app/foundry/foObject.model';
import { filter } from 'rxjs/operators';
import { setTimeout } from 'timers';

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
  @ViewChild('world')
  public worldRef: ElementRef;

  @Input()
  public pageWidth = 1400;
  @Input()
  public pageHeight = 800;

  screen2D: Screen2D = new Screen2D();
  currentDocument: foDocument;

  screen3D: Screen3D = new Screen3D();
  currentStudio: foStudio;

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
    this.currentStudio.currentStage.clearStage();

    this.sharing.clearPage();
  }

  doDelete() {
    this.currentDocument.currentPage.deleteSelected();
    this.currentStudio.currentStage.deleteSelected();

  }

  doOnOff() {
    this.label = this.screen2D.toggleOnOff() ? "On" : "Off"
  }

  doCamera() {
    let x =  0;
    let y =  0;
    let z =  0;
    let xxx = this.screen3D;
    function spin(){
      xxx.cameraSpin(x,y,z);
      y += 1 * foGlyph2D.DEG_TO_RAD;
      y < 360 && setTimeout(spin, 100)
    }  
    spin() 
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
    result.forEach(item => { item.addAsSubcomponent(page) });
  }



  ngOnInit() {
    this.currentDocument = this.rootWorkspace.document.override({
      pageWidth: this.pageWidth,
      pageHeight: this.pageHeight,
    });

    this.currentStudio = this.rootWorkspace.studio.override({
      stageWidth: 1000,
      stageHeight: 1000,
      stageDepth: 1000,
    });


    let Lifecycle2D = Lifecycle.observable.pipe(filter(e => e.object.is2D()));
    let moved = Lifecycle2D.pipe(filter(e => e.isCmd('moved')));
    let dropped = Lifecycle2D.pipe(filter(e => e.isCmd('dropped')));
    let reparent = Lifecycle2D.pipe(filter(e => e.isCmd('reparent')));
    let created = Lifecycle2D.pipe(filter(e => e.isCmd('created') && e.value));

    moved.subscribe(event => {
      console.log(event.id, event.cmd, event.myGuid, JSON.stringify(event.value));

      this.currentStudio.currentStage.found(event.myGuid, item => {
        let { x, y } = event.value;
        item.move(x, y);
      })
    });

    dropped.subscribe(event => {
      this.currentStudio.currentStage.found(event.myGuid, item => {
        let { x, y, angle } = event.value;
        item.dropAt(x, y, angle);
      })
    });

    reparent.subscribe(event => {
      console.log(event.id, event.cmd, event.myGuid, JSON.stringify(event.value));
      
      this.currentStudio.currentStage.found(event.myGuid, shape => {
        let parent = event.object.myParent();
        parent && this.currentStudio.currentStage.found(parent.myGuid, 
          (item) => {shape.reParent(item)},
          (miss)=> {shape.reParent(this.currentStudio.currentStage)}
        )
      })
    });

    created.subscribe(event => {
      let stage = this.currentStudio.currentStage;
      stage.findItem(event.myGuid, () => {
        let knowledge = event.value;
        knowledge && knowledge.usingRuntimeType('foGlyph3D', concept => {
          let result = concept.newInstance(event.object.asJson);
          stage.establishInDictionary(result);
        })
      })

    });

    let libs = this.rootWorkspace.stencil;
    libs.add(ParticleStencil).displayName = "Particle";
    libs.add(ShapeStencil).displayName = "Shape";

    this.rootWorkspace.library.add(PersonDomain);
    this.rootWorkspace.model.addItem('default', new foModel({}))
  }


  doAddPage() {
    this.currentDocument.createPage();
    this.currentStudio.createStage();
  }

  doDeletePage() {

  }

  doGoToPage(page: foPage) {
    this.currentDocument.currentPage = page;
  }

  doGoToStage(stage: foStage) {
    this.currentStudio.currentStage = stage;
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

  doSetCurrentStage(stage: foStage) {

    this.screen3D.clear();

    this.screen3D.render3D = (screen: Screen3D, deep: boolean = true) => {
      stage.render3D(screen);
    }
    this.screen3D.go();
  }

  public ngAfterViewInit() {

    this.screen2D.setRoot(this.canvasRef.nativeElement, this.pageWidth, this.pageHeight);
    this.screen3D.setRoot(this.worldRef.nativeElement, this.pageWidth, this.pageHeight);

    this.sharing.startSharing();

    BroadcastChange.observable.subscribe(item => {
      if (item.isCmd('currentPage')) {
        this.doSetCurrentPage(this.currentDocument.currentPage);
      }
      if (item.isCmd('currentStage')) {
        this.doSetCurrentStage(this.currentStudio.currentStage);
      }
    });

    this.doSetCurrentPage(this.currentDocument.currentPage);
    this.doSetCurrentStage(this.currentStudio.currentStage);

    this.screen3D.addAxisHelper(1100).addBack(1000, 50);
  }

  addEventHooks(page: foPage) {

    page.onItemHoverEnter = (loc: cPoint2D, shape: foGlyph2D, keys?: any): void => {
      if (shape) {
        shape.drawHover = function (ctx: CanvasRenderingContext2D) {
          ctx.strokeStyle = "yellow";
          ctx.lineWidth = 4;
          shape.drawOutline(ctx);
        }
      }
    }

    page.onItemHoverExit = (loc: cPoint2D, shape: foGlyph2D, keys?: any): void => {
      if (shape) {
        shape.drawHover = undefined;
      }
    }

    page.onItemOverlapEnter = (loc: cPoint2D, shape: foGlyph2D, shapeUnder: foGlyph2D, keys?: any): void => {

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

    page.onItemOverlapExit = (loc: cPoint2D, shape: foGlyph2D, shapeUnder: foGlyph2D, keys?: any): void => {

      if (shapeUnder) {
        shapeUnder.drawHover = undefined;
      }
    }

  }

}
