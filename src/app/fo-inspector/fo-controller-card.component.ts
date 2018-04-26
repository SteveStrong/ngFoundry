import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';

import { Tools } from "../foundry/foTools";

import { foModel } from "../foundry/foModel.model";
import { foNode } from "../foundry/foNode.model";
import { foController } from "../foundry/foController";
import { Toast } from "../common/emitter.service";



@Component({
  selector: 'fo-controller-card',
  templateUrl: './fo-controller-card.component.html',
  styleUrls: ['./fo-controller-card.component.css']
})
export class foControllerCardComponent implements OnInit {
  showDetails = false;

  @Input()
  public control:foController;

  @Input()
  public model: foModel;
  

  constructor() { }

  ngOnInit() {
  }

  doToggleDetails() {
    this.showDetails = !this.showDetails;
  }

  doCommand(cmd: string) {
    this.control[cmd]();
  }
}
