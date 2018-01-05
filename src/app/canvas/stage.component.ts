import { Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Http, Response } from '@angular/http';

import { EmitterService } from '../common/emitter.service';


import { Sceen2D } from "../foundryDrivers/canvasDriver";
import { iShape, iPoint, iSize } from '../foundry/foInterface'

import { RuntimeType } from '../foundry/foRuntimeType';
import { PubSub } from "../foundry/foPubSub";
import { Matrix2D } from "../foundry/foMatrix2D";
import { cPoint, cRect, cMargin } from "../foundry/foGeometry";
import { Tools } from "../foundry/foTools";

import { foCollection } from "../foundry/foCollection.model";
import { foDictionary } from "../foundry/foDictionary.model";
import { foKnowledge } from "../foundry/foKnowledge.model";
import { Stencil } from "../foundry/foStencil";

import { foPage } from "../foundry/foPage.model";

import { foHandle } from "../foundry/foHandle";

import { foGlue } from "../foundry/foGlue";
import { foGlyph } from "../foundry/foGlyph.model";
import { foShape2D } from "../foundry/foShape2D.model";
import { foShape1D } from "../foundry/foShape1D.model";
import { foText2D } from "../foundry/foText2D.model";
import { foImage } from "../foundry/foImage.model";
import { ThreeByThreeCircle, OneByOne, TwoByOne, TwoByTwo, TwoByFour, OneByTen, TenByTen } from "./legoshapes.model";
import { particleEngine } from "./particle.model";

import { foDisplay2D } from "../foundry/foDisplay2D.model";
import { dRectangle, dGlue } from "./displayshapes.model";

import { Toast } from '../common/emitter.service';
import { SharingService } from "../common/sharing.service";

//https://greensock.com/docs/TweenMax
import { TweenLite, TweenMax, Back, Power0, Bounce } from "gsap";
import { foObject } from 'app/foundry/foObject.model';

import { Lifecycle } from '../foundry/foLifecycle';

class Line extends foShape1D {
}
RuntimeType.define(Line);



@Component({
  selector: 'foundry-stage',
  templateUrl: './stage.component.html'
})
export class StageComponent extends foPage implements OnInit, AfterViewInit {
  // a reference to the canvas element from our template
  @ViewChild('canvas')
  public canvasRef: ElementRef;
  @Input()
  public pageWidth = 1200;
  @Input()
  public pageHeight = 1000;

  message: Array<any> = [];
  screen2D: Sceen2D = new Sceen2D();


  constructor(
    private sharing: SharingService,
    private http: Http) {
    super();
  }

  doClear() {
    this.clearPage();
    this.message = [];
    this.sharing.clearPage();
  }

  doUndo() {
  }

  doDelete() {
    this.deleteSelected();
  }

  doDuplicate() {
  }

  doVert() {
    let pt = new cPoint(100, 150);
    this.layoutSubcomponentsVertical(false, 2).nodes.forEach(item => {
      item.moveBy(pt);
    })
  }

  doHorz() {
    let pt = new cPoint(100, 150);
    this.layoutSubcomponentsHorizontal(false, 2).nodes.forEach(item => {
      item.moveBy(pt);
    })
  }

