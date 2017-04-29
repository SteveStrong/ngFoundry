import { Component, OnInit, Input } from '@angular/core';

//http://stackoverflow.com/questions/32211013/how-can-i-nest-directives-that-render-svg-in-angular-2

@Component({
  selector: '[foundry-swimlane]',
  templateUrl: './swimlane.component.html',
  styleUrls: ['./swimlane.component.css']
})
export class SwimlaneComponent implements OnInit {
  @Input() text = "Steve"

  size = {
    width: 250,
    height: 1000
  }



  constructor() { }

  ngOnInit() {
  }

}
