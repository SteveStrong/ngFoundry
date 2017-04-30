
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

export class SwimElementDef extends foConcept {
    constructor(properties?: any) {
        super(properties);
        this.myType = 'SwimElementDef';
        this.createCustom((properties?, subcomponents?, parent?) => {
            return new SwimElementView(properties, subcomponents, parent);
        });
    }
}

export class SwimElementView extends foComponent {
    constructor(properties?:any, subcomponents?:Array<foComponent>, parent?:foObject) {
        super(properties,subcomponents,parent);
        this.myType = 'SwimElementView';
    }
    translate () {
        return makeTransform(this['pinX'], this['pinY'])
    }
}

export class SwimLaneDef extends foConcept {
    constructor(properties?: any) {
        super(properties);
        this.myType = 'SwimLaneDef';
        this.createCustom((properties?, subcomponents?, parent?) => {
            return new SwimLaneView(properties, subcomponents, parent);
        });
    }
}

export class SwimLaneView extends foComponent {
    constructor(properties?:any, subcomponents?:Array<foComponent>, parent?:foObject) {
        super(properties,subcomponents,parent);
        this.myType = 'SwimLaneView';
    }
    translate () {
        return makeTransform(this['pinX'], this['pinY'])
    }
}

export class SwimDictionary {

    elementDefaults = {
        width: 240,
        gap: 5,
        height: 90,
        pinX: function() { return this.gap; },
        pinY: function () {
            return this.gap + (this.height + this.gap) * ( 1 + this.index);
        }
    }

    swimViewDef: SwimElementDef = new SwimElementDef(this.elementDefaults);


    laneDefaults = {
        width: 250,
        gap: 5,
        height: 800,
        pinX: function() { 
            return this.gap + (this.width + this.gap) * this.index;
        },
        pinY: function () {
            return this.gap;
        }
    }

    swimLaneViewDef: SwimLaneDef = new SwimLaneDef(this.laneDefaults);
}
