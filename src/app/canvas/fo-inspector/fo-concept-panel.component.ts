import { Component, OnInit, Input } from '@angular/core';

import { Tools } from "../../foundry/foTools";

import { foModel } from "../../foundry/foModel.model";
import { foNode } from "../../foundry/foNode.model";
import { foKnowledge } from "../../foundry/foKnowledge.model";
import { Toast } from "../../common/emitter.service";

import { globalWorkspace } from "../../foundry/foWorkspace.model";

@Component({
  selector: 'fo-concept-panel',
  templateUrl: './fo-concept-panel.component.html',
  styleUrls: ['./fo-concept-panel.component.css']
})
export class foConceptPanelComponent implements OnInit {
  lastCreated: foNode;
  showDetails = false;

  @Input()
  public concept:foKnowledge;

  @Input()
  public model:foModel;

  constructor() { }

  ngOnInit() {
  }

  doToggleDetails() {
    this.showDetails = !this.showDetails;
  }
  
  doCreate() {
    this.lastCreated = this.concept.newInstance().defaultName()
      .addAsSubcomponent(this.model);

    Toast.info("Created", this.lastCreated.displayName);

    let found = globalWorkspace.stencil.select(item => {
      return Tools.matches(item.myName,'text');
    }).first();

    

    let shape = found.newInstance({
      context: this.lastCreated.displayName,
      fontSize: 40,
      x: 400,
      y: 400,
    });
    //foObject.jsonAlert(shape);
    globalWorkspace.activePage.addSubcomponent(shape);

  }

  doCommand(cmd:string) {
    this.lastCreated && this.lastCreated[cmd]();
  }

}
