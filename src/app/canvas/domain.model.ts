
import { foLibrary } from '../foundry/foLibrary.model';
import { foComponent } from '../foundry/foComponent.model';
//import { RuntimeType } from '../foundry/foRuntimeType';

export let PersonDomain: foLibrary = new foLibrary().defaultName();


PersonDomain.concepts.define('Person', foComponent, {
  firstName: 'Red',
  lastName: 'Faceplant',
  fullName: function () {
    return this.firstName + '  ' + this.lastName;
  }
});




