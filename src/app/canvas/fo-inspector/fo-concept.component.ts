import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";
import { Tools } from "../../foundry/foTools";
import { foKnowledge } from "../../foundry/foKnowledge.model";
import { Stencil } from "../../foundry/foStencil";

import { Knowcycle } from "../../foundry/foLifecycle";

@Component({
  selector: 'fo-concept',
  templateUrl: './fo-concept.component.html',
  styleUrls: ['./fo-concept.component.css']
})
export class foConceptComponent implements OnInit {
  @Input()
  public rootPage: foPage;

  list:Array<foKnowledge> = new Array<foKnowledge>();
  headings:Array<string> = new Array<string>();
  groups:any = {};

  constructor() { }

  initViewModel() {
    this.list = Stencil.concepts.members;

    this.groups = Tools.groupBy(Tools.pluck('namespace'), this.list);
    this.headings = Stencil.namespaces();
  }

  ngOnInit() {
    this.initViewModel();
    Knowcycle.observable.subscribe(item => {
      this.initViewModel();
    });
  }

  doCreate(concept){
    let box = concept.newInstance()
      .drop(this.rootPage.centerX, this.rootPage.centerY)
      .addAsSubcomponent(this.rootPage);

  }

}
