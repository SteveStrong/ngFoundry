import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";
import { foKnowledge } from "../../foundry/foKnowledge.model";


@Component({
  selector: 'fo-stencil-panel',
  templateUrl: './fo-stencil-panel.component.html',
  styleUrls: ['./fo-stencil-panel.component.css']
})
export class foStencilPanelComponent implements OnInit {

  @Input()
  public stencilItem:foKnowledge;

  @Input()
  public rootPage: foPage;

  constructor() { }


  ngOnInit() {
  }

  doCreate() {
    this.stencilItem.newInstance()
      .drop(this.rootPage.centerX, this.rootPage.centerY)
      .addAsSubcomponent(this.rootPage);

  }

  doCommand(cmd:string) {

  }

}
