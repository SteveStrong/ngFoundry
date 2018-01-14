import { Component, OnInit, Input } from '@angular/core';

//import { globalWorkspace } from "../../foundry/foWorkspace.model";
import { foNode } from "../../foundry/foNode.model";

@Component({
  selector: 'fo-model-panel',
  templateUrl: './fo-model-panel.component.html',
  styleUrls: ['./fo-model-panel.component.css']
})
export class foModelPanelComponent implements OnInit {
  showDetails = false;

  @Input()
  public node: foNode;
  public commands: Array<string>;

  constructor() { }

  ngOnInit() {
    //let myClass = this.node.myClass;
    // let spec = globalWorkspace.library.establish('stencil').concepts.findItem(myClass);
    // if (spec) {
    //   this.commands = spec.commands;
    // }
  }

  doToggleDetails() {
    this.showDetails = !this.showDetails;
  }

  doCommand(cmd: string) {
    this.node[cmd] && this.node[cmd]();
  }

}
