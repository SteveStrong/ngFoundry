import { Component, OnInit } from '@angular/core';

import { Tools } from "../../foundry/foTools";
import { RuntimeType } from "../../foundry/foRuntimeType";
import { PubSub } from "../../foundry/foPubSub";

@Component({
  selector: 'fo-runtime',
  templateUrl: './fo-runtime.component.html',
  styleUrls: ['./fo-runtime.component.css']
})
export class foRuntimeComponent implements OnInit {
  primitives: Array<string>;

  constructor() { }

  ngOnInit() {
    this.primitives = RuntimeType.primitives();
    PubSub.Sub('onRuntimeTypeChanged', (name) => {
      this.primitives = RuntimeType.primitives();
    });


  }

}
