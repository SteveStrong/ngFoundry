
import { foLibrary } from "../foundry/foLibrary.model";
import { foStencilLibrary } from "../foundry/foStencil";
import { foWorkspace } from "../foundry/foWorkspace.model";
import { foComponent } from "../foundry/foComponent.model";
import { foModel } from "../foundry/foModel.model";
import { foImage2D } from "../foundry/shapes/foImage2D.model";
import { foText2D, foInputText2D } from "../foundry/shapes/foText2D.model";
import { foShape2D } from "../foundry/shapes/foShape2D.model";
import { foShape3D } from "../foundry/solids/foShape3D.model";
//import { foShape2D } from "./particle.model";

import { iPoint2D } from '../foundry/foInterface';
import { foGlyph2D } from '../foundry/shapes/foGlyph2D.model';
import { foPath2D } from '../foundry/shapes/foPath2D.model';

import { RuntimeType } from '../foundry/foRuntimeType';

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

DevSecOpsShapes.define<foInputText2D>('Text', foInputText2D, {
  text: 'Understand DevSecOps',
  fontSize: 30,
});

DevSecOpsShapes.define<foImage2D>('Image', foImage2D, {
  background: 'green',
  imageURL: "https://lorempixel.com/900/500?r=2",
  width: 400,
  height: 250
});

class shapeDevOps extends foShape2D {

  doAnimation = () => { };
  
  public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
    this.doAnimation();
    super.render(ctx, deep);
  }

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

DevSecOpsShapes.define('Heart', foPath2D, {
  scale: 2,
}).mixin(core);

DevSecOpsShapes.define('rocket', foPath2D, {
  path: "M 201.2 222.1 C 210 216.5 218.6 210.1 225.7 203 C 249.9 178.8 252.6 157.5 250.1 149.9 C 253.7 146.3 257.3 142.7 260.9 139.1 C 261.9 138.1 261.9 136.5 260.9 135.5 C 259.9 134.5 258.3 134.5 257.3 135.5 C 253.7 139.1 250.1 142.7 246.5 146.3 C 238.9 143.8 217.6 146.5 193.4 170.7 C 186.3 177.8 179.9 186.4 174.3 195.2 C 166.2 193.2 152.1 193.2 142.3 204.1 C 131.1 216.4 137.7 228.1 140.2 225.7 C 142.2 223.6 145.6 211.3 160.4 220.8 C 158 225.8 158.1 228.9 159.7 230.4 C 161.8 232.5 163.9 234.6 166 236.7 C 167.6 238.3 170.6 238.5 175.7 236 C 185.1 250.8 172.8 254.2 170.8 256.3 C 168.3 258.7 180 265.3 192.3 254.1 C 203.2 244.3 203.2 230.2 201.2 222.1M 216.5 179.9 C 212.9 176.3 212.9 170.3 216.5 166.7 C 220.2 163 226.1 163 229.7 166.7 C 233.4 170.4 233.4 176.2 229.7 179.9 C 226.1 183.5 220.2 183.5 216.5 179.9M 156.4 233.5 C 156.4 233.5 146.4 235.3 142.7 253.7 C 161.1 250.1 162.9 240 162.9 240 C 160.8 237.8 158.6 235.7 156.4 233.5z",

}).mixin(core);

DevSecOpsShapes.define('body', foPath2D, {
  path: "M13.38,201.93a101.41,101.41,0,0,1,2-19.62,99.45,99.45,0,0,1,27-50.85,96.1,96.1,0,0,1,21.5-16.3c1.32-.74,2-.19,2.86.56a64,64,0,0,0,82.22.46l2-1.62c34.2,17.57,52.4,55.17,51.68,87.36Z",
}).mixin(core);

DevSecOpsShapes.define('head', foPath2D, {
  path: "M55.62,66.49c-.22-28.7,23.73-52.88,53.65-52.41,28,.44,51.48,24.15,51.41,52.53a52.53,52.53,0,1,1-105.06-.13Z",
}).mixin(core);

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
  radius: number;
  drawSemiCircle(ctx: CanvasRenderingContext2D, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(0, this.height / 2, this.width, this.height / 2);
    this.drawSemiCircle(ctx, this.width / 2, this.height / 2, this.radius)
  }
}

