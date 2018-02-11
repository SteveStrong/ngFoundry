import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';

import { Tools } from "../foundry/foTools";

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";
import { foPage } from "../foundry/shapes/foPage.model";
import { foModel } from "../foundry/foModel.model";

import { SharingService } from "../common/sharing.service";
import { Lifecycle, foLifecycleEvent, Knowcycle } from "../foundry/foLifecycle";

import { DevSecOps, DevSecOpsShapes, DevSecOpsSolids } from "./devsecops.model";



@Component({
  selector: 'fo-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.css']
})
export class DomainComponent implements OnInit {

  workspace: foWorkspace = globalWorkspace;
  model: foModel;
  
  constructor(
    private sharing: SharingService) {
  }

  ngOnInit() {
  
    this.workspace.stencil.add(DevSecOpsShapes);
    this.workspace.stencil.add(DevSecOpsSolids);
    this.workspace.library.add(DevSecOps);
    this.workspace.model.addItem('default', new foModel({}));

    this.model = this.workspace.model.getItem('default')
  }

}
