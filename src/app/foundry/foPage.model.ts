
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
//https://greensock.com/docs/TweenMax
import { TweenLite, TweenMax, Back, Power0, Bounce } from "gsap";


//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foPage extends foGlyph {

    mouseLoc: any = {};
    sitOnShape: any = {};


    _dictionary: foDictionary<foGlyph> = new foDictionary<foGlyph>();

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myGuid;
        this.setupMouseEvents();
    }

    findItem(key: string, onMissing?) {
        return this._dictionary.findItem(key, onMissing);
    }

    found(key: string, onFound?) {
        return this._dictionary.found(key, onFound);
    }

    findHitShape(loc: iPoint, exclude: foGlyph = null): foGlyph {
        for (var i: number = 0; i < this._subcomponents.length; i++) {
            let shape: foGlyph = this._subcomponents.getMember(i);
            if (shape != exclude && shape.hitTest(loc)) {
                return shape;
            }
        }
        return null;
    }

    findShapeUnder(source: foGlyph): foGlyph {
        for (var i: number = 0; i < this._subcomponents.length; i++) {
            let shape: foGlyph = this._subcomponents.getMember(i);
            if (shape != source && source.overlapTest(shape)) {
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
    }

    removeFromModel(shape: foGlyph) {
        let guid = shape.myGuid;
        this._dictionary.found(guid, () => {
            this._dictionary.removeItem(guid);
            this._subcomponents.removeMember(shape);
        });
    }

    deleteSelected() {
        let found = this._subcomponents.filter(item => { return item.isSelected; })[0];
        if (found) {
            this.removeFromModel(found);
        }
    }

    setupMouseEvents() {
        let shape: foGlyph = null;
        let overshape: foGlyph = null;
        //let mySelf = this;
        let offset: cPoint = null;

        PubSub.Sub('mousedown', (loc: iPoint, e) => {
            shape = this.findHitShape(loc);
            this._subcomponents.forEach(item => {
                item.isSelected = false;
            });

            if (shape) {
                this._subcomponents.moveToTop(shape);
                shape.isSelected = true;
                //this.selections.push(shape);
                offset = shape.getOffset(loc);
            }
            this.mouseLoc = loc;
            //Toast.success(JSON.stringify(loc), "mousedown");
        });

        PubSub.Sub('mousemove', (loc: iPoint, e) => {

            if (shape) {
                shape.doMove(loc, offset);

                if (!overshape) {
                    overshape = this.findShapeUnder(shape);
                    if (overshape) {
                        overshape['hold'] = overshape.getSize(1);
                        let size = overshape.getSize(1.1);
                        let target = overshape.getSize(1.1);
                        size['ease'] = Power0.easeNone;
                        size['onComplete'] = () => {
                            overshape.setColor('orange');
                            overshape.override(target);
                        }
                        TweenMax.to(overshape, 0.3, size);
                    }
                } else if (!overshape.overlapTest(shape)) {
                    let target = overshape['hold'];
                    let size = overshape['hold'];
                    size['ease'] = Power0.easeNone;
                    size['onComplete'] = () => {
                        overshape.setColor('green');
                        overshape.override(target);
                        delete overshape['hold'];
                        overshape = null;
                    }
                    TweenLite.to(overshape, 0.3, size);
                }

            }
            this.sitOnShape = overshape || {};
            this.mouseLoc = loc;

        });

        PubSub.Sub('mouseup', (loc: iPoint, e) => {
            if (!shape) return;

            this._subcomponents.moveToTop(shape);
            let drop = shape.getLocation();
            drop['myGuid'] = shape['myGuid'];
            shape = null;
            //Toast.success(JSON.stringify(loc), "mouseup");
            //this.signalR.pubChannel("move", drop);
        });

    }

    drawGrid(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'gray';
        //ctx.lineWidth = 0;

        let size = 50;
        //draw vertical...
        for (var i = 0; i < this.width; i += size) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.height);
        }

        //draw horizontal...
        for (var i = 0; i < this.height; i += size) {
            ctx.moveTo(0, i);
            ctx.lineTo(this.width, i);
        }


        ctx.stroke();
        ctx.restore();
    }

    public hitTest = (hit: iPoint): boolean => {
        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;

        if (hit.x < x) return false;
        if (hit.x > x + width) return false;
        if (hit.y < y) return false;
        if (hit.y > y + height) return false;
        return true;
    }

    public overlapTest = (hit: iShape): boolean => {
        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;

        let loc = hit.getLocation();
        let size = hit.getSize(1.0);
        if (loc.x > x + width) return false;
        if (loc.x + size.width < x) return false;
        if (loc.y > y + height) return false;
        if (loc.y + size.height < y) return false;
        return true;
    }

    public doMove(loc: iPoint, offset?: iPoint): iPoint {
        this.x = loc.x + (offset ? offset.x : 0);
        this.y = loc.y + (offset ? offset.y : 0);

        this._subcomponents.forEach(item => {
            item.doMove(loc, offset);
        });

        //structual type
        return {
            x: this.x,
            y: this.y
        }
    }

    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {

        this.draw(ctx);
        ctx.save();
        //ctx.translate(this.x, this.y);
        deep && this._subcomponents.forEach(item => {
            item.render(ctx, deep);
        });
        ctx.restore();
    }

    public drawHover = (ctx: CanvasRenderingContext2D): void => { }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => { }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        this.drawGrid(ctx);
    }

}



