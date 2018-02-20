import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../foundry/shapes/foPage.model";
import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";

@Component({
  selector: 'fo-page',
  templateUrl: './fo-page.component.html',
  styleUrls: ['./fo-page.component.css']
})
export class foPageComponent implements OnInit {
  
  @Input()
  public page: foPage;

  constructor() { }

  ngOnInit() {
  }

  gotoPage(){
    let space = this.page.myParent().myParent() as foWorkspace;
    globalWorkspace.document.currentPage = this.page;
  }
}
