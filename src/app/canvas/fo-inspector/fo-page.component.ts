import { Component, OnInit, Input } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";
import { globalWorkspace } from "../../foundry/foWorkspace.model";

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
    globalWorkspace.document.currentPage = this.page;
  }
}
