import { Component, OnInit, Input } from '@angular/core';

import { StageComponent } from "../stage.component";

@Component({
  selector: 'fo-command',
  templateUrl: './fo-command.component.html',
  styleUrls: ['./fo-command.component.css']
})
export class foCommandComponent implements OnInit {
  @Input()
  public stage: StageComponent;

  constructor() { }

  ngOnInit() {
  }

}
