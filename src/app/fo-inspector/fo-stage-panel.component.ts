import { Component, OnInit, Input } from '@angular/core';

import { Tools } from "../foundry/foTools";

import { globalWorkspace } from "../foundry/foWorkspace.model";
import { foGlyph3D } from "../foundry/solids/foGlyph3D.model";

@Component({
  selector: 'fo-stage-panel',
  templateUrl: './fo-stage-panel.component.html',
  styleUrls: ['./fo-stage-panel.component.css']
})
export class foStagePanelComponent implements OnInit {
  showDetails = false;
  
  @Input()
  public node: foGlyph3D;
  public commands: Array<string>;

  constructor() { }

  ngOnInit() {
    let myClass = this.node.myClass;
    let spec = globalWorkspace.select(item => Tools.matches(item.myName, myClass)).first();
    if (spec) {
      this.commands = spec.commands;
    }
  }

  doToggleDetails() {
    this.showDetails = !this.showDetails;
  }

  doCommand(cmd: string) {
    this.node[cmd] && this.node[cmd]();
  }

}