  addEventHooks() {
    this.onItemHoverEnter = (loc: cPoint, shape: foGlyph, keys?: any): void => {

      this.message = [];
      this.message.push(`Hover (${loc.x},${loc.y}) Enter`);
      shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      this.message.push(shape);

      if (shape) {
        shape.drawHover = function (ctx: CanvasRenderingContext2D) {
          ctx.strokeStyle = "yellow";
          ctx.lineWidth = 4;
          shape.drawOutline(ctx);
        }
      }
    }

    this.onItemHoverExit = (loc: cPoint, shape: foGlyph, keys?: any): void => {

      this.message = [];
      this.message.push(`Hover (${loc.x},${loc.y}) Exit`);
      shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      this.message.push(shape);

      if (shape) {
        shape.drawHover = undefined;
      }
    }

    this.onItemOverlapEnter = (loc: cPoint, shape: foGlyph, shapeUnder: foGlyph, keys?: any): void => {

      this.message = [];
      this.message.push(`Overlap (${loc.x},${loc.y}) Enter`);
      shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      this.message.push(shape);

      if (shapeUnder) {
        shapeUnder.drawHover = function (ctx: CanvasRenderingContext2D) {
          ctx.strokeStyle = "green";
          ctx.lineWidth = 8;
          shapeUnder.drawOutline(ctx);
          ctx.strokeStyle = "yellow";
          ctx.lineWidth = 4;
          shapeUnder.drawOutline(ctx);
        }
      }
    }

    this.onItemOverlapExit = (loc: cPoint, shape: foGlyph, shapeUnder: foGlyph, keys?: any): void => {

      this.message = [];
      this.message.push(`Overlap (${loc.x},${loc.y}) Exit`);
      shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      this.message.push(shape);

      if (shapeUnder) {
        shapeUnder.drawHover = undefined;
      }
    }

    this.onHandleHoverEnter = (loc: cPoint, handle: foHandle, keys?: any): void => {
      //let shape = handle.myParentGlyph();

      this.message = [];
      //this.message.push(`Hover (${loc.x},${loc.y}) Enter  ${shape.myName}`);
      //shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      //this.message.push(shape);
      this.message.push(`Handle Hover (${loc.x},${loc.y}) Enter ${handle && handle.myName}`);
      handle && this.message.push(handle.globalToLocal(loc.x, loc.y));
      //this.message.push(handle);
    }

    this.onTrackHandles = (loc: cPoint, handles: foCollection<foHandle>, keys?: any): void => {
      this.message = [];
      handles.forEach(handle => {
        //if (handle.hitTest(loc)) {
        //foObject.beep();
        //}
        this.message.push(`onTrackHandles (${loc.x},${loc.y}) Move ${handle && handle.myName}`);
        handle && this.message.push(handle.globalToLocal(loc.x, loc.y));
      })

    }

    this.onHandleMoving = (loc: cPoint, handle: foHandle, keys?: any): void => {
      //let shape = handle.myParentGlyph();

      this.message = [];
      //this.message.push(`Hover (${loc.x},${loc.y}) Move  ${shape.myName}`);
      //shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      //this.message.push(shape);
      this.message.push(`Handle Hover (${loc.x},${loc.y}) Move ${handle && handle.myName}`);
      handle && this.message.push(handle.globalToLocal(loc.x, loc.y));
      //this.message.push(handle);
    }

    this.onHandleHoverExit = (loc: cPoint, handle: foHandle, keys?: any): void => {
      //let shape = handle.myParentGlyph();

      this.message = [];
      //this.message.push(`Hover (${loc.x},${loc.y}) Exit ${shape.myName}`);
      //shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      //this.message.push(shape);
      this.message.push(`Handle Hover (${loc.x},${loc.y}) Exit ${handle && handle.myName}`);
      handle && this.message.push(handle.globalToLocal(loc.x, loc.y));
      //this.message.push(handle);

    }
  }

  ngOnInit() {

    this.sharing.startSharing(this);

    this.addEventHooks();

    Lifecycle.observable.subscribe(event => {
      console.log(event.id, event.cmd, event.myGuid, JSON.stringify(event.value));
      //Toast.info(event.cmd, event.myGuid )
    })

    // this.onItemChangedParent = (shape: foGlyph): void => {
    //   //this.sharing.syncParent(shape);
    // }

    // this.onItemChangedPosition = (shape: foGlyph): void => {
    //   //this.sharing.moveTo(shape, shape.getLocation());
    // }

    this.onMouseLocationChanged = (loc: cPoint, state: string, keys?: any): void => {
      this.mouseLoc = loc;
      this.mouseLoc.state = state; 212
      this.mouseLoc.keys = keys;
    }


    Stencil.define('lego', ThreeByThreeCircle);

    Stencil.define('lego', OneByOne);
    Stencil.define('lego', TwoByOne, { color: 'coral' });
    Stencil.define('lego', TwoByTwo, { width: 50, height: 50 });
    Stencil.define('lego', TwoByFour);
    Stencil.define('lego', OneByTen);
    Stencil.define('lego', TenByTen, { width: 250, height: 250 });
  }

