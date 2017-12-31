
import { Tools } from '../foundry/foTools'
import { PubSub } from "../foundry/foPubSub";
import { cPoint, cFrame } from "../foundry/foGeometry";
import { iShape, iPoint, iSize, Action } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { foCollection } from '../foundry/foCollection.model'
import { foDictionary } from "../foundry/foDictionary.model";

import { foNode } from '../foundry/foNode.model'
import { Matrix2D } from '../foundry/foMatrix2D'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'

import { foGlyph } from '../foundry/foGlyph.model'
import { foShape2D } from '../foundry/foShape2D.model'
import { foHandle } from 'app/foundry/foHandle';


//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foPage extends foShape2D {

    gridSizeX: number = 50;
    gridSizeY: number = 50;
    showBoundry: boolean = false;

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

    _dictionary: foDictionary<foNode> = new foDictionary<foNode>();
    _ctx: CanvasRenderingContext2D;

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.color = 'Linen';
        this.setupMouseEvents();
    }

    //this is used to drop shapes
    get centerX(): number { return this.width / 2; }
    get centerY(): number { return this.height / 2; }
 

    findItem(key: string, onMissing?: Action<foGlyph>, onFound?: Action<foGlyph>) {
        return this._dictionary.findItem(key, onMissing, onFound);
    }

    found(key: string, onFound?: Action<foGlyph>, onMissing?: Action<foGlyph>) {
        return this._dictionary.found(key, onFound, onMissing);
    }

    getMatrix() {
        if (this._matrix === undefined) {
            this._matrix = new Matrix2D();
            this._matrix.appendTransform(this.marginX, this.marginY, this.scaleX, this.scaleY, this.rotation(), 0, 0, 0, 0);
        }
        return this._matrix;
    };

    findHitShape(hit: iPoint, deep: boolean = true, exclude: foGlyph = null): foGlyph {
        let found: foGlyph = undefined;
        for (var i: number = 0; i < this.nodes.length; i++) {
            let shape: foGlyph = this.nodes.getMember(i);
            if (shape == exclude) continue;
            found = shape.findObjectUnderPoint(hit, deep, this._ctx);
            if (found) return found;
        }
    }

    findShapeUnder(source: foGlyph, deep: boolean = true, exclude: foGlyph = null): foGlyph {
        let frame = source.boundryFrame;
        for (var i: number = 0; i < this.nodes.length; i++) {
            let shape: foGlyph = this.nodes.getMember(i);
            if (source.hasAncestor(shape) || shape == exclude) continue;
            if (shape.findObjectUnderFrame(source, frame, deep, this._ctx)) {
                return shape;
            }
        }
    }


    addSubcomponent(obj: foNode, properties?: any) {
        let guid = obj.myGuid;
        this._dictionary.findItem(guid, () => {
            this._dictionary.addItem(guid, obj);
            super.addSubcomponent(obj, properties);
        });
        return obj;
    }


    removeSubcomponent(obj: foNode) {
        let guid = obj.myGuid;
        this._dictionary.found(guid, () => {
            (<foGlyph>obj).isSelected = false;
            this._dictionary.removeItem(guid);
            super.removeSubcomponent(obj);
        });
        return obj;
    }

    clearAll() {
        this._subcomponents.clearAll();
        this._dictionary.clearAll();
    }

    deleteSelected(onComplete?: Action<foGlyph>) {
        let found = this._subcomponents.filter(item => { return item.isSelected; })[0];
        if (found) {
            this.removeSubcomponent(found);
            onComplete && onComplete(found);
        }
    }

    setupMouseEvents() {
        let shape: foGlyph = null;
        let shapeUnder: foGlyph = null;
        let hovershape: foGlyph = null;
        let offset: iPoint = null;
        let handles: foCollection<foHandle> = new foCollection<foHandle>()
        let grab: foHandle = null;
        let float: foHandle = null;

        function findHandle(loc: cPoint): foHandle {
            for (var i: number = 0; i < handles.length; i++) {
                let handle: foHandle = handles.getChildAt(i);
                if (handle.hitTest(loc)) {
                    return handle;
                }
            }
        }

        PubSub.Sub('mousedown', (loc: cPoint, e, keys) => {
            loc.add(this.marginX, this.marginY);
            this.onMouseLocationChanged(loc, "down", keys);

            grab = findHandle(loc);
            if (grab) {
                offset = grab.getOffset(loc);
                return;
            }

            if (!keys.shift) {
                grab = null;
                handles.clearAll();
                this._subcomponents.forEach(item => {
                    item.unSelect();
                });
            }

            shape = this.findHitShape(loc);
            if (shape) {
                this._subcomponents.moveToTop(shape);
                shape.isSelected = true;
                offset = shape.getOffset(loc);
                handles.copyMembers(shape.handles);
            }

        });

        PubSub.Sub('mousemove', (loc: cPoint, e, keys) => {
            if (findHandle(loc) && handles.length) {
                //this.onHandleMoving(loc, handles.first(), keys);
                this.onTrackHandles(loc, handles, keys);
            }

            handles.forEach(handle => {
                handle.color = handle.hitTest(loc) ? 'yellow' : 'black'
            })


            if (grab) {
                this.onHandleMoving(loc, grab, keys)
                grab.moveTo(loc, offset);
            } else if (shape) {
                this.onMouseLocationChanged(loc, "move", keys);
                shape.moveTo(loc, offset);

                if (keys.ctrl) {
                    let found = this.findShapeUnder(shape);
                    if (found && found == shapeUnder) {
                        this.onItemOverlapEnter(loc, shape, shapeUnder, keys);
                    } else if (found) {
                        shapeUnder && this.onItemOverlapExit(loc, shape, shapeUnder, keys);
                        shapeUnder = found;
                        this.onItemOverlapEnter(loc, shape, shapeUnder, keys);
                    } else if (shapeUnder) {
                        this.onItemOverlapExit(loc, shape, shapeUnder, keys);
                        shapeUnder = null;
                    }
                } else {
                    shapeUnder && this.onItemOverlapExit(loc, shape, shapeUnder, keys);
                    shapeUnder = null;
                }


            } else {
                this.onMouseLocationChanged(loc, "hover", keys);
                loc.add(this.marginX, this.marginY);

                let found = this.findHitShape(loc);
                if (found && found == hovershape) {
                    this.onItemHoverEnter(loc, hovershape);
                } else if (found) {
                    hovershape && this.onItemHoverExit(loc, hovershape);
                    hovershape = found;
                    this.onItemHoverEnter(loc, hovershape);
                } else if (hovershape) {
                    this.onItemHoverExit(loc, hovershape);
                    grab && this.onHandleHoverExit(loc, grab, keys)
                    hovershape = undefined;
                    grab = undefined;
                }


                let handle = findHandle(loc);
                if (handle && handle == float) {
                    float = handle;
                    this.onHandleHoverEnter(loc, handle, keys)
                } else if (handle) {
                    float && this.onHandleHoverExit(loc, float, keys)
                    float = handle;
                    this.onHandleHoverEnter(loc, float, keys)
                } else if (float) {
                    this.onHandleHoverExit(loc, handle, keys)
                    float = null;
                }
            }
        });

        PubSub.Sub('mouseup', (loc: cPoint, e, keys) => {
            grab = null;
            this.onMouseLocationChanged(loc, "up", keys);
            if (!shape) return;

            this._subcomponents.moveToTop(shape);

            if (shapeUnder && keys.ctrl) {
                //foObject.beep();
                let { x, y } = shape.getLocation();
                let drop = shapeUnder.globalToLocal(x, y);
                shapeUnder.addSubcomponent(shape.removeFromParent());
                shape.easeTo(drop.x, drop.y);
                //shape.easeTo(0, 0);
                shapeUnder = null;
                this.onItemChangedParent(shape)
            } else {
                this.onItemChangedPosition(shape)
            }

            if (shape.myParent() != this && keys.ctrl) {
                //foObject.beep();
                let { x, y } = shape.pinLocation();
                let drop = shape.localToGlobal(x, y);
                this.addSubcomponent(shape.removeFromParent());
                shape.easeTo(drop.x, drop.y);
                this.onItemChangedParent(shape)
            }

            shape = shapeUnder = null;

        });

    }

    public onMouseLocationChanged = (loc: cPoint, state: string, keys?: any): void => {
        this.mouseLoc = loc;
        this.mouseLoc.state = state;
        this.mouseLoc.keys = keys;
    }

    public onItemChangedParent = (shape: foGlyph): void => {
    }

    public onItemChangedPosition = (shape: foGlyph): void => {
    }

    public onItemOverlapEnter = (loc: cPoint, shape: foGlyph, shapeUnder: foGlyph, keys?: any): void => {
    }

    public onItemOverlapExit = (loc: cPoint, shape: foGlyph, shapeUnder: foGlyph, keys?: any): void => {
    }

    public onItemHoverEnter = (loc: cPoint, shape: foGlyph, keys?: any): void => {
    }

    public onItemHoverExit = (loc: cPoint, shape: foGlyph, keys?: any): void => {
    }

    public onHandleHoverEnter = (loc: cPoint, handle: foHandle, keys?: any): void => {
    }

    public onHandleMoving = (loc: cPoint, handle: foHandle, keys?: any): void => {
    }

    public onHandleHoverExit = (loc: cPoint, handle: foHandle, keys?: any): void => {
    }

    public onTrackHandles = (loc: cPoint, handles: foCollection<foHandle>, keys?: any): void => {
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

    get boundryFrame(): cFrame {
        let frame = this.nodes.first().boundryFrame;
        this.nodes.forEach(item => {
            frame.merge(item.boundryFrame);
        });
        return frame;
    }

    public afterRender = (ctx: CanvasRenderingContext2D, deep: boolean = true) => {
        ctx.save();
        deep && this.nodes.forEach(item => {
            item.afterRender(ctx, deep);
        });
        ctx.restore();
    }

    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        this._ctx = ctx;

        ctx.save();
        this.updateContext(ctx);

        this.preDraw && this.preDraw(ctx);
        this.draw(ctx);
        this.drawHover && this.drawHover(ctx);
        this.postDraw && this.postDraw(ctx);

        deep && this._subcomponents.forEach(item => {
            item.render(ctx, deep);
        });
        ctx.restore();

        this.showBoundry && this.afterRender(ctx);
    }


    public draw = (ctx: CanvasRenderingContext2D): void => {
        this.drawGrid(ctx);
    }
}



