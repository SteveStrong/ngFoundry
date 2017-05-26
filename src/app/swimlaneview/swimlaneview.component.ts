import { Component, OnInit, Input, ViewContainerRef, ViewChild } from '@angular/core';

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

  SVGDocument = null;

  SVGDrawing = null;
  SVGRoot = null;

  TrueCoords = null;
  GrabPoint = null;
  BackDrop = null;
  DragTarget = null;

  circle = [
    { 'x': 105, 'y': 10, 'r': 30 },
    { 'x': 305, 'y': 60, 'r': 20 },
    { 'x': 505, 'y': 10, 'r': 40 },
  ];



  constructor(private vcr: ViewContainerRef, private service?: SwimService) { }

  ngOnInit() {
    this.SVGDocument = this.vcr.element.nativeElement as HTMLElement;
    this.SVGDrawing = this.SVGDocument.querySelector('#drawing')
    this.SVGRoot = this.SVGDocument.querySelector('#page')


    // these svg points hold x and y values...
    //    very handy, but they do not display on the screen (just so you know)
    this.TrueCoords = this.SVGRoot.createSVGPoint();
    this.GrabPoint = this.SVGRoot.createSVGPoint();

    this.viewModel = this.service.getRootView()

    this.service && this.service.getEcosystem(result => {
      this.viewModel = result;
    });

    EmitterService.get("RECOMPUTE").subscribe(_ => {
      this.viewModel.refresh();
      //this.swimLanes.forEach(item => {
      //  item.refresh()
    });

  }

  Grab(evt) {
    // find out which element we moused down on
    var targetElement = evt.target;
    targetElement = targetElement.parentNode;

    // you cannot drag the background itself, so ignore any attempts to mouse down on it
    if (this.BackDrop != targetElement) {
       this.GetTrueCoords(evt);
      //set the item moused down on as the element to be dragged
      this.DragTarget = targetElement;
     


      // move this element to the "top" of the display, so it is (almost)
      //    always over other elements (exception: in this case, elements that are
      //    "in the folder" (children of the folder group) with only maintain
      //    hierarchy within that group
      //this.DragTarget.parentNode.appendChild(this.DragTarget);

      // turn off all pointer events to the dragged element, this does 2 things:
      //    1) allows us to drag text elements without selecting the text
      //    2) allows us to find out where the dragged element is dropped (see Drop)
      this.DragTarget.setAttributeNS(null, 'pointer-events', 'none');

      // we need to find the current position and translation of the grabbed element,
      //    so that we only apply the differential between the current location
      //    and the new location
      var transMatrix = this.DragTarget.getCTM();
      this.GrabPoint.x = this.TrueCoords.x - Number(transMatrix.e);
      this.GrabPoint.y = this.TrueCoords.y - Number(transMatrix.f);

    }
  };

  Drag(evt) {
    // account for zooming and panning
    this.GetTrueMoveCoords(evt);

    // if we don't currently have an element in tow, don't do anything
    if (this.DragTarget) {
      // account for the offset between the element's origin and the
      //    exact place we grabbed it... this way, the drag will look more natural
      var newX = this.TrueCoords.x - this.GrabPoint.x;
      var newY = this.TrueCoords.y - this.GrabPoint.y;

      // apply a new tranform translation to the dragged element, to display
      //    it in its new location
      this.DragTarget.setAttributeNS(null, 'transform', 'translate(' + newX + ',' + newY + ')');
    }
  };

  Drop(evt) {
    // if we aren't currently dragging an element, don't do anything
    if (this.DragTarget) {
      // since the element currently being dragged has its pointer-events turned off,
      //    we are afforded the opportunity to find out the element it's being dropped on
      var targetElement = evt.target;

      // turn the pointer-events back on, so we can grab this item later
      this.DragTarget.setAttributeNS(null, 'pointer-events', 'all');

        // for this example, you cannot drag an item out of the folder once it's in there;
        //    however, you could just as easily do so here
        console.log(this.DragTarget.id + ' has been dropped on top of ' + targetElement.id);
 

      // set the global variable to null, so nothing will be dragged until we
      //    grab the next element
      this.DragTarget = null;
    }
  };

  //https://www.sitepoint.com/how-to-translate-from-dom-to-svg-coordinates-and-back-again/
  GetTrueCoords(evt) {
    // find the current zoom level and pan setting, and adjust the reported
    //    mouse position accordingly
    var top = this.SVGDrawing.offsetTop;
    var left = this.SVGDrawing.offsetLeft;
    var newScale = this.SVGRoot.currentScale;
    var translation = this.SVGRoot.currentTranslate;
    this.TrueCoords.x = (evt.clientX - translation.x + left) / newScale;
    this.TrueCoords.y = (evt.clientY - translation.y + top) / newScale;
  };

  GetTrueMoveCoords(evt) {
    // find the current zoom level and pan setting, and adjust the reported
    //    mouse position accordingly
    var newScale = this.SVGRoot.currentScale;
    var translation = this.SVGRoot.currentTranslate;
    this.TrueCoords.x = (evt.clientX - translation.x) / newScale;
    this.TrueCoords.y = (evt.clientY - translation.y) / newScale;
  };

  addCircle(evt) {
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); //Create a path in SVG's namespace
    newElement.setAttribute("cx", '50');
    newElement.setAttribute("cy", '50');
    newElement.setAttribute("r", '50');
    newElement.setAttribute("style", 'fill:green; ');
    this.SVGRoot.appendChild(newElement);
  }
}