DevSecOpsShapes.define<shapeDevOps>('Env', shapeEnv, {
  radius: 10,
}).mixin(core);


class shapeInvEnv extends shapeDevOps {
  radius: number;
  drawSemiCircle(ctx: CanvasRenderingContext2D, x, y, r) {
    ctx.save()
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(0, 0, this.width, this.height / 2);
    this.drawSemiCircle(ctx, this.width / 2, this.height / 2, this.radius)
  }
}

DevSecOpsShapes.define<shapeDevOps>('InvEnv', shapeInvEnv, {
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
  
  //override the storage of subcomponents because
  //they get created during on creation
  public deHydrate(context?: any, deep: boolean = false) {
    return super.deHydrate(context, false);
  }
}

DevSecOpsShapes.define<shapeDevOps>('App', shapeApp, {
  color: 'cyan',
}).onCreation(obj => {

  //with predefined names, save and restore is easire
  let UI = DevSecOpsShapes.find('UI').makeComponent(obj).setName('UI');
  let Service = DevSecOpsShapes.find('Service').makeComponent(obj).setName('Service');
  let Data = DevSecOpsShapes.find('Data').makeComponent(obj).setName('Data');
  let InvEnv = DevSecOpsShapes.find('InvEnv').makeComponent(obj).setName('InvEnv');

  obj.width = 1.3 * UI.width;
  obj.height = 3.3 * UI.height;
  let x = obj.width / 2;
  let y = obj.height / 6;
  UI.dropAt(x, 1 * y);
  Service.dropAt(x, 3 * y);
  Data.dropAt(x, 5 * y);
  InvEnv.dropAt(x, 7 * y);

  UI.doAnimation = function (): void {
    let angle = this.angle + 2;
    angle = angle >= 360 ? 0 : angle;
    this.angle = angle;
  }
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



  class legoCore extends foShape2D {

    description: string;
    size: string = '0:0';
  
    constructor(properties?: any) {
      super(properties);
      this.description = this.myType;
  
      this.override({
        height: function () {
          let size = parseInt(this.size.split(':')[1]);
          return 25 * size;
        },
        width: function () {
          let size = parseInt(this.size.split(':')[0]);
          return 25 * size;
        }
      });
  
    }
  
    doAnimation = () => { };
  
    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
      this.doAnimation();
      super.render(ctx, deep);
    }
  
    public postDraw = (ctx: CanvasRenderingContext2D): void => {
      this.drawPin(ctx);
    }
  
  }

  class TwoByFour extends legoCore {
    public pinX = (): number => { return 0 * this.width / 2; }
    public pinY = (): number => { return 1 * this.height / 2 }
    constructor(properties?: any) {
      super(properties);
      this.size = '2:4';
    }

    doAnimation = function (): void {
      let angle = this.angle + 5;
      angle = angle >= 360 ? 0 : angle;
      this.angle = angle;
    }
  }
  RuntimeType.define(TwoByFour);

  class TenByTen extends legoCore {
    constructor(properties?: any) {
      super(properties);
      this.size = '10:10';
    }
  }
  RuntimeType.define(TenByTen);

  DevSecOpsShapes.factory('animation', (spec?: any) => {

    let results = Array<foGlyph2D>();

    let shape = RuntimeType.create(TenByTen, {
      myGuid: spec && spec.shape,
      opacity: .5,
      color: 'gray',
      angle: 10
    }).dropAt(600, 300).pushTo(results).defaultName();

    let subShape = RuntimeType.create(TwoByFour, {
      myGuid: spec && spec.subShape,
      color: 'red',
    }).addAsSubcomponent(shape, {
      x: function () { return shape.width / 4; },
      y: 150,
      angle: 0,
    }).setName('spinner');

    // subShape.doAnimation = function (): void {
    //   let angle = this.angle + 5;
    //   angle = angle >= 360 ? 0 : angle;
    //   this.angle = angle;
    // }

    return results;
    
  });





