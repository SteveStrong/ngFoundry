import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';

import { foNode } from "../foundry/foNode.model";
import { foKnowledge } from "../foundry/foKnowledge.model";
import { Toast } from "../common/emitter.service";

import { globalWorkspace, foWorkspace } from 'app/foundry/foWorkspace.model';

@Component({
  selector: 'fo-stencil-card',
  templateUrl: './fo-stencil-card.component.html',
  styleUrls: ['./fo-stencil-card.component.css']
})
export class foStencilCardComponent implements OnInit, AfterViewInit {
  lastCreated: foNode;
  showDetails = false;

  @Input()
  workspace: foWorkspace;

  @ViewChild('canvas')
  public canvasRef: ElementRef;
  @Input()
  public knowledge: foKnowledge;


  constructor() { }


  ngOnInit() {
    this.workspace = this.workspace || globalWorkspace;
  }

  public ngAfterViewInit() {
    this.draw(this.canvasRef.nativeElement);
  }

  drawName(text: string, ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = '20pt Calibri';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'blue';
    ctx.strokeText(text, 10, 50);
    ctx.restore();
  }

  draw(nativeElement: HTMLCanvasElement) {
    let canvas = nativeElement;
    let context = canvas.getContext("2d");

    this.drawName(this.knowledge.myName, context)
  }

  doToggleDetails() {
    this.showDetails = !this.showDetails;
  }

  doCreate() {
    let result;

    let page = this.workspace.activePage;
    let stage = this.workspace.activeStage;


    if (this.knowledge['run']) {
      let list = this.knowledge['run']();
      let names = list.map(element => {
        let target = element.is2D() ? page : stage;
        element.addAsSubcomponent(target);
        return element.displayName;
      });

      result = list[0];
      Toast.info("Created", names.join(','))
    } else {

      result = this.knowledge.newInstance().defaultName();
      
      if (result.is2D()) {
        result.dropAt(page.centerX, page.centerY)
        .addAsSubcomponent(page)
      } else {
        result.dropAt(stage.centerX, stage.centerY, stage.centerZ)
        .addAsSubcomponent(stage)
      }



      Toast.info("Created", result.displayName)
    }
    this.lastCreated = result;
  }

  doCommand(cmd: string) {
    this.lastCreated && this.lastCreated[cmd]();
  }

}
