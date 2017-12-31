
import { Tools } from '../foundry/foTools'
import { iObject } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'
import { foNode } from '../foundry/foNode.model'




export class svgConcept extends foConcept<foNode> {
    constructor(properties?: any) {
        super(properties);

        this.definePrimitive(svgShapeView);
    }
}

export class svgShapeView extends foComponent {
    nativeElement;

    height;
    width;
    name;

    title;

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    private makeTransform(dx: number, dy: number, s: number = 0) {
        if (s) {
            return `translate(${dx},${dy}) scale (${s})`
        }
        return `translate(${dx},${dy})`
    }

    translate(root?) {
        this.nativeElement = root ? root : this.nativeElement;
        return this.makeTransform(this['pinX'], this['pinY'])
    }

    refresh() {
        if (this.nativeElement) {
            this.nativeElement.setAttribute("transform", this.translate());
        }
        this.nodes.map(item => item.refresh())
    }

    isSelected = false;
    toggleSelected() {
        this.isSelected = !this.isSelected;
    }

    // textLength() {
    //     if (this.nativeElement && this.nativeElement.getComputedTextLength) {
    //         return this.nativeElement.getComputedTextLength();
    //     }
    //     return 240;
    // }

}
export class SwimDictionary {

    elementDefaults = {
        width: 240,
        gap: 5,
        height: 90,
        pinX: function () { return this.gap; },
        pinY: function () {
            return this.topEdge + 50;
        },
        topEdge: function () {
            if (this.prevChild) {
                return this.prevChild.bottomEdge + this.gap;
            }
            return 0;
        },
        bottomEdge: function () {
            return this.topEdge + this.height;
        }
    }

    swimElementDef: svgConcept = new svgConcept(this.elementDefaults);


    laneDefaults = {

        width: function () {
            if (!this.hasSubcomponents) {
                return 50;
            }
            let width = Math.max.apply(Math, this.nodes.map(function (o) { return o.width; }))
            return width + 2 * this.gap;
        },
        gap: 5,
        height: 800,
        pinX: function () {
            return this.leftEdge;
        },
        pinY: function () {
            return this.gap;
        },
        leftEdge: function () {
            if (this.prevChild) {
                return this.prevChild.rightEdge + this.gap;
            }
            return this.gap;
        },
        rightEdge: function () {
            return this.leftEdge + this.width;
        }
    }

    swimLaneDef: svgConcept = new svgConcept(this.laneDefaults);


    swimDefaults = {
        title: "The Docker Ecosystem. - dockercon17",
        width: 1800,
        height: 1000
    }

    swimDef: svgConcept = new svgConcept(this.swimDefaults);
}
