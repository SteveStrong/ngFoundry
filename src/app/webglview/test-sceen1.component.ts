import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Sceen3D } from "../foundryDrivers/threeDriver";

@Component({
  selector: 'app-test-sceen1',
  templateUrl: './test-sceen1.component.html',
  styleUrls: ['./test-sceen1.component.css']
})
export class TestSceen1Component implements OnInit {
  mySceen: Sceen3D = new Sceen3D();
  constructor(private vcr: ViewContainerRef) { 
    
  }

  ngOnInit(): void {
    this.mySceen.setRoot(this.vcr.element.nativeElement);
    this.mySceen.go();
  }

}