  doParticleEngine() {
    let engine = new particleEngine({
      color: 'coral',
      particleCount: 10,
      opacity: .1,
      width: 100,
      height: 200,
    }).drop(300, 300).addAsSubcomponent(this)
      .then(item => {
        item.doStart();
      });

    let def = Stencil.define('particle', particleEngine, {
      color: 'white',
      particleCount: 100,
      opacity: .1,
      width: 700,
      height: 700,
    }).addCommands("doStart", "doStop", "doRotate");


    let shape = <foGlyph>def.newInstance();
    
    shape.drop(500, 500).addAsSubcomponent(this)
      .then(item => {
        item.doStart();
      });
  }

  doLoadStencil() {
    Stencil.define<foShape2D>('boundry::shape1', foShape2D, {
      color: 'gray',
      width: 50,
      height: 25
    });

    Stencil.define<foShape2D>('boundry::block', foShape2D, {
      color: 'green',
      width: 100,
      height: 50
    });

    Stencil.define<foText2D>('boundry::text', foText2D, {
      color: 'black',
      background: 'grey',
      context: 'HELLO',
      fontSize: 30,
    });

    Stencil.define<foShape2D>('boundry::boundry', foShape2D, {
      color: 'cyan',
      width: 100,
      height: 50
    });

  }


  doBoundry() {
    this.doLoadStencil();

    let text = Stencil.find<foShape2D>('boundry::text');

    let block = Stencil.find<foShape2D>('boundry::block');

    let boundry = Stencil.find<foShape2D>('boundry::boundry');

    let box = boundry.newInstance().drop(this.centerX, this.centerY).addAsSubcomponent(this);


    for (var i = 0; i < 3; i++) {
      let body = block.newInstance({
        width: 10 + i * 10,
        height: 10 + i * 10,
      }).addAsSubcomponent(box);

      for (var j = 0; j < 4; j++) {
        text.newInstance({
          context: 'test ' + j
        }).addAsSubcomponent(body);
      }

      body.wait(10, () => body.layoutSubcomponentsVertical(true, 10));
    }
    box.wait(10, () => box.layoutSubcomponentsHorizontal(true, 10));

  }

  doImage() {
    let def = Stencil.define<foImage>('blocks::block2d', foImage, {
      background: 'green',
      imageURL: "https://lorempixel.com/900/500?r=2",
      width: 100,
      height: 50
    });

    for (let i = 0; i < 8; i++) {
      this.wait(500, () => {
        let picture = def.newInstance({
          angle: Tools.randomInt(0, 300)
        }).addAsSubcomponent(this);

        let place = { x: 800 + Tools.randomInt(-70, 70), y: 200 + Tools.randomInt(-70, 70) }
        picture.easeTween(place, 1.5);
      })
    }

    for (let i = 0; i < 8; i++) {
      this.wait(1500, () => {
        let picture = def.newInstance().addAsSubcomponent(this);
        picture.angle = Tools.randomInt(0, 300);

        //created forces a broadast of latest state
        let place = { x: 700 + Tools.randomInt(-70, 70), y: 300 + Tools.randomInt(-70, 70) }
        picture.created().easeTween(place, 2.5);
      })
    }


    let image = new foImage({
      background: 'blue',
      margin: new cMargin(10, 10, 10, 10),
      width: 80,
      height: 80,
      imageURL: "http://backyardnaturalist.ca/wp-content/uploads/2011/06/goldfinch-feeder.jpg",
      angle: Tools.randomInt(-30, 30)
    }).created().drop(330, 330).addAsSubcomponent(this);
 

    let size = {
      width: 200,
      height: 200,
    }

    image.easeTween(size, 2.8, 'easeInOut');

  }

  doBlocks() {
    let block = Stencil.define<foShape2D>('blocks::block2d', foShape2D, {
      color: 'green',
      width: 100,
      height: 50
    });



    let text = Stencil.define<foText2D>('words::text2d', foText2D, {
      color: 'black',
      background: 'yellow',
      context: 'HELLO',
      width: 100,
      height: 50
    });

    for (var i = 0; i < 5; i++) {
      let body = block.newInstance({
        width: 10 + i * 10,
        height: 10 + i * 10,
      }).drop(100, 100).addAsSubcomponent(this);
    }

    for (var i = 0; i < 5; i++) {
      let body = text.newInstance({
        width: 10 + i * 10,
        fontSize: 10 + i * 10,
      }).drop(100, 300).addAsSubcomponent(this);
    }

  }

