import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';
import { SwimService } from "./swim.service";
import { SwimDictionary, SwimDef, SwimView } from "./swim.model";

import { EmitterService } from '../common/emitter.service';

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
  titleText = "new title";
  elements:SwimView[];

  @Input() myIndex: number = 0;
  @Input() Spec = {  'name': "Mike" }

  size = {
    width: 250,
    gap: 10,
    height: 1000
  }

  constructor(private vcr: ViewContainerRef, private service: SwimService) { }

  ngOnInit() {
    var root = this.vcr.element.nativeElement;
    var xLoc = 100 + (this.size.width + this.size.gap) * this.myIndex;
    root.setAttribute("transform", makeTransform(xLoc, 0));

    this.elements = this.service.getModel();
  }

  private error(message, title?) {
    let toast = {
      title: title || '',
      message: message
    }
    EmitterService.get("SHOWERROR").emit(toast);
  }


  doClick() {
    this.error("error message")
  }

}
