import { Component, OnInit } from '@angular/core';

import { Sceen3D } from "../foundryDrivers/threeDriver";

@Component({
  selector: 'app-test1',
  templateUrl: './test1.component.html',
  styleUrls: ['./test1.component.css']
})
export class Test1Component implements OnInit {
  mySceen: Sceen3D = new Sceen3D();

  constructor() { }

  ngOnInit() {
    this.mySceen.init('drawsceen');
    this.mySceen.go();
  }

}
