import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';

//http://stackoverflow.com/questions/32211013/how-can-i-nest-directives-that-render-svg-in-angular-2

function makeTransform(dx: number, dy: number, s: number = 0) {
    if (s) {
        return `translate(${dx},${dy}) scale (${s})`
    }
    return `translate(${dx},${dy})`
}


@Component({
  selector: '[foundry-swimlane]',
  templateUrl: './swimlane.component.html',
  styleUrls: ['./swimlane.component.css']
})
export class SwimlaneComponent implements OnInit {
  displayText = "Steve";
  @Input() myIndex:number = 0;
  @Input() Spec = { 'x': 0, 'y': 10, 'name': "Mike" }

  size = {
    width: 250,
    gap:10,
    height: 1000
  }



  constructor(private vcr: ViewContainerRef) { }

  ngOnInit() {
    var root = this.vcr.element.nativeElement;
    this.displayText = this.Spec.name;
    var xLoc = 100 + (this.size.width + this.size.gap) * this.myIndex;
    root.setAttribute("transform", makeTransform(xLoc, this.Spec.y));
  }

}
