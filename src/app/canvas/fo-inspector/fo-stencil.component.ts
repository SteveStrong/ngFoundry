import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";
import { Tools } from "../../foundry/foTools";
import { Stencil } from "../../foundry/foStencil";
import { PubSub } from "../../foundry/foPubSub";

import { SignalRService } from "../../common/signalr.service";

@Component({
  selector: 'fo-stencil',
  templateUrl: './fo-stencil.component.html',
  styleUrls: ['./fo-stencil.component.css']
})
export class foStencilComponent implements OnInit {
  @Input()
  public rootPage: foPage;

  list: Array<any> = new Array<any>();
  headings: Array<string> = new Array<string>();
  groups: any = {};

  constructor(private signalR: SignalRService) { }

  initViewModel() {
    this.list = Stencil.allSpecifications();

    this.groups = Tools.groupBy(Tools.pluck('namespace'), this.list);
    this.headings = Stencil.namespaces();

    // this.list.forEach(item => {
    //   let list = Tools.getMethods(item.pr).filter( method => {
    //     return method.name.startsWith("do");
    //   });
    // })

   // alert(JSON.stringify(list,undefined,3))
  }

  ngOnInit() {
    this.initViewModel();
    PubSub.Sub('onStencilChanged', () => {
      this.initViewModel();
    });

  }

  doCreate(item) {
    let spec = item.spec;
    let box = spec.newInstance()
      .drop(this.rootPage.centerX, this.rootPage.centerY)
      .addAsSubcomponent(this.rootPage);

    this.signalR.pubCommand("syncShape", { guid: box.myGuid }, box.asJson);

  }

}
