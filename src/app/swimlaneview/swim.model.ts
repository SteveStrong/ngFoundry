
import { Tools } from '../foundry/foTools'
import { foObject, iObject } from '../foundry/foObject.model'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'




export class svgConcept extends foConcept {
    constructor(properties?: any) {
        super(properties);
        this.myType = 'svgConcept';
        this.createCustom((properties?, subcomponents?, parent?) => {
            return new svgShapeView(properties, subcomponents, parent);
        });
    }
}

export class svgShapeView extends foComponent {
    nativeElement;

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myType = 'svgShapeView';
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
