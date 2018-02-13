import { Component, OnInit, Input } from '@angular/core';

import { foStage } from "../foundry/solids/foStage.model";
import { globalWorkspace } from "../foundry/foWorkspace.model";

@Component({
  selector: 'fo-stage',
  templateUrl: './fo-stage.component.html',
  styleUrls: ['./fo-stage.component.css']
})
export class foStageComponent implements OnInit {
  
  @Input()
  public stage: foStage;

  constructor() { }

  ngOnInit() {
  }

  gotoStage(){
    globalWorkspace.studio.currentStage = this.stage;
  }
}
