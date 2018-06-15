import { Component, OnInit, Input } from '@angular/core';

import { foLibrary } from 'app/foundry/foLibrary.model';
import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";
import { foModel } from "../foundry/foModel.model";
import { foController } from '../foundry/foController';


@Component({
  selector: 'fo-knowledge',
  templateUrl: './fo-knowledge.component.html',
  styleUrls: ['./fo-knowledge.component.css']
})
export class foKnowledgeComponent implements OnInit {

  @Input()
  workspace: foWorkspace;

  model: foModel;
  list:Array<foLibrary> = new Array<foLibrary>();
  controllers:Array<foController> = new Array<foController>();


  constructor() { }


  ngOnInit() {
    this.workspace = this.workspace || globalWorkspace;

    this.model = this.workspace.model.getItem('default')

    this.list = this.workspace.library.members;
    
    this.controllers = this.workspace.controller.publicMembers;

  }



}
