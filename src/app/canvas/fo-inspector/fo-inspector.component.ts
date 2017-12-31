import { Component, OnInit, Input } from '@angular/core';

import { StageComponent } from "../stage.component";

import { foPage } from "../../foundry/foPage.model";
import { PubSub } from "../../foundry/foPubSub";

//https://valor-software.com/ngx-bootstrap/#/tabs


@Component({
  selector: 'fo-inspector',
  templateUrl: './fo-inspector.component.html',
  styleUrls: ['./fo-inspector.component.css']
})
export class foInspectorComponent implements OnInit {
  oneAtATime: boolean = true;
  @Input()
  public stage: StageComponent;

  public rootPage: foPage;

  constructor() { }

  ngOnInit() {
    this.rootPage = this.stage
  }

  doRefreshStencil() {
    PubSub.Pub('refreshStencil');
  }
}
