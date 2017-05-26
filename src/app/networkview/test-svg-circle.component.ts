import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: '[foundry-circle]',
  templateUrl: './test-svg-circle.component.html',
  styleUrls: ['./test-svg-circle.component.css']
})
export class TestSvgCircleComponent implements OnInit {
  height:number = 50;
  width:number = 75;
  isSelected:boolean = false;
  title:string = "hello";

  constructor() { }

  ngOnInit() {
  }

  doClick() {

  }

}
