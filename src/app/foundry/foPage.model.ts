
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
import { Lifecycle } from 'app/foundry/foLifecycle';


//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foPage extends foShape2D {

    gridSizeX: number = 50;
    gridSizeY: number = 50;
    showBoundry: boolean = false;

    protected _marginX: number;
    get marginX(): number { return this._marginX || 0.0; }
    set marginX(value: number) {
        this.smash();
        this._marginX = value;
    }

    protected _marginY: number;
    get marginY(): number { return this._marginY || 0.0; }
    set marginY(value: number) {
        this.smash();
        this._marginY = value;
    }

    protected _scaleX: number;
    get scaleX(): number { return this._scaleX || 1.0; }
    set scaleX(value: number) {
        this.smash();
        this._scaleX = value;
    }

    protected _scaleY: number;
    get scaleY(): number { return this._scaleY || 1.0; }
    set scaleY(value: number) {
        this.smash();
        this._scaleY = value;
    }

    public pinX = (): number => { return 0 * this.width; }
    public pinY = (): number => { return 0 * this.height; }
    public rotation = (): number => { return this.angle; }

    mouseLoc: any = {};

    _dictionary: foDictionary<foNode> = new foDictionary<foNode>();
    _ctx: CanvasRenderingContext2D;

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.color = 'Linen';
        this.x = this.y = 100;
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
            this._matrix.appendTransform(this.marginX + this.x, this.marginY + this.y, this.scaleX, this.scaleY, this.rotation(), 0, 0, this.pinX(), this.pinY());
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


    clearPage() {
        //simulate delete lifecycle in bulk via events
        this.nodes.forEach(item => {
            Lifecycle.unparent(item);
            Lifecycle.destroyed(item);
        })
        this._subcomponents.clearAll();
        this._dictionary.clearAll();
    }

    deleteSelected(onComplete?: Action<foGlyph>) {
        let found = this._subcomponents.filter(item => { return item.isSelected; })[0];
        if (found) {
            this.destroyed(found);
            onComplete && onComplete(found);
        }
    }

    zoomBy(zoom: number) {
        this.scaleX *= zoom;
        this.scaleY *= zoom;

    }

    zoomToCenter(g: cPoint, zoom: number, e: WheelEvent) {

        //you need to track this position in global space
        //so you can return it to the same location on the screen
        var pt1 = this.globalToLocalPoint(g);

        this.zoomBy(zoom);
        //page.updatePIP();

        //once the zoom is applied, measure where the global point has moved to
        //then pan back so it is in the center...
        let pt2 = this.localToGlobal(pt1.x, pt1.y);

        this.x += pt1.x - pt2.x;
        this.y += pt1.y - pt2.y;
        //console.log(pt2.x, pt2.y)

        //page.updatePIP();
    }

    setupMouseEvents() {
        let shape: foGlyph = null;
        let shapeUnder: foGlyph = null;
        let hovershape: foGlyph = null;
        let lastSelected: foGlyph = null;
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

        PubSub.Sub('mousedown', (loc: cPoint, e: MouseEvent, keys) => {
            loc.add(this.marginX, this.marginY);
            this.onMouseLocationChanged(loc, "down", keys);

            grab = findHandle(loc);
            if (grab) {
                offset = grab.getOffset(loc);
                return;
            }

            let found = this.findHitShape(loc);

            if (!keys.shift) {
                grab = null;
                handles.clearAll();
                this._subcomponents.forEach(item => {
                    item.unSelect(true,found);
                });
            }

            if (found) {
                shape = found;
                this._subcomponents.moveToTop(shape);
                shape.isSelected = true;
                offset = shape.getOffset(loc);
                handles.copyMembers(shape.handles);
            }

        });

        PubSub.Sub('mousemove', (loc: cPoint, e: MouseEvent, keys) => {
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

        PubSub.Sub('mouseup', (loc: cPoint, e: MouseEvent, keys) => {
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

        PubSub.Sub('wheel', (loc: cPoint, g: cPoint, zoom: number, e: WheelEvent, keys) => {
            this.onMouseLocationChanged(loc, "wheel", keys);
            if ( keys.shift && keys.ctrl) {
                this.zoomToCenter(g, zoom, e);
            }
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

        let left = this.marginX - this.x;
        let top = this.marginY - this.y;
        let width = this.width / this.scaleX;
        let height = this.height / this.scaleY;
        let right = left + width;
        let bottom = top + height;

        //ctx.fillStyle = 'yellow';
        //ctx.fillRect(left,top, width, height);

        //draw vertical...
        let x = this.gridSizeX; //left;
        while (x < right) {
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            x += this.gridSizeX
        }
        x = -this.gridSizeX; //left;
        while (x > left) {
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            x -= this.gridSizeX;
        }


        //draw horizontal...
        let y = this.gridSizeY; //top;
        while (y < bottom) {
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            y += this.gridSizeY;
        }

        y = -this.gridSizeY; //top;
        while (y > top) {
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            y -= this.gridSizeY;
        }

        ctx.stroke();
        ctx.restore();
    }

    drawAxis(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;

        let left = this.marginX - this.x;
        let top = this.marginY - this.y;
        let width = this.width / this.scaleX;
        let height = this.height / this.scaleY;
        let right = left + width;
        let bottom = top + height;

        //draw vertical...
        ctx.moveTo(0, top);
        ctx.lineTo(0, bottom);


        //draw horizontal...

        ctx.moveTo(left, 0);
        ctx.lineTo(right, 0);

        ctx.stroke();
        ctx.restore();
    }

    drawPage(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;

        let left = this.marginX - this.x;
        let top = this.marginY - this.y;
        let width = this.width / this.scaleX;
        let height = this.height / this.scaleY;
        let right = left + width;
        let bottom = top + height;

        //draw vertical...
        ctx.rect(0, 0, this.width, this.height);

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
        ctx.clearRect(0, 0, this.width, this.height);

        ctx.save();
        this.updateContext(ctx);

        this.preDraw && this.preDraw(ctx);
        this.draw(ctx);
        //this.drawHover && this.drawHover(ctx);
        this.postDraw && this.postDraw(ctx);

        deep && this._subcomponents.forEach(item => {
            item.render(ctx, deep);
        });
        ctx.restore();

        this.showBoundry && this.afterRender(ctx);
    }


   public preDraw = (ctx: CanvasRenderingContext2D): void => {
      //ctx.fillStyle = this.color;
      //ctx.fillRect(0, 0, this.pageWidth, this.pageHeight);
    }    

    public draw = (ctx: CanvasRenderingContext2D): void => {
        this.drawGrid(ctx);
        this.drawAxis(ctx);
        this.drawPage(ctx);
        this.drawPin(ctx);
    }
}





