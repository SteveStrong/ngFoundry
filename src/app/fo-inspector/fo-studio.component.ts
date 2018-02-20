import { Component, OnInit, Input } from '@angular/core';

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";
import { foStudio } from "../foundry/solids/foStudio.model";

@Component({
  selector: 'fo-studio',
  templateUrl: './fo-studio.component.html',
  styleUrls: ['./fo-studio.component.css']
})
export class foStudioComponent implements OnInit {
  @Input()
  workspace: foWorkspace;
  public studio: foStudio;

  constructor() { }

  ngOnInit() {
    this.workspace = this.workspace || globalWorkspace;

    this.studio = this.workspace.studio;
  }

}
