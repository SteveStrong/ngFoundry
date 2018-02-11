
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

let pipeDef = PersonDomain.establishConcept<foComponent>('fullpipeline', {
  pipelineName: 'dave',
});

let s1 = PersonDomain.establishStructure('stage1', {});
let s2 = PersonDomain.establishStructure('stage2', {});
let s3 = PersonDomain.establishStructure('stage3', {});

PersonDomain.establishStructure('Pipeline', {
}).concept(pipeDef)
  .subcomponent(s1)
  .subcomponent({

  });

