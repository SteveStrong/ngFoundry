import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';

import { Tools } from "../../foundry/foTools";

import { foModel } from "../../foundry/foModel.model";
import { foNode } from "../../foundry/foNode.model";
import { foKnowledge } from "../../foundry/foKnowledge.model";
import { Toast } from "../../common/emitter.service";

import { globalWorkspace } from "../../foundry/foWorkspace.model";

@Component({
  selector: 'fo-concept-card',
  templateUrl: './fo-concept-card.component.html',
  styleUrls: ['./fo-concept-card.component.css']
})
export class foConceptCardComponent implements OnInit, AfterViewInit {
  lastCreated: foNode;
  showDetails = false;

  @ViewChild('canvas')
  public canvasRef: ElementRef;
  @Input()
  public concept: foKnowledge;

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
    ctx.font = '30pt Calibri';
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

    this.drawName(this.concept.myName, context)
  }

  doToggleDetails() {
    this.showDetails = !this.showDetails;
  }

  doCreate() {
    this.lastCreated = this.concept.newInstance().defaultName()
      .addAsSubcomponent(this.model);

    Toast.info("Created", this.lastCreated.displayName);

    let found = globalWorkspace.stencil.select(item => {
      return Tools.matches(item.myName, 'text');
    }).first();



    let shape = found.newInstance({
      myGuid: this.lastCreated.myGuid,
      context: this.lastCreated.displayName,
      fontSize: 40,
      x: 400,
      y: 400,
    });
    //foObject.jsonAlert(shape);
    globalWorkspace.activePage.addSubcomponent(shape);

  }

  doCommand(cmd: string) {
    this.lastCreated && this.lastCreated[cmd]();
  }

}
