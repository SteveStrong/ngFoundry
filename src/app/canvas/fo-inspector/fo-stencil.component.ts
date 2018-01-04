import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";
import { Tools } from "../../foundry/foTools";
import { foKnowledge } from "../../foundry/foKnowledge.model";

import { Concept, foConcept } from "../../foundry/foConcept.model";
import { Knowcycle } from "../../foundry/foLifecycle";



@Component({
  selector: 'fo-stencil',
  templateUrl: './fo-stencil.component.html',
  styleUrls: ['./fo-stencil.component.css']
})
export class foStencilComponent implements OnInit {
  @Input()
  public rootPage: foPage;

  list: Array<foKnowledge>;
  headings: Array<string> = new Array<string>();
  groups: any = {};

  constructor() { }

  initViewModel() {
    this.list = Concept.concepts.members; //.as;

    this.groups = Tools.groupBy(Tools.pluck('namespace'), this.list);
    this.headings = Concept.namespaces();
  }

  ngOnInit() {
    this.initViewModel();
    Knowcycle.observable.subscribe(item => {
      this.initViewModel();
    });

  }



}
