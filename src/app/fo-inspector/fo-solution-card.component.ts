import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';

import { Tools } from "../foundry/foTools";

import { foModel } from "../foundry/foModel.model";
import { foNode } from "../foundry/foNode.model";
import { foKnowledge } from "../foundry/foKnowledge.model";
import { Toast } from "../common/emitter.service";

@Component({
  selector: 'fo-solution-card',
  templateUrl: './fo-solution-card.component.html',
  styleUrls: ['./fo-solution-card.component.css']
})
export class foSolutionCardComponent implements OnInit {
  lastCreated: foNode;
  showDetails = false;

  @ViewChild('canvas')
  public canvasRef: ElementRef;
  @Input()
  public solution: foKnowledge;

  @Input()
  public model: foModel;

  constructor() { }

  ngOnInit() {
  }

  public ngAfterViewInit() {
    this.draw(this.canvasRef.nativeElement);
  }

  drawName(text: string, ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = '20pt Calibri';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'grey';
    //ctx.rotate(10)
    ctx.fillText(text, 10, 50);
    ctx.strokeText(text, 10, 50);
    ctx.restore();
  }

  draw(nativeElement: HTMLCanvasElement) {
    let canvas = nativeElement;
    let context = canvas.getContext("2d");

    this.drawName(this.solution.myName, context)
  }

  doToggleDetails() {
    this.showDetails = !this.showDetails;
  }

  doCreate() {
    let obj = this.solution.makeComponent(this.model).defaultName();

    Toast.info("Created", obj.displayName);
  }

}
