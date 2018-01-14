import { Component, OnInit } from '@angular/core';

import { foLibrary } from 'app/foundry/foLibrary.model';
import { globalWorkspace, foWorkspace } from "../../foundry/foWorkspace.model";
import { foModel } from "../../foundry/foModel.model";


@Component({
  selector: 'fo-concept',
  templateUrl: './fo-concept.component.html',
  styleUrls: ['./fo-concept.component.css']
})
export class foConceptComponent implements OnInit {
  rootWorkspace: foWorkspace = globalWorkspace;
  rootModel: foModel;
  list:Array<foLibrary> = new Array<foLibrary>();


  constructor() { }



  ngOnInit() {
    this.rootModel = this.rootWorkspace.model.getItem('default')

    this.list = this.rootWorkspace.library.members;

  }



}
