import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";
import { Tools } from "../../foundry/foTools";
import { foKnowledge } from "../../foundry/foKnowledge.model";

import { Concept, foConcept } from "../../foundry/foConcept.model";
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
    this.list = Concept.concepts.members;

    this.groups = Tools.groupBy(Tools.pluck('namespace'), this.list);
    this.headings = Concept.namespaces();
  }

  ngOnInit() {
    this.initViewModel();
    Knowcycle.observable.subscribe(item => {
      this.initViewModel();
    });
  }

  doCreate(item){
    let concept = item.concept;
    let box = concept.newInstance()
      .drop(this.rootPage.centerX, this.rootPage.centerY)
      .addAsSubcomponent(this.rootPage);

  }

}