  doDocker() {
    let block = Stencil.define<foText2D>('text::block', foText2D, {
      color: 'green',
      fontSize: 20,
    });

    let attribute = Stencil.define<foText2D>('text::attribute', foText2D, {
      color: 'red',
      background: 'white',
      fontSize: 20,
    });

    let formula = Stencil.define<foText2D>('text::formula', foText2D, {
      color: 'gray',
      background: 'white',
      fontSize: 20,
    });

    let concept = Stencil.define<foText2D>('text::concept', foText2D, {
      color: 'blue',
      background: 'yellow',
      fontSize: 20,
    });

    let body = Stencil.define<foShape2D>('text::body', foShape2D, {
      color: 'cyan',
      fontSize: 30,
    });

    // , (parent) => {
    //   parent.context.forEach(item => {
    //     block.newInstance({
    //       context: item,
    //     }).addAsSubcomponent(parent);
    //   });
    // });



    let source = this.http.get('assets/caas.json');
    source.subscribe(res => {
      let data = res.json();

      let frame = body.newInstance({
        context: data.categories
      }).drop(100, 200).addAsSubcomponent(this);

      //give this a chance to render so sizes are right for text
      setTimeout(() => {
        frame.layoutSubcomponentsVertical();
        //frame.layoutSubcomponentsHorizontal();
      }, 10);


      data.containers.forEach(item => {
        let body = concept.newInstance({
          fontSize: 30,
          context: 'Container',
        }).addAsSubcomponent(this);

        Tools.forEachKeyValue(item, (key, value) => {
          let attr = attribute.newInstance({
            context: key,
            text: function () { return this.context + " : " }
          }).addAsSubcomponent(body);

          formula.newInstance({
            context: value,
            text: function () { return this.context }
          }).addAsSubcomponent(attr);

          setTimeout(() => {
            attr.layoutMarginRight();
          }, 10)
        });

        setTimeout(() => {
          body.layoutMarginTop()
        }, 10)
      });

      setTimeout(() => {
        this.layoutSubcomponentsVertical(false)
      }, 10)

    });

  }

  doText() {
    let textBlock = Stencil.define<foText2D>('text::block', foText2D, {
      color: 'black',
      text: 'Hello',
      background: 'yellow',
      margin: new cMargin(0, 0, 0, 0)
    });

    let wireConcept = Stencil.define<foShape1D>('text::wire', foShape1D, {
      color: 'green',
      thickness: 1,
    });

    let list = ['Steve', 'Stu', 'Don', 'Linda', 'Anne', 'Debra', 'Evan'];
    let objects = [];

    let y = 100;
    let size = 8;
    let last = undefined;
    list.forEach(item => {
      size += 4;
      let shape = textBlock.newInstance({
        text: 'Hello ' + item,
        fontSize: size,
      }).drop(350, y).addAsSubcomponent(this);
      y += 50;

      objects.push(shape)
      //foObject.jsonAlert(shape.asJson);

      // if (!last) {
      //   last = shape;
      // } else {
      //   let wire = wireConcept.newInstance().addAsSubcomponent(this);

      //   this.sharing.syncGlue(wire.glueStart(last));
      //   this.sharing.syncGlue(wire.glueFinish(shape));
      //   last = shape;
      // }
    })


    // objects.forEach(shape => {
    //   shape.easeTo(shape.x + Tools.randomInt(-100, 100));
    // })


  }

  doAddGlyph() {
    let shape = RuntimeType.create(foGlyph, {
      color: 'cyan',
      x: 150,
      y: 100,
      height: 150,
      width: 200,
    }).addAsSubcomponent(this);

  }

  doAddSubGlyph() {
    let shape = RuntimeType.create(foGlyph, {
      color: 'purple',
      height: 150,
      width: 200,
    }).addAsSubcomponent(this);

    let subShape = RuntimeType.create(foGlyph, {
      color: 'blue',
      x: 25,
      y: 25,
      height: 50,
      width: 300,
    }).addAsSubcomponent(shape);
  }

