import { Component, OnInit } from '@angular/core';

import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";
import { foPage } from "../foundry/shapes/foPage.model";
import { foModel } from "../foundry/foModel.model";


import { SharingService } from "../common/sharing.service";
import { DevSecOps, DevSecOpsShapes, DevSecOpsSolids } from "./devsecops.model";


@Component({
  selector: 'fo-devsecops',
  templateUrl: './devsecops.component.html',
  styleUrls: ['./devsecops.component.css']
})
export class DevSecOpsComponent implements OnInit {

  workspace: foWorkspace = DevSecOps;
  model: foModel;
  
  constructor(
    private sharing: SharingService) {
  }

  ngOnInit() {
  }

}
