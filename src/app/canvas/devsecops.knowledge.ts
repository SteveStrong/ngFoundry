import { foComponent } from '../foundry/foComponent.model';
import { foLibrary } from '../foundry/foLibrary.model';

export let DevSecOpsKnowledge: foLibrary = new foLibrary().defaultName('definitions');

function Concept(name: string, spec?: any) {
  return DevSecOpsKnowledge.concepts.define(name, foComponent, spec).hide();
}

function Structure(name: string, spec?: any) {
  return DevSecOpsKnowledge.structures.define(name, spec).hide();
}

function Solution(name: string, spec?: any) {
  return DevSecOpsKnowledge.solutions.define(name, spec).hide();
}

const root = Concept('Root', {
  pipelineName: 'dave'
});

const gitRepository = Concept('gitRepository');
const gitOrganization = Concept('gitOrganization');
const gitBranch = Concept('gitBranch');

const environment = Concept('environment');
const workpacket = Concept('workpacket');

const developer = Concept('developer');
const test = Concept('test');

const compile = Concept('compile');
compile.subComponent('details', {});

const stage1 = Structure('stage1').concept(compile);

const stage2 = Structure('stage2').concept(test);

const stage3 = Structure('stage3')
  .concept(Concept('package'))
  .subComponent('local');

const pipe = DevSecOpsKnowledge.structures
  .define('Pipeline', {})
  .concept(root)
  .subComponent('stage1', stage1)
  .subComponent('stage2', stage2)
  .subComponent('stage3', stage3);

DevSecOpsKnowledge.solutions
  .define('DevOps')
  .useStructure(pipe)
  .subSolution('security', Solution('security'))
  .subSolution('metrics', Solution('metrics'))
  .subSolution('governance', Solution('governance'));
//.useStructureWhen(pipe, function(c) { return true});
