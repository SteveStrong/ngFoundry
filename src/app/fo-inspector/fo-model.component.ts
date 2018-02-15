import { Component, OnInit, Input } from '@angular/core';

import { foModel } from "../foundry/foModel.model";

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";

@Component({
  selector: 'fo-model',
  templateUrl: './fo-model.component.html',
  styleUrls: ['./fo-model.component.css']
})
export class foModelComponent implements OnInit {
  showDetails = false;
  @Input()
  workspace: foWorkspace;
  model: foModel;
  public commands: Array<string>;
  
  constructor() { }

  doToggleDetails() {
    this.showDetails = !this.showDetails;
  }

  doCommand(cmd: string) {
    this.model[cmd] && this.model[cmd]();
  }

  ngOnInit() {
    this.workspace = this.workspace || globalWorkspace;

    this.model = this.workspace.model.getItem('default')
  }


}
