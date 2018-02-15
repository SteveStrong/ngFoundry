
import { foLibrary } from "../foundry/foLibrary.model";
import { foStencilLibrary } from "../foundry/foStencil";
import { foWorkspace } from "../foundry/foWorkspace.model";
import { foComponent } from "../foundry/foComponent.model";
import { foModel } from "../foundry/foModel.model";
import { foImage2D } from "../foundry/shapes/foImage2D.model";
import { foShape3D } from "../foundry/solids/foShape3D.model";
import { foShape2D } from "./particle.model";

import { iPoint2D } from '../foundry/foInterface';
import { foGlyph2D } from '../foundry/shapes/foGlyph2D.model';

export let DevSecOpsKnowledge: foLibrary = new foLibrary().defaultName('definitions');
export let DevSecOpsShapes: foStencilLibrary = new foStencilLibrary().defaultName('shapes');
export let DevSecOpsSolids: foStencilLibrary = new foStencilLibrary().defaultName('solids');
export let DevSecOps: foWorkspace = new foWorkspace().defaultName('Dev Sec Ops');

DevSecOps.library.add(DevSecOpsKnowledge);
DevSecOps.stencil.add(DevSecOpsShapes);
DevSecOps.stencil.add(DevSecOpsSolids);

DevSecOps.context.define('DevOpsFactory', foModel, {
  title: 'Understand DevSecOps',
  subtitle: 'Strutured Flexability'
})

DevSecOpsShapes.define<foImage2D>('Image', foImage2D, {
  background: 'green',
  imageURL: "https://lorempixel.com/900/500?r=2",
  width: 400,
  height: 250
});

class shapeDevOps extends foShape2D {
  public drawSelected = (ctx: CanvasRenderingContext2D): void => {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    this.drawOutline(ctx);
    //this.drawHandles(ctx);
    //this.drawConnectionPoints(ctx);
    this.drawPin(ctx);
  }

  findObjectUnderPoint(hit: iPoint2D, deep: boolean): foGlyph2D {
    let found: foGlyph2D = this.hitTest(hit) ? this : undefined;

    // if (deep) {
    //     let child = this.findChildObjectUnderPoint(hit);
    //     found = child ? child : found;
    // }
    return found;
  }
}

let core = DevSecOpsShapes.mixin('core', {
  color: 'blue',
  opacity: .5,
  width: 50,
  height: 50
});

class shapeUI extends shapeDevOps {

  drawTriangle(ctx: CanvasRenderingContext2D, x1, y1, x2, y2, x3, y3) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = this.opacity;
    this.drawTriangle(ctx, 0, this.height, this.width / 2, 0, this.width, this.height);
  }
}

class shapeService extends shapeDevOps {
  public draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(0, 0, this.width, this.height);
  }
}

class shapeEnv extends shapeDevOps {
  radius:number;
  drawSemiCircle(ctx: CanvasRenderingContext2D, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(0, this.height/2, this.width, this.height/2);
    this.drawSemiCircle(ctx, this.width/2, this.height/2, this.radius)
  }
}

DevSecOpsShapes.define<shapeDevOps>('Env', shapeEnv, {
  radius: 10,
}).mixin(core);

class shapeData extends shapeDevOps {

  drawCircle(ctx: CanvasRenderingContext2D, r) {
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;
    this.drawCircle(ctx, this.width / 2)
  }
}

DevSecOpsShapes.define<shapeDevOps>('UI', shapeUI, {
}).mixin(core);

DevSecOpsShapes.define<shapeDevOps>('Service', shapeService, {
}).mixin(core);

DevSecOpsShapes.define<shapeDevOps>('Data', shapeData, {
}).mixin(core);


class shapeApp extends shapeDevOps {
}

DevSecOpsShapes.define<shapeDevOps>('App', shapeApp, {
  color: 'cyan',
}).onCreation(obj => {

  let UI = DevSecOpsShapes.find('UI').makeComponent(obj);
  let Service = DevSecOpsShapes.find('Service').makeComponent(obj);
  let Data = DevSecOpsShapes.find('Data').makeComponent(obj);

  obj.width = 1.3 * UI.width;
  obj.height = 3.3 * UI.height;
  let x = obj.width / 2;
  let y = obj.height / 6;
  UI.dropAt(x, 1 * y);
  Service.dropAt(x, 3 * y);
  Data.dropAt(x, 5 * y);
})


DevSecOpsSolids.define<foShape3D>('red box', foShape3D, {
  color: 'red',
  opacity: .5,
  width: 100,
  height: 400,
  depth: 900
})



function getConcept(name: string, spec?: any) {
  return DevSecOpsKnowledge.concepts.define(name, foComponent, spec).hide();
}
let root = getConcept('Root', {
  pipelineName: 'dave',
});

let compile = getConcept('compile');
compile.subComponent('details', {})

let s1 = DevSecOpsKnowledge.structures.define('stage1', {})
  .concept(compile).hide();
let s2 = DevSecOpsKnowledge.structures.define('stage2', {})
  .concept(getConcept('test')).hide();
let s3 = DevSecOpsKnowledge.structures.define('stage3', {})
  .concept(getConcept('package')).hide()
  .subComponent('local', {})

let pipe = DevSecOpsKnowledge.structures.define('Pipeline', {
}).concept(root)
  .subComponent('s1', s1)
  .subComponent('s2', s2)
  .subComponent('s3', s3)


DevSecOpsKnowledge.solutions.define('DevOps')
  .useStructure(pipe)
  .subSolution('security', DevSecOpsKnowledge.solutions.define('security').hide())
  .subSolution('metrics', DevSecOpsKnowledge.solutions.define('metrics').hide())
  .subSolution('governance', DevSecOpsKnowledge.solutions.define('governance').hide())
  //.useStructureWhen(pipe, function(c) { return true});


