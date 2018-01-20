import { Tools } from '../foundry/foTools';
import { cPoint2D, cMargin } from '../foundry/foGeometry2D';
import { foGlyph2D } from "../foundry/foGlyph2D.model";
import { foShape2D, shape2DNames } from "../foundry/foShape2D.model";
import { foShape1D } from "../foundry/foShape1D.model";
import { foText2D } from "../foundry/foText2D.model";
import { foImage } from "../foundry/foImage.model";
import { ThreeByThreeCircle, OneByOne, TwoByOne, TwoByTwo, TwoByFour, OneByTen, TenByTen } from "./legoshapes.model";

import { foStencilLibrary } from "../foundry/foStencil";
import { RuntimeType } from '../foundry/foRuntimeType';
import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";
import { Lifecycle } from 'app/foundry/foLifecycle';


export let ShapeStencil: foStencilLibrary = new foStencilLibrary().defaultName();


class Line extends foShape1D {
}

ShapeStencil.define<Line>('line', Line, {
  color: 'Red',
  height: 15,
  opacity: 1,
  thickness: 10,
  startX: 50,
  startY: 100,
  finishX: 450,
  finishY: 100,
});

ShapeStencil.define<foShape2D>('shape', foShape2D, {
  color: 'gray',
  width: 50,
  height: 25
});

ShapeStencil.define<foShape2D>('block', foShape2D, {
  color: 'green',
  width: 100,
  height: 50
});

class Test2D extends foText2D {
  doChange() {
    this.text += ' more ';
    this.setupPreDraw();
    Lifecycle.changed(this, { text: this.text })
  }
}
ShapeStencil.define<foText2D>('2D::Text', Test2D, {
  color: 'black',
  background: 'grey',
  text: 'HELLO',
  fontSize: 30,
}).addCommands('doChange')

ShapeStencil.define<foShape2D>('cyan', foShape2D, {
  color: 'cyan',
  width: 100,
  height: 50
});

ShapeStencil.define<foImage>('Image', foImage, {
  background: 'green',
  imageURL: "https://lorempixel.com/900/500?r=2",
  width: 400,
  height: 250
});

ShapeStencil.factory<foGlyph2D>('doAddSubGlyph', (spec?: any) => {
  let shape = RuntimeType.create(foGlyph2D, {
    color: 'purple',
    height: 150,
    width: 200,
  });

  RuntimeType.create(foGlyph2D, {
    color: 'blue',
    x: 25,
    y: 25,
    height: 50,
    width: 300,
  }).addAsSubcomponent(shape);
  return [<foGlyph2D>shape];
});

ShapeStencil.factory<foGlyph2D>('doImage', (spec?: any) => {
  let def = ShapeStencil.define<foImage>('image', foImage, {
    background: 'green',
    imageURL: "https://lorempixel.com/900/500?r=2",
    width: 100,
    height: 50
  });

  let result = new Array<foGlyph2D>();

  for (let i = 0; i < 8; i++) {
    let picture = def.newInstance({
      angle: Tools.randomInt(0, 300)
    }).defaultName();

    result.push(picture);
    let place = { x: 800 + Tools.randomInt(-70, 70), y: 200 + Tools.randomInt(-70, 70) }
    picture.easeTween(place, 1.5);
  }

  for (let i = 0; i < 8; i++) {
    let picture = def.newInstance().defaultName();
    result.push(picture);
    picture.angle = Tools.randomInt(0, 300);

    //created forces a broadast of latest state
    let place = { x: 700 + Tools.randomInt(-70, 70), y: 300 + Tools.randomInt(-70, 70) }
    picture.easeTween(place, 2.5);
  }


  let image = new foImage({
    background: 'blue',
    margin: new cMargin(10, 10, 10, 10),
    width: 80,
    height: 80,
    imageURL: "http://backyardnaturalist.ca/wp-content/uploads/2011/06/goldfinch-feeder.jpg",
    angle: Tools.randomInt(-30, 30)
  }).LifecycleCreated().dropAt(330, 330).defaultName();;

  result.push(image)

  let size = {
    width: 200,
    height: 200,
  }

  image.easeTween(size, 2.8, 'easeInOut');
  return result;
});

ShapeStencil.factory<foGlyph2D>('doText', (spec?: any) => {
  let textBlock = ShapeStencil.find<foText2D>('2D::Text');


  let list = ['Steve', 'Stu', 'Don', 'Linda', 'Anne', 'Debra', 'Evan'];
  let results = Array<foGlyph2D>();

  let y = 100;
  let size = 8;
  list.forEach(item => {
    size += 4;
    let shape = textBlock.newInstance({
      text: 'Hello ' + item,
      fontSize: size,
    }).dropAt(350, y);
    y += 50;

    results.push(shape);
  })

  return results;

}