import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Diagram } from "../foundryDrivers/diagramDriver";

import { DockerecosystemModel } from './dockerecosystem.model'
import { DockerecosystemService } from "./dockerecosystem.service";

//https://hacks.mozilla.org/2014/11/interact-js-for-drag-and-drop-resizing-and-multi-touch-gestures/
import * as interact from 'interactjs';

function getWindow(): any {
  return window;
}

function dragMoveListener(event) {
  var target = event.target,
    // keep the dragged position in the data-x/data-y attributes
    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  // translate the element
  target.style.webkitTransform =
    target.style.transform =
    'translate(' + x + 'px, ' + y + 'px)';

  // update the posiion attributes
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}

// this is used later in the resizing and gesture demos
getWindow().dragMoveListener = dragMoveListener;

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

    // target elements with the "draggable" class
    // interact('.draggable')
    //   .draggable({
    //     // enable inertial throwing
    //     inertia: true,
    //     // keep the element within the area of it's parent
    //     restrict: {
    //       restriction: "parent",
    //       endOnly: true,
    //       elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    //     },
    //     // enable autoScroll
    //     autoScroll: true,

    //     // call this function on every dragmove event
    //     onmove: dragMoveListener,
    //     // call this function on every dragend event
    //     onend: function (event) {
    //       var textEl = event.target.querySelector('p');

    //       textEl && (textEl.textContent =
    //         'moved a distance of '
    //         + (Math.sqrt(event.dx * event.dx +
    //           event.dy * event.dy) | 0) + 'px');
    //     }
    //   });






  }

}
