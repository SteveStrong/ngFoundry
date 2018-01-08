import { Component, OnInit, Input } from '@angular/core';

import { StageComponent } from "../stage.component";

import { foPage } from "../../foundry/foPage.model";

import { Lifecycle, foLifecycleEvent, Knowcycle } from "../../foundry/foLifecycle";
import { RuntimeType } from 'app/foundry/foRuntimeType';
import { BroadcastChange, foChangeEvent } from 'app/foundry/foChange';

//https://valor-software.com/ngx-bootstrap/#/tabs


@Component({
  selector: 'fo-inspector',
  templateUrl: './fo-inspector.component.html',
  styleUrls: ['./fo-inspector.component.css']
})
export class foInspectorComponent implements OnInit {
  lifecycleEvent: Array<foLifecycleEvent> = new Array<foLifecycleEvent>()
  changeEvent: Array<foChangeEvent> = new Array<foChangeEvent>()

  @Input()
  public stage: StageComponent;

  public rootPage: foPage;

  constructor() { }

  ngOnInit() {
    this.rootPage = this.stage;

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

  doRefreshConcepts() {
    Knowcycle.defined()
  }
}
