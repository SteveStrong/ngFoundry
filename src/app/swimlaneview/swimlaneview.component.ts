import { Component, OnInit } from '@angular/core';
//import { SwimlaneComponent } from "./swimlane.component";

@Component({
  selector: 'foundry-swimlaneview',
  templateUrl: './swimlaneview.component.html',
  styleUrls: ['./swimlaneview.component.css']
})
export class SwimlaneviewComponent implements OnInit {

  graph = {
    width: 1800,
    height: 1000
  }

  circles = [
    { 'x': 15, 'y': 10, 'r': 3 },
    { 'x': 35, 'y': 60, 'r': 20 },
    { 'x': 55, 'y': 10, 'r': 4 },
  ];

  


  constructor() { }

  ngOnInit() {

    //this.style = this.sanitizer.bypassSecurityTrustStyle("stroke-width: 0px; background-color: blue; stroke:black; fill:blueviolet");
  }

}
