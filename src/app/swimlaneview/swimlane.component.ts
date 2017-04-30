import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';
import { SwimLaneView } from "./swim.model";

import { EmitterService } from '../common/emitter.service';

//http://stackoverflow.com/questions/32211013/how-can-i-nest-directives-that-render-svg-in-angular-2


@Component({
  selector: '[foundry-swimlane]',
  templateUrl: './swimlane.component.html',
  styleUrls: ['./swimlane.component.css']
})
export class SwimlaneComponent implements OnInit {
  @Input() viewModel: SwimLaneView;


  constructor(private vcr: ViewContainerRef) { }

  ngOnInit() {
    var root = this.vcr.element.nativeElement;
    root.setAttribute("transform", this.viewModel.translate(root));
  }


  doClick() {
    this.viewModel.toggleSelected();
    EmitterService.success("render this", this.viewModel['title'])
  }

}
