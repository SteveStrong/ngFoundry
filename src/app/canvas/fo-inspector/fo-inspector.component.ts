import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";

@Component({
  selector: 'fo-inspector',
  templateUrl: './fo-inspector.component.html',
  styleUrls: ['./fo-inspector.component.css']
})
export class foInspectorComponent implements OnInit {

  @Input() public rootPage:foPage;

  constructor() { }

  ngOnInit() {
  }

}
