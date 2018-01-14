import { foGlyph2D } from "../foundry/foGlyph2D.model";
import { foShape2D, shape2DNames } from "../foundry/foShape2D.model";
import { foShape1D } from "../foundry/foShape1D.model";
import { foText2D } from "../foundry/foText2D.model";
import { foImage } from "../foundry/foImage.model";
import { ThreeByThreeCircle, OneByOne, TwoByOne, TwoByTwo, TwoByFour, OneByTen, TenByTen } from "./legoshapes.model";

import { foStencilLibrary } from "../foundry/foStencil";
import { RuntimeType } from '../foundry/foRuntimeType';

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

ShapeStencil.define<foText2D>('text', foText2D, {
  color: 'black',
  background: 'grey',
  context: 'HELLO',
  fontSize: 30,
});

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
  return <foGlyph2D>shape;
});