import { Component, OnInit, Input, ViewContainerRef, NgZone } from '@angular/core';

import { SwimService } from "../swimlaneview/swim.service";
import { svgShapeView } from "./swim.model";
import { EmitterService } from '../common/emitter.service';

@Component({
  selector: 'foundry-swimlaneview',
  templateUrl: './swimlaneview.component.html',
  styleUrls: ['./swimlaneview.component.css']
})
export class SwimlaneviewComponent implements OnInit {
  viewModel: svgShapeView;

  circles = [
    { 'x': 105, 'y': 10, 'r': 30 },
    { 'x': 305, 'y': 60, 'r': 20 },
    { 'x': 505, 'y': 10, 'r': 40 },
  ];



  constructor(private vcr: ViewContainerRef, private service: SwimService, private zone: NgZone) { }

  ngOnInit() {
    this.viewModel = this.service.getRootView()

    this.service.getEcosystem(result => {
      this.viewModel = result;
    });

    EmitterService.get("RECOMPUTE").subscribe(_ => {
      this.viewModel.refresh();
      //this.swimLanes.forEach(item => {
      //  item.refresh()
    });

  }
}
