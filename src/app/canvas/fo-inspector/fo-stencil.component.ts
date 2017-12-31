import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";
import { Tools } from "../../foundry/foTools";
import { Concept } from "../../foundry/foConcept.model";
import { PubSub } from "../../foundry/foPubSub";

@Component({
  selector: 'fo-stencil',
  templateUrl: './fo-stencil.component.html',
  styleUrls: ['./fo-stencil.component.css']
})
export class foStencilComponent implements OnInit {
  @Input()
  public rootPage: foPage;

  list:Array<any> = new Array<any>();
  headings:Array<string> = new Array<string>();
  groups:any = {};

  constructor() { }

  ngOnInit() {
    PubSub.Sub('refreshStencil', () => {
      this.list = Concept.allConcepts();

      this.groups = Tools.groupBy(Tools.pluck('namespace'), this.list);
      this.headings = Concept.namespaces();
    });
   
  }

  doCreate(item){
    let concept = item.concept;
    let box = concept.newInstance()
      .drop(this.rootPage.centerX, this.rootPage.centerY)
      .addAsSubcomponent(this.rootPage);

  }

}
