import { Component, OnInit, Input } from '@angular/core';

import { StageComponent } from "../stage.component";

import { RuntimeType } from 'app/foundry/foRuntimeType';


//https://valor-software.com/ngx-bootstrap/#/tabs


@Component({
  selector: 'fo-inspector',
  templateUrl: './fo-inspector.component.html',
  styleUrls: ['./fo-inspector.component.css']
})
export class foInspectorComponent implements OnInit {

  @Input()
  public stage: StageComponent;

  constructor() { }

  ngOnInit() {
  }

}
