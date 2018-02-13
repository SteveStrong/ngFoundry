import { Component, OnInit } from '@angular/core';

import { Lifecycle, foLifecycleEvent, Knowcycle } from "../foundry/foLifecycle";
import { BroadcastChange, foChangeEvent } from '../foundry/foChange';


@Component({
  selector: 'fo-events',
  templateUrl: './fo-events.component.html',
  styleUrls: ['./fo-events.component.css']
})
export class foEventsComponent implements OnInit {
  lifecycleEvent: Array<foLifecycleEvent> = new Array<foLifecycleEvent>()
  changeEvent: Array<foChangeEvent> = new Array<foChangeEvent>()

  constructor() { }

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


}
