
import { Tools } from '../foundry/foTools'
import { foObject, iObject } from '../foundry/foObject.model'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'

function makeTransform(dx: number, dy: number, s: number = 0) {
    if (s) {
        return `translate(${dx},${dy}) scale (${s})`
    }
    return `translate(${dx},${dy})`
}

export class SwimDef extends foConcept {
    constructor(properties?: any) {
        super(properties);
        this.myType = 'SwimDef';
        this.createCustom((properties?, subcomponents?, parent?) => {
            return new SwimView(properties, subcomponents, parent);
        });
    }
}

export class SwimView extends foComponent {
    constructor(properties?:any, subcomponents?:Array<foComponent>, parent?:foObject) {
        super(properties,subcomponents,parent);
        this.myType = 'SwimView';
    }
    translate () {
        return makeTransform(this['pinX'], this['pinY'])
    }
}

export class SwimDictionary {

    defaults = {
        width: 240,
        gap: 5,
        height: 90,
        pinX: function() { return this.gap; },
        pinY: function () {
            return this.gap + (this.height + this.gap) * ( 1 + this.index);
        }
    }

    swimViewDef: SwimDef = new SwimDef(this.defaults);

}
