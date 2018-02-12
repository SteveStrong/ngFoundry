
import { foLibrary } from "../foundry/foLibrary.model";
import { foStencilLibrary } from "../foundry/foStencil";
import { foComponent } from "../foundry/foComponent.model";
//import { RuntimeType } from '../foundry/foRuntimeType';

export let DevSecOps: foLibrary = new foLibrary().defaultName('definitions');
export let DevSecOpsShapes: foStencilLibrary = new foStencilLibrary().defaultName('shapes');
export let DevSecOpsSolids: foStencilLibrary = new foStencilLibrary().defaultName('solids');



function getConcept(name:string, spec?:any){
  return DevSecOps.establishConcept<foComponent>(name,spec).hide();
}
let root = getConcept('Root', {
  pipelineName: 'dave',
});

let compile = getConcept('compile');
compile.subcomponent('details', {})

let s1 = DevSecOps.establishStructure('stage1', {})
  .concept(compile).hide();
let s2 = DevSecOps.establishStructure('stage2', {})
  .concept(getConcept('test')).hide();
let s3 = DevSecOps.establishStructure('stage3', {})
  .concept(getConcept('package')).hide()
  .subcomponent('local', {})

DevSecOps.establishStructure('Pipeline', {
}).concept(root)
  .subcomponent('s1', s1)
  .subcomponent('s2', s2)
  .subcomponent('s3', s3)


