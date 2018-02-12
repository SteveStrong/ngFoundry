
import { foLibrary } from "../foundry/foLibrary.model";
import { foStencilLibrary } from "../foundry/foStencil";
import { foComponent } from "../foundry/foComponent.model";
//import { RuntimeType } from '../foundry/foRuntimeType';

export let DevSecOps: foLibrary = new foLibrary().defaultName('definitions');
export let DevSecOpsShapes: foStencilLibrary = new foStencilLibrary().defaultName('shapes');
export let DevSecOpsSolids: foStencilLibrary = new foStencilLibrary().defaultName('solids');



function getConcept(name:string, spec?:any){
  return DevSecOps.concepts.define(name,foComponent,spec).hide();
}
let root = getConcept('Root', {
  pipelineName: 'dave',
});

let compile = getConcept('compile');
compile.subComponent('details', {})

let s1 = DevSecOps.structures.define('stage1', {})
  .concept(compile).hide();
let s2 = DevSecOps.structures.define('stage2', {})
  .concept(getConcept('test')).hide();
let s3 = DevSecOps.structures.define('stage3', {})
  .concept(getConcept('package')).hide()
  .subComponent('local', {})

DevSecOps.structures.define('Pipeline', {
}).concept(root)
  .subComponent('s1', s1)
  .subComponent('s2', s2)
  .subComponent('s3', s3)


