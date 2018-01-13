
import { foLibrary } from "../foundry/foLibrary.model";
import { foComponent } from "../foundry/foComponent.model";
//import { RuntimeType } from '../foundry/foRuntimeType';

export let PersonDomain: foLibrary = new foLibrary().defaultName();


PersonDomain.establishConcept<foComponent>('Person',{
  firstName: 'Red',
  lastName: 'Faceplant',
  fullName: function() {
    return this.firstName + '  ' + this.lastName;
  }
});

