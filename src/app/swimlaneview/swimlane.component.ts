import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';
import { svgShapeView } from "./swim.model";

import { Toast } from '../common/emitter.service';

//http://stackoverflow.com/questions/32211013/how-can-i-nest-directives-that-render-svg-in-angular-2


@Component({
  selector: '[foundry-swimlane]',
  templateUrl: './swimlane.component.html',
  styleUrls: ['./swimlane.component.css']
})
export class SwimlaneComponent implements OnInit {
  @Input() viewModel: svgShapeView;


  constructor(private vcr: ViewContainerRef) { }

  ngOnInit() {
    var root = this.vcr.element.nativeElement;
    root.setAttribute("transform", this.viewModel.translate(root));
  }


  doClick() {
    this.viewModel.toggleSelected();
    Toast.success("render this", this.viewModel['title'])
  }

}
