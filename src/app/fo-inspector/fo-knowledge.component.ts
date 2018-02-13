import { Component, OnInit } from '@angular/core';

import { foLibrary } from 'app/foundry/foLibrary.model';
import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";
import { foModel } from "../foundry/foModel.model";


@Component({
  selector: 'fo-knowledge',
  templateUrl: './fo-knowledge.component.html',
  styleUrls: ['./fo-knowledge.component.css']
})
export class foKnowledgeComponent implements OnInit {
  rootWorkspace: foWorkspace = globalWorkspace;
  rootModel: foModel;
  list:Array<foLibrary> = new Array<foLibrary>();


  constructor() { }



  ngOnInit() {
    this.rootModel = this.rootWorkspace.model.getItem('default')

    this.list = this.rootWorkspace.library.members;

  }



}
