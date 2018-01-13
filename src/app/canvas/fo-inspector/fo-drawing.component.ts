import { Component, OnInit, Input } from '@angular/core';

import { foDocument } from "../../foundry/foDocument.model";

@Component({
  selector: 'fo-drawing',
  templateUrl: './fo-drawing.component.html',
  styleUrls: ['./fo-drawing.component.css']
})
export class foDrawingComponent implements OnInit {
  @Input()
  public document: foDocument;

  constructor() { }

  ngOnInit() {
  }

}
