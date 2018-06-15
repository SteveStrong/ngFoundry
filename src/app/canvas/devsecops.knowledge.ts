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

const user = Concept('user');
const developer = Concept('developer').inheritsFrom(user);
const tester = Concept('tester').inheritsFrom(user);

const test = Concept('test');

const compile = Concept('compile');
compile.subComponent('details');

const stage1 = Structure('stage1').concept(compile);

const stage2 = Structure('stage2').concept(test);

const stage3 = Structure('stage3')
  .concept(Concept('package'))
  .subComponent('local');

const pipe = Structure('Pipeline').show()
  .concept(root)
  .subComponent('stage1', stage1)
  .subComponent('stage2', stage2)
  .subComponent('stage3', stage3);


  Solution('DevOps').show()
  .useStructure(pipe)
  .subSolution('security', Solution('security'))
  .subSolution('metrics', Solution('metrics'))
  .subSolution('governance', Solution('governance'));
//.useStructureWhen(pipe, function(c) { return true});
