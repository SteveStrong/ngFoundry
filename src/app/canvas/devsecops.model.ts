
import { foLibrary } from "../foundry/foLibrary.model";
import { foStencilLibrary } from "../foundry/foStencil";
import { foWorkspace } from "../foundry/foWorkspace.model";
import { foComponent } from "../foundry/foComponent.model";
import { foModel, foContext } from "../foundry/foModel.model";
import { foImage2D } from "../foundry/shapes/foImage2D.model";
import { foShape3D } from "../foundry/solids/foShape3D.model";

export let DevSecOpsKnowledge: foLibrary = new foLibrary().defaultName('definitions');
export let DevSecOpsShapes: foStencilLibrary = new foStencilLibrary().defaultName('shapes');
export let DevSecOpsSolids: foStencilLibrary = new foStencilLibrary().defaultName('solids');
export let DevSecOps: foWorkspace = new foWorkspace().defaultName('Dev Ops');

DevSecOps.library.add(DevSecOpsKnowledge);
DevSecOps.stencil.add(DevSecOpsShapes);
DevSecOps.stencil.add(DevSecOpsSolids);

DevSecOps.context.define('DevOpsFactory', foModel, {
  title: 'Understand DevSecOps',
  subtitle: 'Strutured Flexability'
})

DevSecOpsShapes.define<foImage2D>('Image', foImage2D, {
  background: 'green',
  imageURL: "https://lorempixel.com/900/500?r=2",
  width: 400,
  height: 250
});

DevSecOpsSolids.define<foShape3D>('red box', foShape3D, {
  color: 'red',
  opacity: .5,
  width: 100,
  height: 400,
  depth: 900
})

function getConcept(name:string, spec?:any){
  return DevSecOpsKnowledge.concepts.define(name,foComponent,spec).hide();
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
  .subSolution('security', DevSecOpsKnowledge.solutions.define('security').hide() )
  .subSolution('metrics', DevSecOpsKnowledge.solutions.define('metrics').hide() )
  .subSolution('governance', DevSecOpsKnowledge.solutions.define('governance').hide() )
  //.useStructureWhen(pipe, function(c) { return true});


