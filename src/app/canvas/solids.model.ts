import { Tools } from '../foundry/foTools';
import { cPoint2D, cMargin } from '../foundry/foGeometry2D';
import { foGlyph2D } from "../foundry/foGlyph2D.model";
import { foGlyph3D } from "../foundry/foGlyph3D.model";
import { foShape2D, shape2DNames } from "../foundry/foShape2D.model";
import { foShape1D } from "../foundry/foShape1D.model";
import { foText2D } from "../foundry/foText2D.model";
import { foImage } from "../foundry/foImage.model";
import { ThreeByThreeCircle, OneByOne, TwoByOne, TwoByTwo, TwoByFour, OneByTen, TenByTen } from "./legoshapes.model";

import { foStencilLibrary } from "../foundry/foStencil";
import { RuntimeType } from '../foundry/foRuntimeType';
import { globalWorkspace, foWorkspace } from "../foundry/foWorkspace.model";


export let SolidStencil: foStencilLibrary = new foStencilLibrary().defaultName();

SolidStencil.define<foGlyph3D>('block', foGlyph3D, {
    color: 'green',
    width: 50,
    height: 25,
    depth: 15
  });