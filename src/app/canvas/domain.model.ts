
import { foLibrary } from "../foundry/foLibrary.model";
import { foComponent } from "../foundry/foComponent.model";
//import { RuntimeType } from '../foundry/foRuntimeType';

export let PersonDomain: foLibrary = new foLibrary().defaultName();


PersonDomain.establishConcept<foComponent>('Person', {
  firstName: 'Red',
  lastName: 'Faceplant',
  fullName: function () {
    return this.firstName + '  ' + this.lastName;
  }
});

PersonDomain.establishConcept<foComponent>('fullpipeline', {
  pipelineName: 'dave',
}).hide();

let compile = PersonDomain.establishConcept<foComponent>('compile').hide();


let s1 = PersonDomain.establishStructure('stage1', {})
        .concept(compile).hide();
let s2 = PersonDomain.establishStructure('stage2', {})
        .concept('test').hide();
let s3 = PersonDomain.establishStructure('stage3', {})
        .concept('package').hide();

PersonDomain.establishStructure('Pipeline', {
}).concept('fullpipeline')
  .subcomponent('s1', s1)
  .subcomponent('s2', s2)
  .subcomponent('s3', s3)


