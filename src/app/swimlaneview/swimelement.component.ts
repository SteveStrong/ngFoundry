import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';
import { SwimDictionary, SwimDef, SwimView } from "./swim.model";

import { EmitterService } from '../common/emitter.service';
//http://stackoverflow.com/questions/32211013/how-can-i-nest-directives-that-render-svg-in-angular-2


@Component({
  selector: '[foundry-swimelement]',
  templateUrl: './swimelement.component.html',
  styleUrls: ['./swimelement.component.css']
})
export class SwimelementComponent implements OnInit {
  @Input() viewModel:SwimView;


  constructor(private vcr: ViewContainerRef) { }

  ngOnInit() {
    var root = this.vcr.element.nativeElement;
    root.setAttribute("transform", this.viewModel.translate());
  }

  private info(message, title?) {
    let toast = {
      title: title || '',
      message: message
    }
    EmitterService.get("SHOWINFO").emit(toast);
  }


  doClick() {
    this.info("info message", this.viewModel['name'])
  }

}
