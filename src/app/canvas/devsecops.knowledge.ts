import { foComponent } from '../foundry/foComponent.model';
import { DevSecOpsKnowledge } from './devsecops.model';

function getConcept(name: string, spec?: any) {
  return DevSecOpsKnowledge.concepts.define(name, foComponent, spec).hide();
}

function getSolution(name: string, spec?: any) {
  return DevSecOpsKnowledge.solutions.define(name, spec).hide();
}

const root = getConcept('Root', {
  pipelineName: 'dave'
});

const compile = getConcept('compile');
compile.subComponent('details', {});

const s1 = DevSecOpsKnowledge.structures
  .define('stage1', {})
  .concept(compile)
  .hide();

const s2 = DevSecOpsKnowledge.structures
  .define('stage2', {})
  .concept(getConcept('test'))
  .hide();

const s3 = DevSecOpsKnowledge.structures
  .define('stage3', {})
  .concept(getConcept('package'))
  .hide()
  .subComponent('local', {});

const pipe = DevSecOpsKnowledge.structures
  .define('Pipeline', {})
  .concept(root)
  .subComponent('s1', s1)
  .subComponent('s2', s2)
  .subComponent('s3', s3);

DevSecOpsKnowledge.solutions
  .define('DevOps')
  .useStructure(pipe)
  .subSolution('security', getSolution('security'))
  .subSolution('metrics', getSolution('metrics'))
  .subSolution('governance', getSolution('governance'));
//.useStructureWhen(pipe, function(c) { return true});
