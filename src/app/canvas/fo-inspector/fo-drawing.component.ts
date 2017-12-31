import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";

@Component({
  selector: 'fo-drawing',
  templateUrl: './fo-drawing.component.html',
  styleUrls: ['./fo-drawing.component.css']
})
export class foDrawingComponent implements OnInit {
  @Input()
  public rootPage: foPage;

  constructor() { }

  ngOnInit() {
  }

}
