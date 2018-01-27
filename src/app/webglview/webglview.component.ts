import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Screen3D } from "../foundry/solids/threeDriver";


@Component({
  selector: 'foundry-webglview',
  templateUrl: './webglview.component.html',
  styleUrls: ['./webglview.component.css']
})
export class WebglviewComponent implements OnInit {
  mySceen: Screen3D = new Screen3D();

  constructor(
    private vcr: ViewContainerRef) {  
  }

  ngOnInit(): void {
    this.mySceen.setRoot(this.vcr.element.nativeElement);
    this.mySceen.addBlock(100,400,900);
    this.mySceen.go();
  }
}
