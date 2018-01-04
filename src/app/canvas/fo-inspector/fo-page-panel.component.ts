import { Component, OnInit, Input } from '@angular/core';

import { Tools } from "../../foundry/foTools";
import { Concept } from "../../foundry/foConcept.model";
import { foGlyph } from "../../foundry/foGlyph.model";

@Component({
  selector: 'fo-page-panel',
  templateUrl: './fo-page-panel.component.html',
  styleUrls: ['./fo-page-panel.component.css']
})
export class foPagePanelComponent implements OnInit {

  @Input()
  public node: foGlyph;

  public commands: Array<string>;

  constructor() { }

  ngOnInit() {
    let myClass = this.node.myClass;
    let spec = Concept.find(myClass);
    if (spec) {
      this.commands = spec.commands;
    }
  }

  doCommand(cmd: string) {
    this.node[cmd] && this.node[cmd]();
  }

}
