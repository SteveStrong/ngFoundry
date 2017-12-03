
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

    protected _angle: number;
    get angle(): number { return this._angle || 0.0; }
    set angle(value: number) { this._angle = value; }

    protected _marginX: number;
    get marginX(): number { return this._marginX || 0.0; }
    set marginX(value: number) { this._marginX = value; }

    protected _marginY: number;
    get marginY(): number { return this._marginY || 0.0; }
    set marginY(value: number) { this._marginY = value; }

    mouseLoc: any = {};
    sitOnShape: any = {};


    _dictionary: foDictionary<foNode> = new foDictionary<foNode>();

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

    deleteSelected() {
        let found = this._subcomponents.filter(item => { return item.isSelected; })[0];
        if (found) {
            this.removeFromModel(found);
        }
    }

    setupMouseEvents() {
        let shape: foGlyph = null;
        let overshape: foGlyph = null;
        let offset: iPoint = null;

        PubSub.Sub('mousedown', (loc: cPoint, e) => {
            loc.add(this.marginX, this.marginY);
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

        PubSub.Sub('mousemove', (loc: cPoint, e) => {

            if (shape) {
                shape.doMove(loc, offset);

                if (!overshape) {
                    overshape = this.findShapeUnder(shape);
                    if (overshape) {
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
                } else if (!overshape.overlapTest(shape)) {
                    //let target = overshape['hold'];
                    //let size = overshape['hold'];
                    //size['ease'] = Power0.easeNone;
                    //size['onComplete'] = () => {
                    overshape.setColor('green');
                    //overshape.override(target);
                    //delete overshape['hold'];
                    overshape = null;
                    //}
                    //TweenMax.to(overshape, 0.3, size);
                }

            }
            this.sitOnShape = overshape || {};
            this.mouseLoc = loc;

        });

        PubSub.Sub('mouseup', (loc: cPoint, e) => {
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
            }
            shape = null;
            //Toast.success(JSON.stringify(loc), "mouseup");
            //this.signalR.pubChannel("move", drop);
        });

    }

    drawGrid(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();

        ctx.setLineDash([5, 1]);
        ctx.strokeStyle = 'gray';

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


    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {

        let angle = this.angle * Math.PI / 180
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);

        ctx.save();
        ctx.transform(cos, sin, -sin, cos, this.marginX, this.marginY);

        this.draw(ctx);

        deep && this._subcomponents.forEach(item => {
            item.render(ctx, deep);
        });
        ctx.restore();
    }


    public draw = (ctx: CanvasRenderingContext2D): void => {
        this.drawGrid(ctx);
        //this.drawRotateTest(ctx);
    }

    public drawCircle = (ctx: CanvasRenderingContext2D): void => {

        ctx.save();
        ctx.fillStyle = 'black';
        ctx.lineWidth = 1;
        ctx.globalAlpha = .8;
        ctx.setLineDash([])
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.restore();
    }

    drawRotateTest(ctx: CanvasRenderingContext2D) {

        function drawRotatedRect(x, y, width, height, degrees) {

            let angle = degrees * Math.PI / 180;
            // first save the untranslated/unrotated context
            ctx.save();

            let pinX = width / 2;
            let pinY = height / 2;

            ctx.beginPath();
            //https://stackoverflow.com/questions/17125632/html5-canvas-rotate-object-without-moving-coordinates
            // move the rotation point to the center of the rect
            //ctx.translate(x + pinX, y + pinY);   
            // rotate the rect
            //ctx.rotate(angle);


            let cos = Math.cos(angle);
            let sin = Math.sin(angle);
            ctx.transform(cos, sin, -sin, cos, x + pinX, y + pinY);

            // draw the rect on the transformed context
            // Note: after transforming [0,0] is visually [x,y]
            //       so the rect needs to be offset accordingly when drawn
            ctx.rect(-pinX, -pinY, width, height);

            ctx.fillStyle = "green";
            ctx.fill();

            mySelf.drawCircle(ctx);
            // restore the context to its untranslated/unrotated state
            ctx.restore();
            mySelf.drawCircle(ctx);

        }

        let angle = 0 * Math.PI / 180
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);

        ctx.save();
        ctx.transform(cos, sin, -sin, cos, 100, 300);


        let mySelf = this;
        mySelf.drawCircle(ctx);

        var startX = 0;
        var startY = 0;

        // draw an unrotated reference rect
        ctx.beginPath();
        ctx.rect(startX, startY, 250, 10);
        ctx.fillStyle = "blue";
        ctx.fill();

        // draw a rotated rect
        drawRotatedRect(startX, startY, 350, 10, 30);

        ctx.restore();
    }

}



