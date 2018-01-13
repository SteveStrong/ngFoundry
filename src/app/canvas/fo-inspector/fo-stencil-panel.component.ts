import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";
import { foNode } from "../../foundry/foNode.model";
import { foKnowledge } from "../../foundry/foKnowledge.model";
import { Toast } from "../../common/emitter.service";


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

  @Input()
  public rootPage: foPage;

  constructor() { }


  ngOnInit() {
  }

  doToggleDetails() {
    this.showDetails = !this.showDetails;
  }
  
  doCreate() {
    this.lastCreated = this.concept.newInstance().defaultName()
    .dropAt(this.rootPage.centerX, this.rootPage.centerY)
      .addAsSubcomponent(this.rootPage);

    Toast.info("Created", this.lastCreated.displayName)
  }

  doCommand(cmd:string) {
    this.lastCreated && this.lastCreated[cmd]();
  }

}
