import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';

import { Tools } from "../foundry/foTools";

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";
import { foPage } from "../foundry/shapes/foPage.model";
import { foModel } from "../foundry/foModel.model";

import { SharingService } from "../common/sharing.service";
import { Lifecycle, foLifecycleEvent, Knowcycle } from "../foundry/foLifecycle";

import { ParticleStencil } from "./particle.model";
import { ShapeStencil } from "./shapes.model";
import { PersonDomain } from "./domain.model";
import { SolidStencil } from "./solids.model";


@Component({
  selector: 'fo-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.css']
})
export class DomainComponent implements OnInit {

  rootWorkspace: foWorkspace = globalWorkspace.defaultName();
  
  constructor(
    private sharing: SharingService) {
  }

  ngOnInit() {

    // let libs = this.rootWorkspace.stencil;
    // libs.add(ParticleStencil).displayName = "Particle";
    // libs.add(ShapeStencil).displayName = "Shape";
    // libs.add(SolidStencil).displayName = "Solid";

    this.rootWorkspace.library.add(PersonDomain);
    this.rootWorkspace.model.addItem('default', new foModel({}));

  }

}
