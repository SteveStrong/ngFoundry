import { Component, OnInit, Input } from '@angular/core';

import { foGlyph } from "../../foundry/foGlyph.model";

@Component({
  selector: 'fo-panel',
  templateUrl: './fo-panel.component.html',
  styleUrls: ['./fo-panel.component.css']
})
export class foPanelComponent implements OnInit {

  @Input() public node:foGlyph;

  constructor() { }

  ngOnInit() {
  }

}
