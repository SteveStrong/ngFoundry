import { Tools } from '../foundry/foTools';

import { iPoint2D, Action } from '../foundry/foInterface';
import { cPoint2D } from '../foundry/shapes/foGeometry2D';
import { foGlyph2D } from '../foundry/shapes/foGlyph2D.model';

import { foShape2D } from "../foundry/shapes/foShape2D.model";
import { foStencilLibrary } from "../foundry/foStencil";
import { foCollection } from "../foundry/foCollection.model";
import { foController, foToggle } from "../foundry/foController";

export let BoidStencil: foStencilLibrary = new foStencilLibrary().defaultName('Boids');
export { foShape2D } from "../foundry/shapes/foShape2D.model";
export { foShape1D } from "../foundry/shapes/foShape1D.model";

class factoryController extends foController {

}

export let factoryBehaviour: factoryController = new factoryController();

export class packageMixin extends foShape2D {
}

export class pathwayMixin extends foShape1D {
}