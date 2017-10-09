import { Component, OnInit, Input, ViewChild, ViewContainerRef } from '@angular/core';

import { svgShapeView } from "./swim.model";
import { Toast, EmitterService } from '../common/emitter.service';

//http://stackoverflow.com/questions/32211013/how-can-i-nest-directives-that-render-svg-in-angular-2


@Component({
  selector: '[foundry-swimelement]',
  templateUrl: './swimelement.component.html',
  styleUrls: ['./swimelement.component.css']
})
export class SwimelementComponent implements OnInit {
  @Input() viewModel: svgShapeView;
  ///@ViewChild('display') svgText;
  

  constructor(private vcr: ViewContainerRef) { }

  ngOnInit() {
    var root = this.vcr.element.nativeElement;
    root.setAttribute("transform", this.viewModel.translate(root));
  }


  doClick() {
    this.viewModel.toggleSelected();
    this.viewModel['width'] += this.viewModel['gap'];
    this.viewModel['height'] += this.viewModel['gap'];
    Toast.info("info message", this.viewModel['name']);

    EmitterService.get("RECOMPUTE").emit();
  }

}
