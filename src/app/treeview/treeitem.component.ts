import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'foundry-treeitem',
  templateUrl: './treeitem.component.html',
  styleUrls: ['./treeitem.component.css']
})
export class TreeitemComponent implements OnInit {

  graph = {
    width: 800,
    height: 600
  }

  circles = [
    { 'x': 15, 'y': 10, 'r': 3 },
    { 'x': 35, 'y': 60, 'r': 20 },
    { 'x': 55, 'y': 10, 'r': 4 },
  ]


  constructor() { }

  ngOnInit() {
  }

}
