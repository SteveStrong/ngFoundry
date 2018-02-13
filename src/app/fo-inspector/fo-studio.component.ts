import { Component, OnInit } from '@angular/core';

import { globalWorkspace } from "../foundry/foWorkspace.model";
import { foStudio } from "../foundry/solids/foStudio.model";

@Component({
  selector: 'fo-studio',
  templateUrl: './fo-studio.component.html',
  styleUrls: ['./fo-studio.component.css']
})
export class foStudioComponent implements OnInit {

  public studio: foStudio;

  constructor() { }

  ngOnInit() {
    this.studio = globalWorkspace.studio;
  }

}
