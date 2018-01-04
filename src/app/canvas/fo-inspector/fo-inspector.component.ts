import { Component, OnInit, Input } from '@angular/core';

import { StageComponent } from "../stage.component";

import { foPage } from "../../foundry/foPage.model";
import { PubSub } from "../../foundry/foPubSub";

import { Lifecycle, foLifecycleEvent, Knowcycle } from "../../foundry/foLifecycle";

//https://valor-software.com/ngx-bootstrap/#/tabs


@Component({
  selector: 'fo-inspector',
  templateUrl: './fo-inspector.component.html',
  styleUrls: ['./fo-inspector.component.css']
})
export class foInspectorComponent implements OnInit {
  lifecycleEvent: Array<foLifecycleEvent> = new Array<foLifecycleEvent>()

  @Input()
  public stage: StageComponent;

  public rootPage: foPage;

  constructor() { }

  ngOnInit() {
    this.rootPage = this.stage;

    let max = 25;
    Lifecycle.observable.subscribe(event => {
      this.pushMax(event, max);
    });

    Knowcycle.observable.subscribe(event => {
      this.pushMax(event, max);
    });
  }

  pushMax(value, max) {
    let length = this.lifecycleEvent.length;
    if (length >= max) {
      this.lifecycleEvent.splice(0, length - max + 1);
    }
    this.lifecycleEvent.push(value);
  }

  doRefreshRuntimeTypes() {
    PubSub.Pub('onRuntimeTypeChanged');
  }

  doRefreshStencil() {
    PubSub.Pub('onStencilChanged');
  }

  doRefreshConcepts() {
    Knowcycle.defined()
  }
}
