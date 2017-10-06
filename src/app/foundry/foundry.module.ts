import { NgModule }      from '@angular/core';

import { foTools, Tools } from './foTools'

import { foKnowledge } from './foKnowledge.model'
import { foDictionary } from './foDictionary.model'
import { foAttribute } from './foAttribute.model'

import { foObject, iObject } from './foObject.model'
import { foComponent } from './foComponent.model'
import { foNode } from './foNode.model'


@NgModule({
  imports: [
  ],
  declarations: [
    
  ],
  providers: [
  ],
  exports: [
    foNode,
    foObject,
    foTools
  ]
})
export class foundryModule { }
