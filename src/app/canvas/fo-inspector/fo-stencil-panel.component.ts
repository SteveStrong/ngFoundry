import { Component, OnInit, Input } from '@angular/core';


import { foNode } from "../../foundry/foNode.model";
import { foKnowledge } from "../../foundry/foKnowledge.model";
import { Toast } from "../../common/emitter.service";
import { globalWorkspace } from 'app/foundry/foWorkspace.model';


@Component({
  selector: 'fo-stencil-panel',
  templateUrl: './fo-stencil-panel.component.html',
  styleUrls: ['./fo-stencil-panel.component.css']
})
export class foStencilPanelComponent implements OnInit {
  lastCreated: foNode;
  showDetails = false;
  @Input()
  public concept:foKnowledge;

  constructor() { }

  ngOnInit() {
  }

  doToggleDetails() {
    this.showDetails = !this.showDetails;
  }
  
  doCreate() {
    let page = globalWorkspace.activePage;

    this.lastCreated = this.concept.newInstance().defaultName()
    .dropAt(page.centerX, page.centerY)
      .addAsSubcomponent(page);

    Toast.info("Created", this.lastCreated.displayName)
  }

  doCommand(cmd:string) {
    this.lastCreated && this.lastCreated[cmd]();
  }

}
