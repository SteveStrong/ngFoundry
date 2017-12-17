
import { Tools } from '../foundry/foTools'
import { PubSub } from "../foundry/foPubSub";
import { cPoint } from "../foundry/foGeometry";
import { iShape, iPoint, iSize, Action } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { foCollection } from '../foundry/foCollection.model'
import { foDictionary } from "../foundry/foDictionary.model";

import { foNode } from '../foundry/foNode.model'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'

import { foGlyph } from '../foundry/foGlyph.model'
import { foShape2D } from '../foundry/foShape2D.model'
//https://greensock.com/docs/TweenMax
import { TweenLite, TweenMax, Back, Power0, Bounce } from "gsap";


//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foPage extends foShape2D {

    gridSizeX: number = 50;
    gridSizeY: number = 50;

    protected _marginX: number;
    get marginX(): number { return this._marginX || 0.0; }
    set marginX(value: number) { this._marginX = value; }

    protected _marginY: number;
    get marginY(): number { return this._marginY || 0.0; }
    set marginY(value: number) { this._marginY = value; }

    protected _scaleX: number;
    get scaleX(): number { return this._scaleX || 1.0; }
    set scaleX(value: number) { this._scaleX = value; }

    protected _scaleY: number;
    get scaleY(): number { return this._scaleY || 1.0; }
    set scaleY(value: number) { this._scaleY = value; }

    mouseLoc: any = {};
    sitOnShape: any = {};


    _dictionary: foDictionary<foNode> = new foDictionary<foNode>();
    _ctx: CanvasRenderingContext2D;

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myGuid;
        this.setupMouseEvents();
    }



    findItem(key: string, onMissing?: Action<foGlyph>) {
        return this._dictionary.findItem(key, onMissing);
    }

    found(key: string, onFound?: Action<foGlyph>) {
        return this._dictionary.found(key, onFound);
    }

    findHitShape(loc: iPoint, deep: boolean = true, exclude: foGlyph = null): foGlyph {
        let found:foGlyph = undefined;
        for (var i: number = 0; i < this._subcomponents.length; i++) {
            let shape: foGlyph = this._subcomponents.getMember(i);
            if ( shape == exclude ) continue;
            found = <foGlyph>shape.findObjectUnderPoint(loc, deep, this._ctx);
            if ( found ) break
        }
        return found;
    }

    findShapeUnder(source: foGlyph, deep: boolean = true, exclude: foGlyph = null): foGlyph {
        for (var i: number = 0; i < this._subcomponents.length; i++) {
            let shape: foGlyph = this._subcomponents.getMember(i);
            if (shape != source && source.findObjectUnderShape(shape, deep, this._ctx)) {
                return shape;
            }
        }
        return null;
    }

    addToModel(shape: foGlyph) {
        let guid = shape.myGuid;
        this._dictionary.findItem(guid, () => {
            this._dictionary.addItem(guid, shape);
            this._subcomponents.addMember(shape);
        });
        return shape;
    }

    removeFromModel(shape: foGlyph) {
        let guid = shape.myGuid;
        this._dictionary.found(guid, () => {
            shape.isSelected = false;
            this._dictionary.removeItem(guid);
            this._subcomponents.removeMember(shape);
        });
    }

    clearAll() {
        this._subcomponents.clearAll();
        this._dictionary.clearAll();
    }

    deleteSelected(onComplete?: Action<foGlyph>) {
        let found = this._subcomponents.filter(item => { return item.isSelected; })[0];
        if (found) {
            this.removeFromModel(found);
            onComplete && onComplete(found);
        }
    }

    setupMouseEvents() {
        let shape: foGlyph = null;
        let overshape: foGlyph = null;
        let hovershape: foGlyph = null;
        let offset: iPoint = null;

        PubSub.Sub('mousedown', (loc: cPoint, e) => {
            loc.add(this.marginX, this.marginY);
            this.onMouseLocationChanged(loc, "down");

            this._subcomponents.forEach(item => {
                item.isSelected = false;
            });

            shape = this.findHitShape(loc);
            if (shape) {
                this._subcomponents.moveToTop(shape);
                shape.isSelected = true;
                offset = shape.getOffset(loc);
            }
        });

        PubSub.Sub('mousemove', (loc: cPoint, e) => {
            if (shape) {
                this.onMouseLocationChanged(loc, "move");
                shape.doMove(loc, offset);

                if (!overshape) {
                    overshape = this.findShapeUnder(shape);
                    if (overshape) {
                        overshape['saveColor'] = overshape.color;
                        //overshape['hold'] = overshape.getSize(1);
                        //let size = overshape.getSize(1.1);
                        //let target = overshape.getSize(1.1);
                        //size['ease'] = Power0.easeNone;
                        //size['onComplete'] = () => {
                        overshape.setColor('orange');
                        //overshape.override(target);
                        //}
                        //TweenMax.to(overshape, 0.3, size);
                    }
                } else if (!overshape.overlapTest(shape, this._ctx)) {
                    //let target = overshape['hold'];
                    //let size = overshape['hold'];
                    //size['ease'] = Power0.easeNone;
                    //size['onComplete'] = () => {
                    overshape.setColor(overshape['saveColor']);
                    delete overshape['saveColor'];
                    //overshape.override(target);
                    //delete overshape['hold'];
                    overshape = null;
                    //}
                    //TweenMax.to(overshape, 0.3, size);
                }

            } else {
                this.onMouseLocationChanged(loc, "hover");
                loc.add(this.marginX, this.marginY);
                let found = this.findHitShape(loc);
                //console.log('found=', found);
                //console.log('hovershape=', hovershape);
                if (found && found == hovershape) {
                    this.onItemHoverEnter(loc, hovershape);
                } else if (found) {
                    hovershape && this.onItemHoverExit(loc, hovershape);
                    hovershape = found;
                    this.onItemHoverEnter(loc, hovershape);
                } else if (hovershape) {
                    this.onItemHoverExit(loc, hovershape);
                    hovershape = undefined;
                }

            }
            this.sitOnShape = overshape || {};
        });

        PubSub.Sub('mouseup', (loc: cPoint, e) => {
            this.onMouseLocationChanged(loc, "up");
            if (!shape) return;

            this._subcomponents.moveToTop(shape);
            let drop = shape.getLocation();
            drop['myGuid'] = shape['myGuid'];

            if (overshape) {
                this.removeFromModel(shape);
                overshape.addSubcomponent(shape, {
                    x: 0,
                    y: 0
                });
                this.onItemChangedParent(shape)
            } else {
                this.onItemChangedPosition(shape)
            }

            shape = null;
        });

    }

    public onMouseLocationChanged = (loc: cPoint, state: string): void => {
        this.mouseLoc = loc;
        this.mouseLoc.state = state;
    }

    public onItemChangedParent = (shape: foGlyph): void => {
    }

    public onItemChangedPosition = (shape: foGlyph): void => {
    }

    public onItemHoverEnter = (loc: cPoint, shape: foGlyph): void => {
    }

    public onItemHoverExit = (loc: cPoint, shape: foGlyph): void => {
    }

    drawGrid(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();

        ctx.setLineDash([5, 1]);
        ctx.strokeStyle = 'gray';

        //draw vertical...
        for (var i = 0; i < this.width; i += this.gridSizeX) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.height);
        }

        //draw horizontal...
        for (var i = 0; i < this.height; i += this.gridSizeY) {
            ctx.moveTo(0, i);
            ctx.lineTo(this.width, i);
        }
        ctx.stroke();
        ctx.restore();
    }


    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        this._ctx = ctx;

        let angle = this.rotation() * Math.PI / 180
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);

        ctx.save();
        ctx.transform(cos, sin, -sin, cos, this.marginX, this.marginY);

        this.preDraw && this.preDraw(ctx);
        this.draw(ctx);
        this.drawHover && this.drawHover(ctx);
        this.postDraw && this.postDraw(ctx);

        deep && this._subcomponents.forEach(item => {
            item.render(ctx, deep);
        });
        ctx.restore();

        this.afterRender && this.afterRender(ctx);
    }


    public draw = (ctx: CanvasRenderingContext2D): void => {
        this.drawGrid(ctx);
    }
}



