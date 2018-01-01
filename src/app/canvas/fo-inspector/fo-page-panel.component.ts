import { Component, OnInit, Input } from '@angular/core';

import { Tools } from "../../foundry/foTools";
import { foGlyph } from "../../foundry/foGlyph.model";

@Component({
  selector: 'fo-page-panel',
  templateUrl: './fo-page-panel.component.html',
  styleUrls: ['./fo-page-panel.component.css']
})
export class foPagePanelComponent implements OnInit {

  @Input()
  public node: foGlyph;
  
  constructor() { }

  ngOnInit() {
  }

}
