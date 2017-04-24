import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Diagram } from "../foundryDrivers/diagramDriver";

import { foConcept } from '../foundry/foConcept.model'

import { DockerecosystemService } from "./dockerecosystem.service";


function makeTransform(dx: number, dy: number, s: number = 0) {
  if (s) {
    return `translate(${dx},${dy}) scale (${s})`
  }
  return `translate(${dx},${dy})`
}


@Component({
  selector: 'foundry-dockerecosystem',
  templateUrl: './dockerecosystem.component.html',
  styleUrls: ['./dockerecosystem.component.css']
})
export class DockerecosystemComponent implements OnInit {
  myDiagram: Diagram = new Diagram();

  constructor(private vcr: ViewContainerRef, private service: DockerecosystemService) {

  }


  scaleOut() {
    // this.scale -= this.scaleFactor;
    // this.Tx -= this.scaleFactor * this.width / 2;
    // this.Ty -= this.scaleFactor * this.height / 2;
    // this.svgRoot
    //   .attr("transform", makeTransform(this.Tx, this.Ty, this.scale))
    //   .attr("width", this.width / this.scale)
    //   .attr("height", this.height / this.scale)
  }

  scaleIn() {
    // this.scale += this.scaleFactor;
    // this.Tx += this.scaleFactor * this.width / 2;
    // this.Ty += this.scaleFactor * this.height / 2;
    // this.svgRoot
    //   .attr("transform", makeTransform(this.Tx, this.Ty, this.scale))
    //   .attr("width", this.width / this.scale)
    //   .attr("height", this.height / this.scale)
  }


  // zoomListener = d3.behavior.zoom()
  //   .scaleExtent([0.1, 3])
  //   .on("zoom", zoomHandler);

  ngOnInit() {

    this.myDiagram.setRoot(this.vcr.element.nativeElement)

    // this.service.getEcosystem()
    //   .subscribe(res => {
    //     let graph = res.json();

    //     this.myDiagram.renderGraph(graph);
    //   })


    let test1 = {
      "nodes": [
        { "id": "Myriel", "group": 1 },
        { "id": "Napoleon", "group": 1 },
        { "id": "Mlle.Baptistine", "group": 1 },
        { "id": "Fameuil", "group": 3 }
      ],
      "links": [
        { "source": "Napoleon", "target": "Myriel", "value": 1 }
      ]
    }

    this.myDiagram.renderGraph(test1);

    let nodeDef = new foConcept({
      id: "steve",
      group: 1,
    });

    let test2 = {
      nodes: [],
      links: []
    }

    test2.nodes.push(nodeDef.newInstance({
      id: function() { return  "Hello all " + this.myGuid }
    }))

    console.log(test2);
    this.myDiagram.renderGraph(test2);

  }

}
