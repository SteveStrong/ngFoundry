import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Diagram } from "../foundryDrivers/diagramDriver";

import { DockerecosystemModel } from './dockerecosystem.model'
import { DockerecosystemService } from "./dockerecosystem.service";



@Component({
  selector: 'foundry-dockerecosystem',
  templateUrl: './dockerecosystem.component.html',
  styleUrls: ['./dockerecosystem.component.css']
})
export class DockerecosystemComponent implements OnInit {
  myDiagram: Diagram = new Diagram();
  myModel: DockerecosystemModel = new DockerecosystemModel();

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



    let nodes = [];
    let links = [];
    let nodeDef = this.myModel.nodeDef;

    for (var i = 0; i < 2; i++) {
      var obj = nodeDef.newInstance({
        index: i,
        id: function () { return "Hello all " + this.myGuid }
      });
      nodes.push(obj);
    }


    console.log(nodes);
    // this.myDiagram.renderDiagram(
    //   nodes, (i) => { 
    //     return this.myModel.doGeom(i) 
    //   },
    //   links, _ => { }
    // );

  }

}
