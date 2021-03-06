import { Component, OnInit } from '@angular/core';

import { globalWorkspace, foWorkspace } from '../foundry/foWorkspace.model';
import { foModel } from '../foundry/foModel.model';

import { SharingService } from '../common/sharing.service';

import { Toast } from '../common/emitter.service';

import {
  DevSecOpsKnowledge,
  DevSecOpsShapes,
  DevSecOpsSolids
} from './devsecops.model';

@Component({
  selector: 'fo-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.css']
})
export class DomainComponent implements OnInit {
  workspace: foWorkspace = globalWorkspace;
  model: foModel;

  constructor() {}

  ngOnInit() {
    globalWorkspace.setName('Domain Model');
    this.workspace.stencil.add(DevSecOpsShapes);
    this.workspace.stencil.add(DevSecOpsSolids);
    this.workspace.library.add(DevSecOpsKnowledge);

    this.model = new foModel().defaultName('Domain Model');
    this.workspace.model.addItem('default', this.model);
  }

  doSave() {
    this.workspace.SaveInstanceAs(
      this.model,
      this.model.myName,
      '.json',
      result => {
        Toast.info('saved', result.filename);
      }
    );
  }

  doOpen() {
    this.workspace.openFile(result => {
      Toast.info('open', result.filename);
      this.workspace.reHydratePayload(result.payload);
    });
  }

  doClear() {
    this.model.clearAll();
  }
}
