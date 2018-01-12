import { Component, OnInit, Input } from '@angular/core';

import { globalWorkspace } from "../../foundry/foWorkspace.model";
import { foGlyph } from "../../foundry/foGlyph.model";

@Component({
  selector: 'fo-page-panel',
  templateUrl: './fo-page-panel.component.html',
  styleUrls: ['./fo-page-panel.component.css']
})
export class foPagePanelComponent implements OnInit {
  showDetails = false;
  @Input()
  public node: foGlyph;

  public commands: Array<string>;

  constructor() { }

  ngOnInit() {
    let myClass = this.node.myClass;
    let spec = globalWorkspace.library.establish('stencil').concepts.findItem(myClass);
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
