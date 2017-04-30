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
    { 'x': 105, 'y': 10, 'r': 30 },
    { 'x': 305, 'y': 60, 'r': 20 },
    { 'x': 505, 'y': 10, 'r': 40 },
  ];

  lanes = [
    { 'x': 10, 'y': 10, 'name': "Steve" },
    // { 'x': 300, 'y': 30, 'name': "Stu"  },
    // { 'x': 600, 'y':10, 'name': "Don" },
    //  { 'x': 900, 'y':10, 'name': "Debra" },
  ];


  constructor() { }

  ngOnInit() {

    //this.style = this.sanitizer.bypassSecurityTrustStyle("stroke-width: 0px; background-color: blue; stroke:black; fill:blueviolet");
  }

}
