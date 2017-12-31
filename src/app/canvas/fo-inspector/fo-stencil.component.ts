import { Component, OnInit } from '@angular/core';

import { Concept } from "../../foundry/foConcept.model";
import { PubSub } from "../../foundry/foPubSub";

@Component({
  selector: 'fo-stencil',
  templateUrl: './fo-stencil.component.html',
  styleUrls: ['./fo-stencil.component.css']
})
export class foStencilComponent implements OnInit {

  list:Array<any> = new Array<any>();

  constructor() { }

  ngOnInit() {
    PubSub.Sub('refreshStencil', () => {
      this.list = Concept.allConcepts();
    });
   
  }

}
