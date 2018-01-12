import { Component, OnInit, Input } from '@angular/core';

//import { foObject } from "../../foundry/foObject.model"
import { foPage } from "../../foundry/foPage.model";
import { Tools } from "../../foundry/foTools";
import { foKnowledge } from "../../foundry/foKnowledge.model";
//import { foDictionary } from '../../foundry/foDictionary.model';
import { Workspace, foWorkspace } from "../../foundry/foWorkspace.model";

import { Stencil } from "../../foundry/foStencil";
import { Knowcycle } from "../../foundry/foLifecycle";

import { PubSub } from "../../foundry/foPubSub";
import { foCollection } from 'app/foundry/foCollection.model';

@Component({
  selector: 'fo-stencil',
  templateUrl: './fo-stencil.component.html',
  styleUrls: ['./fo-stencil.component.css']
})
export class foStencilComponent implements OnInit {
  rootWorkspace: foWorkspace = Workspace;
  concepts: foCollection<foKnowledge> = new foCollection<foKnowledge>()
  @Input()
  public rootPage: foPage;

  list:Array<foKnowledge> = new Array<foKnowledge>();
  headings: Array<string> = new Array<string>();
  groups: any = {};

  constructor() { }

  initViewModel() {
    this.list = Stencil.concepts.members;

    this.groups = Tools.groupBy(Tools.pluck('namespace'), this.list);
    this.headings = Stencil.namespaces();
  }

  ngOnInit() {
    this.initViewModel();
    Knowcycle.observable.subscribe(item => {
      this.initViewModel();
    });

    this.rootWorkspace.library.forEachKeyValue((key, lib)=>{
      lib.concepts.forEachKeyValue((name, con)=>{
        this.concepts.addMember(con);
      })
    });
    
    // PubSub.Sub("resStencil", (item)=> {
    //   this.rootWorkspace = item;
      
    //   this.rootWorkspace.library.forEachKeyValue((key, lib)=>{
    //     lib.concepts.forEachKeyValue((name, con)=>{
    //       this.concepts.addMember(con);
    //     })
    //   });

    // }).Pub("reqStencil", this);

  }



}
