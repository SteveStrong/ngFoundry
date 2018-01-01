import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";
import { Tools } from "../../foundry/foTools";
import { Concept, foConceptItem } from "../../foundry/foConcept.model";
import { PubSub } from "../../foundry/foPubSub";

@Component({
  selector: 'fo-concept',
  templateUrl: './fo-concept.component.html',
  styleUrls: ['./fo-concept.component.css']
})
export class foConceptComponent implements OnInit {
  @Input()
  public rootPage: foPage;

  list:Array<foConceptItem> = new Array<foConceptItem>();
  headings:Array<string> = new Array<string>();
  groups:any = {};

  constructor() { }

  initViewModel() {
    this.list = Concept.allConceptItems();

    this.groups = Tools.groupBy(Tools.pluck('namespace'), this.list);
    this.headings = Concept.namespaces();
  }

  ngOnInit() {
    this.initViewModel();
    PubSub.Sub('onKnowledgeChanged', (concept) => {
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
