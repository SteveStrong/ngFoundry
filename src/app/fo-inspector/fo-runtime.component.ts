import { Component, OnInit } from '@angular/core';

import { Tools } from "../foundry/foTools";
import { RuntimeType } from "../foundry/foRuntimeType";
import { Knowcycle } from "../foundry/foLifecycle";

@Component({
  selector: 'fo-runtime',
  templateUrl: './fo-runtime.component.html',
  styleUrls: ['./fo-runtime.component.css']
})
export class foRuntimeComponent implements OnInit {
  primitives: Array<string>;

  constructor() { }

  initViewModel() {
    this.primitives = RuntimeType.primitives();
  }

  ngOnInit() {
    this.initViewModel();

    Knowcycle.observable.subscribe(item => {
      this.initViewModel();
    });


  }

}
