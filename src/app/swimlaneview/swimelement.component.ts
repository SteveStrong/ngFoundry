import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';
import { foConcept } from "../foundry/foConcept.model";

import { EmitterService } from '../common/emitter.service';
//http://stackoverflow.com/questions/32211013/how-can-i-nest-directives-that-render-svg-in-angular-2

function makeTransform(dx: number, dy: number, s: number = 0) {
    if (s) {
        return `translate(${dx},${dy}) scale (${s})`
    }
    return `translate(${dx},${dy})`
}

@Component({
  selector: '[foundry-swimelement]',
  templateUrl: './swimelement.component.html',
  styleUrls: ['./swimelement.component.css']
})
export class SwimelementComponent implements OnInit {
  displayText = "Steve";
  @Input() myIndex:number = 0;
  @Input() Spec = { 'x': 0, 'y': 10, 'name': "Mike" }
  
  size = {
    width: 240,
    gap:5,
    height: 90
  }

  constructor(private vcr: ViewContainerRef) { }

  ngOnInit() {
    var root = this.vcr.element.nativeElement;
    this.displayText = this.Spec.name;
    var yLoc = this.size.gap + (this.size.height + this.size.gap) * this.myIndex;
    root.setAttribute("transform", makeTransform(this.size.gap, yLoc));
  }

    private info(message, title?) {
    let toast = {
      title: title || '',
      message: message
    }
    EmitterService.get("SHOWINFO").emit(toast);
  }

  doToast(): void {
    this.info("info message","my title")
  }

  doClick() {
    this.doToast();
  }

}
