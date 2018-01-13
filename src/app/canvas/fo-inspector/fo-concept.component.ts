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


  constructor() { }



  ngOnInit() {

  }

  doCreate(concept){

  }

}
