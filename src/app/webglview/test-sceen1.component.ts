import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Screen3D } from "../foundryDrivers/threeDriver";

@Component({
  selector: 'foundry-test-sceen1',
  templateUrl: './test-sceen1.component.html',
  styleUrls: ['./test-sceen1.component.css']
})
export class TestSceen1Component implements OnInit {
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
