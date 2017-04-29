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

  trans = "transform(300, 0)"

  circles = [
    { 'x': 105, 'y': 10, 'r': 30 },
    { 'x': 305, 'y': 60, 'r': 20 },
    { 'x': 505, 'y': 10, 'r': 40 },
  ];

  lanes = [
    { 'x': 0, 'y': 10, 'name': "Steveii9" },
    { 'x': 300, 'y': 30, 'name': "Stu"  },
    { 'x': 600, 'y':10, 'name': "Don" },
     { 'x': 900, 'y':10, 'name': "Debra" },
  ];

  doMove(obj) {
    var result =  `${obj.x}  ${obj.y}`;
    return result;
  }



  constructor() { }

  ngOnInit() {

    //this.style = this.sanitizer.bypassSecurityTrustStyle("stroke-width: 0px; background-color: blue; stroke:black; fill:blueviolet");
  }

}
