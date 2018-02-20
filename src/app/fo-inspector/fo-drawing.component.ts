import { Component, OnInit, Input } from '@angular/core';

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";
import { foDocument } from "../foundry/shapes/foDocument.model";

@Component({
  selector: 'fo-drawing',
  templateUrl: './fo-drawing.component.html',
  styleUrls: ['./fo-drawing.component.css']
})
export class foDrawingComponent implements OnInit {
  @Input()
  workspace: foWorkspace;
  public document: foDocument;

  constructor() { }

  ngOnInit() {
    this.workspace = this.workspace || globalWorkspace;

    this.document = this.workspace.document;
  }

}
