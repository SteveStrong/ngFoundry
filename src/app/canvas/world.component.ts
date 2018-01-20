import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';

import { TweenLite, Back } from "gsap";

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";
import { foModel } from "../foundry/foModel.model";

import { Screen3D } from "../foundryDrivers/threeDriver";

import { SharingService } from "../common/sharing.service";
import { Lifecycle, foLifecycleEvent, Knowcycle } from "../foundry/foLifecycle";
import { BroadcastChange, foChangeEvent } from '../foundry/foChange';
import { foStudio } from 'app/foundry/foStudio.model';
import { foStage } from 'app/foundry/foStage.model';

import { ParticleStencil, foShape2D } from "./particle.model";
import { ShapeStencil } from "./shapes.model";
import { PersonDomain } from "./domain.model";
import { SolidStencil } from "./solids.model";


@Component({
  selector: 'foundry-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements OnInit, AfterViewInit {
  label: string = 'Off';
  lifecycleEvent: Array<foLifecycleEvent> = new Array<foLifecycleEvent>()
  changeEvent: Array<foChangeEvent> = new Array<foChangeEvent>()

  rootWorkspace: foWorkspace = globalWorkspace.defaultName();

  @ViewChild('world')
  public worldRef: ElementRef;
  @Input()
  public pageWidth = 1400;
  @Input()
  public pageHeight = 1000;


  screen3D: Screen3D = new Screen3D();
  currentStudio: foStudio;

  constructor(
    private sharing: SharingService) {
  }

  doClear() {
    this.currentStudio.currentStage.clearStage();
    this.sharing.clearPage();
  }

  doDelete() {
    this.currentStudio.currentStage.deleteSelected();
  }



  doOnOff() {
    this.label = this.screen3D.toggleOnOff() ? "On" : "Off"
  }

  ngOnInit() {

    this.currentStudio = this.rootWorkspace.studio.override({
      stageWidth: 1000,
      stageHeight: 1000,
      stageDepth: 1000,
    });


    this.currentStudio.currentStage
      .then(stage => {
        //this.doParticleEngine(page);
        //this.doSubShape(page);
      });

    Lifecycle.observable.subscribe(event => {
      console.log(event.id, event.cmd, event.myGuid, JSON.stringify(event.value));
    })

    let libs = this.rootWorkspace.stencil;
    libs.add(ParticleStencil).displayName = "Particle";
    libs.add(ShapeStencil).displayName = "Shape";
    libs.add(SolidStencil).displayName = "Solid";

    this.rootWorkspace.library.add(PersonDomain);
    this.rootWorkspace.model.addItem('default', new foModel({}))

  }

  doAddStage() {
    this.currentStudio.createStage();
  }

  doDeleteStage() {

  }

  doGoToStage(stage: foStage) {
    this.currentStudio.currentStage = stage;
  }



  doSetCurrentStage(stage: foStage) {

    //this.screen3D.clear();

    //with the render function you could
    //1) render a single page
    //2) render pages like layers
    //3) render pages side by side
    this.screen3D.render3D = (screen: Screen3D, deep: boolean = true) => {
      stage.render3D(screen);
    }
    this.screen3D.go();

    //this.addEventHooks(page);
  }

  doAxis() {



    this.screen3D.addAxisHelper(1100)
      .addGridHelper(1000, 50, helper => {
        helper.rotateX(Math.PI / 2);
      })
      .addGridHelper(1000, 50, helper => {
        helper.rotateY(Math.PI / 2);
      })
      .addGridHelper(1000, 50, helper => {
        helper.rotateZ(Math.PI / 2);
      })
  }

  doWorld() {
    this.screen3D.addEarth().addLight().addLights();
  }

  doLight() {
    this.screen3D.addLight().addLights();
  }

  public ngAfterViewInit() {


    this.screen3D.setRoot(this.worldRef.nativeElement, this.pageWidth, this.pageHeight);
    this.sharing.startSharing();



    BroadcastChange.observable.subscribe(item => {
      if (item.isCmd('currentStage')) {
        this.doSetCurrentStage(this.currentStudio.currentStage);
      }
    });

    this.doSetCurrentStage(this.currentStudio.currentStage);


    // this.screen3D.addAxisHelper(1100)
    //   .addGridHelper(1000, 50, helper => {
    //     helper.rotation.copy(this.screen3D.euler(Math.PI / 2, 0, 0));
    //   })
    //   .addGridHelper(1000, 50, helper => {
    //     helper.rotation.copy(this.screen3D.euler(0, Math.PI / 2, 0));
    //   })
    //   .addGridHelper(1000, 50, helper => {
    //     helper.rotation.copy(this.screen3D.euler(0, 0, Math.PI / 2));
    //   })



    //this.screen3D.addBlock(100,400,900)

    //with the render function you could
    //1) render a single page
    //2) render pages like layers
    //3) render pages side by side
    // this.screen3D.render = (ctx: CanvasRenderingContext2D) => {
    //   page.render(ctx);
    // }

    // this.screen3D.go();
  }

  // addEventHooks(page: foPage) {

  //   page.onItemHoverEnter = (loc: cPoint2D, shape: foGlyph2D, keys?: any): void => {
  //     if (shape) {
  //       shape.drawHover = function (ctx: CanvasRenderingContext2D) {
  //         ctx.strokeStyle = "yellow";
  //         ctx.lineWidth = 4;
  //         shape.drawOutline(ctx);
  //       }
  //     }
  //   }

  //   page.onItemHoverExit = (loc: cPoint2D, shape: foGlyph2D, keys?: any): void => {
  //     if (shape) {
  //       shape.drawHover = undefined;
  //     }
  //   }

  //   page.onItemOverlapEnter = (loc: cPoint2D, shape: foGlyph2D, shapeUnder: foGlyph2D, keys?: any): void => {

  //     if (shapeUnder) {
  //       shapeUnder.drawHover = function (ctx: CanvasRenderingContext2D) {
  //         ctx.strokeStyle = "green";
  //         ctx.lineWidth = 8;
  //         shapeUnder.drawOutline(ctx);
  //         ctx.strokeStyle = "yellow";
  //         ctx.lineWidth = 4;
  //         shapeUnder.drawOutline(ctx);
  //       }
  //     }
  //   }

  //   page.onItemOverlapExit = (loc: cPoint2D, shape: foGlyph2D, shapeUnder: foGlyph2D, keys?: any): void => {

  //     if (shapeUnder) {
  //       shapeUnder.drawHover = undefined;
  //     }
  //   }

  // }

}
