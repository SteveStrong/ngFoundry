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

  size = {
    width: 250,
    gap: 10,
    height: 1000
  }

  constructor(private vcr: ViewContainerRef) { }

  ngOnInit() {
    var root = this.vcr.element.nativeElement;
    root.setAttribute("transform", this.viewModel.translate());
  }

  private error(message, title?) {
    let toast = {
      title: title || '',
      message: message
    }
    EmitterService.get("SHOWERROR").emit(toast);
  }


  doClick() {
    this.error("error message", this.viewModel['title'])
  }

}
