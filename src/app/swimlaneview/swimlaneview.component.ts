import { Component, OnInit, Input, ViewContainerRef, NgZone } from '@angular/core';

import { SwimService } from "../swimlaneview/swim.service";
import { SwimLaneView } from "./swim.model";
import { EmitterService } from '../common/emitter.service';

@Component({
  selector: 'foundry-swimlaneview',
  templateUrl: './swimlaneview.component.html',
  styleUrls: ['./swimlaneview.component.css']
})
export class SwimlaneviewComponent implements OnInit {
  swimLanes: SwimLaneView[];

  graph = {
    width: 1800,
    height: 600
  }


  circles = [
    { 'x': 105, 'y': 10, 'r': 30 },
    { 'x': 305, 'y': 60, 'r': 20 },
    { 'x': 505, 'y': 10, 'r': 40 },
  ];



  constructor(private vcr: ViewContainerRef, private service: SwimService, private zone: NgZone) { }

  ngOnInit() {
    this.swimLanes = this.service.getSwimLanes();

    EmitterService.get("RECOMPUTE").subscribe(_ => {
      this.swimLanes.forEach(item => {
        item.refresh()
      })

    });
  }

}
