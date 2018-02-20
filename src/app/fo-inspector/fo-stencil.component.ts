import { Component, OnInit, Input } from '@angular/core';

import { foLibrary } from 'app/foundry/foLibrary.model';

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";



@Component({
  selector: 'fo-stencil',
  templateUrl: './fo-stencil.component.html',
  styleUrls: ['./fo-stencil.component.css']
})
export class foStencilComponent implements OnInit {
  @Input()
  workspace: foWorkspace;

  stencils:Array<foLibrary> = new Array<foLibrary>();

  constructor() { }

  ngOnInit() {
    this.workspace = this.workspace || globalWorkspace;
    
    this.stencils = this.workspace.stencil.members;
  }
}
