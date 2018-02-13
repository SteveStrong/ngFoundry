import { Component, OnInit, Input } from '@angular/core';

//import { globalWorkspace } from "../foundry/foWorkspace.model";
import { foNode } from "../foundry/foNode.model";

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
  }

  doToggleDetails() {
    this.showDetails = !this.showDetails;
  }

  doCommand(cmd: string) {
    this.node[cmd] && this.node[cmd]();
  }

}
