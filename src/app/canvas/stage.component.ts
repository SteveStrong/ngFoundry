import { Component, OnInit, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Http } from '@angular/http';

import { Screen2D } from '../foundryDrivers/canvasDriver';

import { RuntimeType } from '../foundry/foRuntimeType';

import { cPoint2D, cMargin } from '../foundry/foGeometry2D';
import { Tools } from '../foundry/foTools';

import { foCollection } from '../foundry/foCollection.model';

import { Stencil } from '../foundry/foStencil';

import { foPage } from '../foundry/foPage.model';

import { foHandle2D } from '../foundry/foHandle2D';


import { foGlyph2D } from '../foundry/foGlyph2D.model';
import { foShape2D, shape2DNames } from '../foundry/foShape2D.model';
import { foShape1D } from '../foundry/foShape1D.model';
import { foText2D } from '../foundry/foText2D.model';
import { foImage2D } from '../foundry/foImage2D.model';
import { ThreeByThreeCircle, OneByOne, TwoByOne, TwoByTwo, TwoByFour, OneByTen, TenByTen } from './legoshapes.model';
import { particleEngine } from './particle.model';


import { dRectangle, dGlue } from './displayshapes.model';
import { SharingService } from '../common/sharing.service';

import { Lifecycle } from '../foundry/foLifecycle';
import { globalWorkspace } from 'app/foundry/foWorkspace.model';

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
  screen2D: Screen2D = new Screen2D();


  constructor(
    private sharing: SharingService,
    private http: Http) {
    super();

    this.myName = 'Page 1'
    globalWorkspace.document.currentPage = this;
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
    let pt = new cPoint2D(100, 150);
    this.layoutSubcomponentsVertical(false, 2).nodes.forEach(item => {
      item.moveBy(pt);
    })
  }

  doHorz() {
    let pt = new cPoint2D(100, 150);
    this.layoutSubcomponentsHorizontal(false, 2).nodes.forEach(item => {
      item.moveBy(pt);
    })
  }

  addEventHooks() {
    this.onItemHoverEnter = (loc: cPoint2D, shape: foGlyph2D, keys?: any): void => {

      this.message = [];
      this.message.push(`Hover (${loc.x},${loc.y}) Enter`);
      shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      this.message.push(shape);

      if (shape) {
        shape.drawHover = function (ctx: CanvasRenderingContext2D) {
          ctx.strokeStyle = 'yellow';
          ctx.lineWidth = 4;
          shape.drawOutline(ctx);
        }
      }
    }

    this.onItemHoverExit = (loc: cPoint2D, shape: foGlyph2D, keys?: any): void => {

      this.message = [];
      this.message.push(`Hover (${loc.x},${loc.y}) Exit`);
      shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      this.message.push(shape);

      if (shape) {
        shape.drawHover = undefined;
      }
    }

    this.onItemOverlapEnter = (loc: cPoint2D, shape: foGlyph2D, shapeUnder: foGlyph2D, keys?: any): void => {

      this.message = [];
      this.message.push(`Overlap (${loc.x},${loc.y}) Enter`);
      shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      this.message.push(shape);

      if (shapeUnder) {
        shapeUnder.drawHover = function (ctx: CanvasRenderingContext2D) {
          ctx.strokeStyle = 'green';
          ctx.lineWidth = 8;
          shapeUnder.drawOutline(ctx);
          ctx.strokeStyle = 'yellow';
          ctx.lineWidth = 4;
          shapeUnder.drawOutline(ctx);
        }
      }
    }

    this.onItemOverlapExit = (loc: cPoint2D, shape: foGlyph2D, shapeUnder: foGlyph2D, keys?: any): void => {

      this.message = [];
      this.message.push(`Overlap (${loc.x},${loc.y}) Exit`);
      shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      this.message.push(shape);

      if (shapeUnder) {
        shapeUnder.drawHover = undefined;
      }
    }

    this.onHandleHoverEnter = (loc: cPoint2D, handle: foHandle2D, keys?: any): void => {
      //let shape = handle.myParentGlyph();

      this.message = [];
      //this.message.push(`Hover (${loc.x},${loc.y}) Enter  ${shape.myName}`);
      //shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      //this.message.push(shape);
      this.message.push(`Handle Hover (${loc.x},${loc.y}) Enter ${handle && handle.myName}`);
      handle && this.message.push(handle.globalToLocal(loc.x, loc.y));
      //this.message.push(handle);
    }

    this.onTrackHandles = (loc: cPoint2D, handles: foCollection<foHandle2D>, keys?: any): void => {
      this.message = [];
      handles.forEach(handle => {
        //if (handle.hitTest(loc)) {
        //foObject.beep();
        //}
        this.message.push(`onTrackHandles (${loc.x},${loc.y}) Move ${handle && handle.myName}`);
        handle && this.message.push(handle.globalToLocal(loc.x, loc.y));
      })

    }

    this.onHandleMoving = (loc: cPoint2D, handle: foHandle2D, keys?: any): void => {
      //let shape = handle.myParentGlyph();

      this.message = [];
      //this.message.push(`Hover (${loc.x},${loc.y}) Move  ${shape.myName}`);
      //shape && this.message.push(shape.globalToLocal(loc.x, loc.y));
      //this.message.push(shape);
      this.message.push(`Handle Hover (${loc.x},${loc.y}) Move ${handle && handle.myName}`);
      handle && this.message.push(handle.globalToLocal(loc.x, loc.y));
      //this.message.push(handle);
    }

    this.onHandleHoverExit = (loc: cPoint2D, handle: foHandle2D, keys?: any): void => {
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


    this.sharing.startSharing();

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

    this.onMouseLocationChanged = (loc: cPoint2D, state: string, keys?: any): void => {
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
    new particleEngine({
      color: 'coral',
      particleCount: 10,
      opacity: .1,
      width: 100,
      height: 200,
    }).dropAt(300, 300).addAsSubcomponent(this)
      .then(item => {
        item.doStart();
      });

    let def = Stencil.define('particle', particleEngine, {
      color: 'white',
      particleCount: 100,
      opacity: .1,
      width: 700,
      height: 700,
    }).addCommands('doStart', 'doStop', 'doRotate');


    let shape = <foGlyph2D>def.newInstance();

    shape.dropAt(500, 500).addAsSubcomponent(this)
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

    let box = boundry.newInstance().dropAt(this.centerX, this.centerY).addAsSubcomponent(this);


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
    let def = Stencil.define<foImage2D>('blocks::block2d', foImage2D, {
      background: 'green',
      imageURL: 'https://lorempixel.com/900/500?r=2',
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
        picture.easeTween(place, 2.5);
      })
    }


    let image = new foImage2D({
      background: 'blue',
      margin: new cMargin(10, 10, 10, 10),
      width: 80,
      height: 80,
      imageURL: 'http://backyardnaturalist.ca/wp-content/uploads/2011/06/goldfinch-feeder.jpg',
      angle: Tools.randomInt(-30, 30)
    }).LifecycleCreated().dropAt(330, 330).addAsSubcomponent(this);


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
      block.newInstance({
        width: 10 + i * 10,
        height: 10 + i * 10,
      }).dropAt(100, 100).addAsSubcomponent(this);
    }

    for (var i = 0; i < 5; i++) {
      text.newInstance({
        width: 10 + i * 10,
        fontSize: 10 + i * 10,
      }).dropAt(100, 300).addAsSubcomponent(this);
    }

  }

  doDocker() {
    Stencil.define<foText2D>('text::block', foText2D, {
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
      }).dropAt(100, 200).addAsSubcomponent(this);

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
            text: function () { return this.context + ' : ' }
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
      }).dropAt(350, y).addAsSubcomponent(this);
      y += 50;

      objects.push(shape)
      //foObject.jsonAlert(shape.asJson);

      if (!last) {
        last = shape;
      } else {
        let wire = wireConcept.newInstance().addAsSubcomponent(this);

        wire.glueStartTo(last, shape2DNames.bottom);
        wire.glueFinishTo(shape, shape2DNames.top);
        last = shape;
      }
    })


    // objects.forEach(shape => {
    //   shape.easeTo(shape.x + Tools.randomInt(-100, 300), shape.y);
    // })


  }

  doIt() {
    this.doConnector2D();
  }

  doConnector2D() {
    let def = Stencil.define<foShape2D>('glue::shape', foShape2D, {
      color: 'blue',
      width: 200,
      height: 150,
    });

    let shape1 = def.newInstance().dropAt(300, 200).addAsSubcomponent(this);
    let shape2 = def.newInstance().dropAt(600, 200).addAsSubcomponent(this);

    let cord = Stencil.define<foShape1D>('glue::line', foShape1D, {
      color: 'red',
      height: 15,
    });

    let wire = cord.newInstance().addAsSubcomponent(this);


    wire.glueStartTo(shape1, shape2DNames.right);
    wire.glueFinishTo(shape2, shape2DNames.left);
  }

  doAddGlyph() {
    RuntimeType.create(foGlyph2D, {
      color: 'cyan',
      x: 150,
      y: 100,
      height: 150,
      width: 200,
    }).addAsSubcomponent(this);

  }

  doAddSubGlyph() {
    let shape = RuntimeType.create(foGlyph2D, {
      color: 'purple',
      height: 150,
      width: 200,
    }).addAsSubcomponent(this);

    RuntimeType.create(foGlyph2D, {
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

    def.newInstance()
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

    RuntimeType.create(TwoByTwo, {
      color: 'pink',
      myName: 'main shape'
    }).dropAt(200, 200).addAsSubcomponent(this);
  }




  doAddTwoByFour(properties?: any) {

    class localTwoByFour extends TwoByFour {
      public pinX = (): number => { return 0.5 * this.width; }
      public pinY = (): number => { return 0.5 * this.height; }
    }

    RuntimeType.define(localTwoByFour);

    if (!properties) {
      RuntimeType.create(localTwoByFour, {
        color: 'green',
        angle: 45
      }).dropAt(200, 200).addAsSubcomponent(this)
        .LifecycleCommand('doAddTwoByFour');
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
    }).dropAt(500, 500);
    this.addSubcomponent(shape);
  }

  doAddTenByTen() {
    let shape = RuntimeType.create(TenByTen, {
      color: 'gray'
    }).dropAt(600, 300);

    this.addSubcomponent(shape);
  }

  doAddStack(properties?: any) {

    let shape = RuntimeType.create(TenByTen, {
      myGuid: properties && properties.shape,
      opacity: .5,
      color: 'gray',
      angle: 10
    }).dropAt(600, 300).addAsSubcomponent(this);

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


    // !properties && this.sharing.broadcast('doAddStack', {
    //   shape: shape.myGuid,
    //   subShape: subShape.myGuid
    // });
  }


  doShape1D() {

    let height = 60;
    let x1 = 50;
    let y1 = 100;
    let x2 = 450;
    let y2 = 100;

    // let dX = x2 - x1;
    // let dY = y2 - y1;

    // let spec = {
    //   angle: foGlyph.RAD_TO_DEG * Math.atan2(dY, dX),
    //   length: Math.sqrt(dX * dX + dY * dY),
    //   cX: (x2 + x1) / 2,
    //   cY: (y2 + y1) / 2,
    // }

    // RuntimeType.create<foShape2D>(foShape2D, {
    //   opacity: .5,
    //   color: 'gray',

    //   angle: spec.angle,
    //   width: spec.length,
    //   height: height,
    // }).LifecycleCreated().dropAt(600, 400).addAsSubcomponent(this);

    RuntimeType.create<Line>(Line, {
      opacity: 1,
      thickness: 10,
      color: 'black',
      startX: x1,
      startY: y1,
      finishX: x2,
      finishY: y2,
      height: height,
    }).dropAt(600, 300).addAsSubcomponent(this);

    // new foText2D({
    //   color: 'black',
    //   background: 'yellow',
    //   context: 'Drop at 400,400 && 400,300',
    //   fontSize: 30,
    // }).LifecycleCreated().dropAt(600, 500).addAsSubcomponent(this);

  }



  doShapeGlue() {
    let shape1 = RuntimeType.create(TwoByOne, {
      color: 'cyan',
      opacity: .8,

    }).dropAt(100, 300, 45).addAsSubcomponent(this);
    let pt1 = shape1.localToGlobal(shape1.pinX(), shape1.pinY());
    //let pt2 = pt1.clone().add(200, 200);

    let shape2 = RuntimeType.create(TwoByOne, {
      color: 'blue',
      opacity: .8,
    }).dropAt(300, 400).addAsSubcomponent(this);

    shape2.pinX = (): number => { return 0.0; }
    let pt2 = shape2.localToGlobal(shape2.pinX(), shape2.pinY());

    //let pc = pt1.midpoint(pt2);


    RuntimeType.create<Line>(Line, {
      opacity: .5,
      color: 'gray',
      height: 30,
      startX: pt1.x,
      startY: pt1.y,
      finishX: pt2.x,
      finishY: pt2.y,
    }).dropAt(600, 350).addAsSubcomponent(this);


    let wire = RuntimeType.create<Line>(Line, {
      opacity: .5,
      height: 30,
      startX: pt1.x,
      startY: pt1.y,
      finishX: pt2.x,
      finishY: pt2.y,
      color: 'black',
    }).addAsSubcomponent(this);


    wire.glueStartTo(shape1, shape2DNames.left);
    wire.glueFinishTo(shape2, shape2DNames.right);
  }

  doObjGlue() {

    let wire = RuntimeType.create<Line>(Line, {
      opacity: .5,
      height: 20,
      color: 'black',
    }).dropAt(400, 400).addAsSubcomponent(this);

    let shape1 = RuntimeType.create(dGlue).addAsSubcomponent(this);

    let shape2 = RuntimeType.create(dGlue).addAsSubcomponent(this);
    shape2.pinX = (): number => { return 0.0; }

    wire.glueStartTo(shape1);
    wire.glueFinishTo(shape2);

    shape1.dropAt(100, 200, 30);
    shape2.dropAt(400, 250);
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

    RuntimeType.create(objRect, {
      color: 'blue',
      width: 150,
      height: 100,
    }).dropAt(300, 300, 0).then(item => {
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
    }).dropAt(150, 150, 0);

    this.addSubcomponent(shape);

    let subShape = RuntimeType.create(dRectangle, {
      color: 'blue',
      myName: 'blue  child',
      width: 50,
      height: 100
    }).addAsSubcomponent(shape).dropAt(100, 50);
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
      this.render(ctx);
    }

    this.screen2D.go();

  }
}




