import { Component, OnInit } from '@angular/core';

import { foLibrary } from 'app/foundry/foLibrary.model';
import { globalWorkspace, foWorkspace } from "../../foundry/foWorkspace.model";

@Component({
  selector: 'fo-concept',
  templateUrl: './fo-concept.component.html',
  styleUrls: ['./fo-concept.component.css']
})
export class foConceptComponent implements OnInit {
  rootWorkspace: foWorkspace = globalWorkspace;
  list:Array<foLibrary> = new Array<foLibrary>();


  constructor() { }



  ngOnInit() {
    this.list = this.rootWorkspace.library.members;

  }

  doCreate(concept){

  }

}