  doAddThreeByThree() {
    let def = Stencil.define('my', ThreeByThreeCircle, {
      color: 'coral',
      x: 400,
      y: 400,
    });

    let shape = def.newInstance()
      .addAsSubcomponent(this);
  }


  doAddOneByOne() {
    let shape = RuntimeType.create(OneByOne, {
      color: 'red',
      x: 200,
      y: 200,
    });
    this.addSubcomponent(shape);
  }

  doAddTwoByOne() {
    let shape = RuntimeType.create(TwoByOne, {
      color: 'cyan'
    });
    this.addSubcomponent(shape);
  }

  doAddTwoByTwo() {

    let shape = RuntimeType.create(TwoByTwo, {
      color: 'pink',
      myName: "main shape"
    }).drop(200, 200).addAsSubcomponent(this);
  }




  doAddTwoByFour(properties?: any) {

    class localTwoByFour extends TwoByFour {
      public pinX = (): number => { return 0.5 * this.width; }
      public pinY = (): number => { return 0.5 * this.height; }
    }

    RuntimeType.define(localTwoByFour);

    let spec = {
      color: 'green',
      angle: 45
    }

    if (!properties) {
      let shape = RuntimeType.create(localTwoByFour, spec).drop(200, 200).addAsSubcomponent(this);
      this.sharing.callMethod('doAddTwoByFour', shape);
    } else {
      RuntimeType.create(localTwoByFour, properties).addAsSubcomponent(this);
    }

  }

  doAddOneByTen() {
    let shape = RuntimeType.create(OneByTen, {
      color: 'yellow',
      // height: 10,
      // width: function (): number { return this.height / 4; },
      Animation: function (): void {
        let angle = this.angle + 10;
        angle = angle >= 360 ? 0 : angle;
        //this.height = angle;
        this.angle = angle;
      }
    }).drop(500, 500);
    this.addSubcomponent(shape);
  }

  doAddTenByTen() {
    let shape = RuntimeType.create(TenByTen, {
      color: 'gray'
    }).drop(600, 300);

    this.addSubcomponent(shape);
  }

  doAddStack(properties?: any) {

    let shape = RuntimeType.create(TenByTen, {
      myGuid: properties && properties.shape,
      opacity: .5,
      color: 'gray',
      angle: 10
    }).drop(600, 300).addAsSubcomponent(this);

    let subShape = RuntimeType.create(TwoByFour, {
      myGuid: properties && properties.subShape,
      color: 'red',
    }).addAsSubcomponent(shape, {
      x: function () { return shape.width / 4; },
      y: 150,
      angle: 0,
    });



    // => does a scope that moves the page
    // subShape.doAnimation = (): void => {
    //   let angle = this.angle + .5;
    //   angle = angle >= 360 ? 0 : angle;
    //   this.angle = angle;
    // }

    subShape.doAnimation = function (): void {
      let angle = this.angle + .5;
      angle = angle >= 360 ? 0 : angle;
      this.angle = angle;
    }


    !properties && this.sharing.broadcast('doAddStack', {
      shape: shape.myGuid,
      subShape: subShape.myGuid
    });
  }

  doShape1D() {

    let height = 20;
    let x1 = 150;
    let y1 = 100;
    let x2 = 350;
    let y2 = 200;

    let dX = x2 - x1;
    let dY = y2 - y1;

    let spec = {
      angle: foGlyph.RAD_TO_DEG * Math.atan2(dY, dX),
      length: Math.sqrt(dX * dX + dY * dY),
      cX: (x2 + x1) / 2,
      cY: (y2 + y1) / 2,
    }

    RuntimeType.create<foShape2D>(foShape2D, {
      opacity: .5,
      color: 'gray',

      angle: spec.angle,
      width: spec.length,
      height: height,
    }).drop(400, 400).addAsSubcomponent(this);

    RuntimeType.create<Line>(Line, {
      opacity: 1,
      thickness: 10,
      color: 'black',
      startX: x1,
      startY: y1,
      finishX: x2,
      finishY: y2,
      height: height,
    }).drop(400, 300).addAsSubcomponent(this);

    new foText2D({
      color: 'black',
      background: 'yellow',
      context: 'Drop at 400,400 && 400,300',
      fontSize: 30,
    }).drop(600, 500).addAsSubcomponent(this);
  }

