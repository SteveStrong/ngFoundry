import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";
import { foKnowledge } from "../../foundry/foKnowledge.model";
import { Stencil } from "../../foundry/foStencil";
import { foGlyph } from "../../foundry/foGlyph.model";

import { SignalRService } from "../../common/signalr.service";

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

  constructor(private signalR: SignalRService) { }


  ngOnInit() {
  }

  doCreate() {
    let spec = this.stencilItem;
    let shape = spec.newInstance()
      .drop(this.rootPage.centerX, this.rootPage.centerY)
      .addAsSubcomponent(this.rootPage);

    this.signalR.pubCommand("syncShape", { guid: shape.myGuid }, shape.asJson);

  }

  doCommand(cmd:string) {

  }

}
