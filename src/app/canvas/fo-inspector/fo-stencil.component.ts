import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";
import { foLibrary } from 'app/foundry/foLibrary.model';

import { globalWorkspace, foWorkspace } from "../../foundry/foWorkspace.model";



@Component({
  selector: 'fo-stencil',
  templateUrl: './fo-stencil.component.html',
  styleUrls: ['./fo-stencil.component.css']
})
export class foStencilComponent implements OnInit {
  rootWorkspace: foWorkspace = globalWorkspace;
  list:Array<foLibrary> = new Array<foLibrary>();

  constructor() { }

  ngOnInit() {
    this.list = this.rootWorkspace.stencil.members;
  }
}
