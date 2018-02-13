import { Component, OnInit, Input } from '@angular/core';

import { Tools } from "../foundry/foTools";

import { globalWorkspace } from "../foundry/foWorkspace.model";
import { foGlyph2D } from "../foundry/shapes/foGlyph2D.model";

@Component({
  selector: 'fo-page-panel',
  templateUrl: './fo-page-panel.component.html',
  styleUrls: ['./fo-page-panel.component.css']
})
export class foPagePanelComponent implements OnInit {
  showDetails = false;
  
  @Input()
  public node: foGlyph2D;
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
