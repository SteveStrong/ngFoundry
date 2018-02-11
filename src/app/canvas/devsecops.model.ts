
import { foLibrary } from "../foundry/foLibrary.model";
import { foStencilLibrary } from "../foundry/foStencil";
import { foComponent } from "../foundry/foComponent.model";
//import { RuntimeType } from '../foundry/foRuntimeType';

export let DevSecOps: foLibrary = new foLibrary().defaultName('definitions');
export let DevSecOpsShapes: foStencilLibrary = new foStencilLibrary().defaultName('shapes');
export let DevSecOpsSolids: foStencilLibrary = new foStencilLibrary().defaultName('solids');

DevSecOps.establishConcept<foComponent>('Root', {
  pipelineName: 'dave',
}).hide();

let compile = DevSecOps.establishConcept<foComponent>('compile').hide();


let s1 = DevSecOps.establishStructure('stage1', {})
  .concept(compile).hide();
let s2 = DevSecOps.establishStructure('stage2', {})
  .concept('test').hide();
let s3 = DevSecOps.establishStructure('stage3', {})
  .concept('package').hide();

DevSecOps.establishStructure('Pipeline', {
}).concept('Root')
  .subcomponent('s1', s1)
  .subcomponent('s2', s2)
  .subcomponent('s3', s3)


