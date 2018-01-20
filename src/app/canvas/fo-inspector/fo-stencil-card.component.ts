import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';

import { foPage } from "../../foundry/foPage.model";
import { foNode } from "../../foundry/foNode.model";
import { foKnowledge } from "../../foundry/foKnowledge.model";
import { Toast } from "../../common/emitter.service";

import { globalWorkspace } from 'app/foundry/foWorkspace.model';

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
  public knowledge: foKnowledge;


  constructor() { }


  ngOnInit() {
  }

  public ngAfterViewInit() {
    this.draw(this.canvasRef.nativeElement);
  }

  drawName(text: string, ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = '40pt Calibri';
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

    let page = globalWorkspace.activePage;
    let stage = globalWorkspace.activeStage;


    if ( this.knowledge['run'] ) {
      let list = this.knowledge['run']();
      let names = list.map(element => {
        element.addAsSubcomponent(page);
        return element.displayName;
      });

      result = list[0];
      Toast.info("Created", names.join(','))
    } else {
      result = this.knowledge.newInstance().defaultName();

      if ( result.is2D() ) {
        result.dropAt(page.centerX, page.centerY)
        .addAsSubcomponent(page);

        this.knowledge.usingRuntimeType('foGlyph3D', concept => {
          result = concept.newInstance(result.asJson)
          result.dropAt(stage.centerX, stage.centerY)
          .addAsSubcomponent(stage);
        })

      }
      if ( result.is3D() ) {
        result.dropAt(stage.centerX, stage.centerY)
        .addAsSubcomponent(stage);
        
      }
  
      Toast.info("Created", result.displayName)
    }
    this.lastCreated = result;
  }

  doCommand(cmd: string) {
    this.lastCreated && this.lastCreated[cmd]();
  }

}
