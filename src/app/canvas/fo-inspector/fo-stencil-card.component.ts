import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";
import { foNode } from "../../foundry/foNode.model";
import { foKnowledge } from "../../foundry/foKnowledge.model";
import { Toast } from "../../common/emitter.service";


@Component({
  selector: 'fo-stencil-card',
  templateUrl: './fo-stencil-card.component.html',
  styleUrls: ['./fo-stencil-card.component.css']
})
export class foStencilCardComponent implements OnInit, AfterViewInit {
  lastCreated: foNode;
  showDetails = false;
  @ViewChild('canvas')
  public canvasRef: ElementRef;
  @Input()
  public concept: foKnowledge;

  @Input()
  public rootPage: foPage;

  constructor() { }


  ngOnInit() {
  }

  public ngAfterViewInit() {
    this.draw(this.canvasRef.nativeElement);
  }

  drawName(text: string, ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = '50pt Calibri';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'blue';
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
      .dropAt(this.rootPage.centerX, this.rootPage.centerY)
      .addAsSubcomponent(this.rootPage);

    Toast.info("Created", this.lastCreated.displayName)
  }

  doCommand(cmd: string) {
    this.lastCreated && this.lastCreated[cmd]();
  }

}
