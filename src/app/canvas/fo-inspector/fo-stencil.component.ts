import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";
import { Tools } from "../../foundry/foTools";
import { Stencil, foStencilItem } from "../../foundry/foStencil";
import { Knowcycle } from "../../foundry/foLifecycle";



@Component({
  selector: 'fo-stencil',
  templateUrl: './fo-stencil.component.html',
  styleUrls: ['./fo-stencil.component.css']
})
export class foStencilComponent implements OnInit {
  @Input()
  public rootPage: foPage;

  list: Array<foStencilItem>;
  headings: Array<string> = new Array<string>();
  groups: any = {};

  constructor() { }

  initViewModel() {
    this.list = Stencil.allStencilItem();

    this.groups = Tools.groupBy(Tools.pluck('namespace'), this.list);
    this.headings = Stencil.namespaces();
  }

  ngOnInit() {
    this.initViewModel();
    Knowcycle.observable.subscribe(item => {
      this.initViewModel();
    });

  }



}
