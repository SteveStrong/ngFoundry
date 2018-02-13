import { Component, OnInit } from '@angular/core';

import { foLibrary } from 'app/foundry/foLibrary.model';

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";



@Component({
  selector: 'fo-stencil',
  templateUrl: './fo-stencil.component.html',
  styleUrls: ['./fo-stencil.component.css']
})
export class foStencilComponent implements OnInit {
  rootWorkspace: foWorkspace = globalWorkspace;
  stencils:Array<foLibrary> = new Array<foLibrary>();

  constructor() { }

  ngOnInit() {
    this.stencils = this.rootWorkspace.stencil.members;
  }
}
