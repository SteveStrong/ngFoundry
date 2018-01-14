import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";
import { foModel } from "../foundry/foModel.model";

import { Screen3D } from "../foundryDrivers/threeDriver";

import { SharingService } from "../common/sharing.service";
import { Lifecycle, foLifecycleEvent, Knowcycle } from "../foundry/foLifecycle";
import { BroadcastChange, foChangeEvent } from '../foundry/foChange';
import { foDocument } from 'app/foundry/foDocument.model';


import { ParticleStencil, foShape2D } from "./particle.model";
import { ShapeStencil } from "./shapes.model";
import { PersonDomain } from "./domain.model";
@Component({
  selector: 'foundry-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements OnInit, AfterViewInit {
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
  currentDocument: foDocument;

  constructor(
    private sharing: SharingService) {
  }

  ngOnInit() {

    this.currentDocument = this.rootWorkspace.document.override({
      pageWidth: this.pageWidth,
      pageHeight: this.pageHeight,
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

  public ngAfterViewInit() {


    this.screen3D.setRoot(this.worldRef.nativeElement, this.pageWidth, this.pageHeight);
    this.sharing.startSharing();

    this.screen3D.addBlock(100,400,900)

    //with the render function you could
    //1) render a single page
    //2) render pages like layers
    //3) render pages side by side
    // this.screen3D.render = (ctx: CanvasRenderingContext2D) => {
    //   page.render(ctx);
    // }

    this.screen3D.go();
  }

}