  doShapeGlue() {
    let shape1 = RuntimeType.create(TwoByOne, {
      color: 'cyan',
      opacity: .8,

    }).drop(100, 300, 45).addAsSubcomponent(this);

    let shape2 = RuntimeType.create(TwoByOne, {
      color: 'cyan',
      opacity: .8,
    }).drop(300, 400).addAsSubcomponent(this);
    shape2.pinX = (): number => { return 0.0; }

    let pt1 = shape1.localToGlobal(shape1.pinX(), shape1.pinY());
    let pt2 = shape2.localToGlobal(shape2.pinX(), shape2.pinY());
    let pc = pt1.midpoint(pt2);


    let shape = RuntimeType.create<Line>(Line, {
      opacity: .5,
      color: 'gray',
      height: 30,
      startX: pt1.x,
      startY: pt1.y,
      finishX: pt2.x,
      finishY: pt2.y,
    }).drop(600, 350).addAsSubcomponent(this);


    let wire = RuntimeType.create<Line>(Line, {
      opacity: .5,
      height: 30,
      startX: pt1.x,
      startY: pt1.y,
      finishX: pt2.x,
      finishY: pt2.y,
      color: 'black',
    }).addAsSubcomponent(this);


    this.sharing.syncGlue(wire.createGlue('begin', shape1));
    this.sharing.syncGlue(wire.createGlue('end', shape2));
  }

  doObjGlue() {

    let wire = RuntimeType.create<Line>(Line, {
      opacity: .5,
      height: 20,
      color: 'black',
    }).drop(400, 400).addAsSubcomponent(this);

    let shape1 = RuntimeType.create(dGlue).addAsSubcomponent(this);

    let shape2 = RuntimeType.create(dGlue).addAsSubcomponent(this);
    shape2.pinX = (): number => { return 0.0; }

    wire.createGlue('begin', shape1);
    wire.createGlue('end', shape2);

    shape1.drop(100, 200, 30);
    shape2.drop(400, 250);

    wire.glue.forEach(glue => {
      this.sharing.syncGlue(glue);
    })

  }

  doObjRect() {
    class objRect extends dRectangle {
      pinX = (): number => { return 0.0 * this.width; }
      pinY = (): number => { return 0.5 * this.height; }

      Animation = (): void => {
        let angle = this.angle + .5;
        angle = angle >= 360 ? 0 : angle;
        this.angle = angle;
      }
    }

    let shape = RuntimeType.create(objRect, {
      color: 'blue',
      width: 150,
      height: 100,
    }).drop(300, 300, 0).then(item => {
      item.doAnimation = item.Animation;
      item.isSelected = true;
    }).addAsSubcomponent(this);

  }

  doObjGroup() {

    class myRect extends dRectangle {
      public pinX = (): number => { return 50; }
    }

    let shape = RuntimeType.create(myRect, {
      color: 'purple',
      myName: 'root  dRectangle',
      width: 300,
      height: 100
    }).drop(150, 150, 0);

    this.addSubcomponent(shape);

    let subShape = RuntimeType.create(dRectangle, {
      color: 'blue',
      myName: 'blue  child',
      width: 50,
      height: 100
    }).addAsSubcomponent(shape).drop(100, 50);
    // //this.addSubcomponent(subShape);

    subShape.doAnimation = function () {
      let angle = this.angle + .5;
      angle = angle >= 360 ? 0 : angle;
      this.angle = angle;
    }

    shape.doAnimation = subShape.doAnimation;

  }


  public ngAfterViewInit() {
    this.width = this.pageWidth;
    this.height = this.pageHeight;

    this.screen2D.setRoot(this.canvasRef.nativeElement, this.pageWidth, this.pageHeight);

    this.screen2D.render = (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      this.render(ctx);
      ctx.restore();
    }


    this.screen2D.go();

  }
}




