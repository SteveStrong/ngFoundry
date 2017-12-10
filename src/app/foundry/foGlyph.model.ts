
import { Tools } from './foTools';
import { cPoint } from './foGeometry';

import { iObject, iNode, iShape, iPoint, iSize, Action } from './foInterface';

import { foObject } from './foObject.model';
import { foCollection } from './foCollection.model';
import { foDictionary } from './foDictionary.model';
import { foNode } from './foNode.model';
import { foConcept } from './foConcept.model';
import { foComponent } from './foComponent.model';


//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foGlyph extends foNode implements iShape {

    protected _isSelected: boolean = false;
    get isSelected(): boolean { return this._isSelected; }
    set isSelected(value: boolean) { this._isSelected = value; }

    protected _subcomponents: foCollection<foGlyph>;
    protected _x: number;
    protected _y: number;
    protected _width: number;
    protected _height: number;
    protected _opacity: number;
    protected _color: string;

    get x(): number { return this._x || 0.0; }
    set x(value: number) { this._x = value; }

    get y(): number { return this._y || 0.0 }
    set y(value: number) { this._y = value; }

    get width(): number { return this._width || 0.0; }
    set width(value: number) { this._width = value; }

    get height(): number { return this._height || 0.0; }
    set height(value: number) { this._height = value; }

    get opacity(): number { return this._opacity || 1; }
    set opacity(value: number) { this._opacity = value; }

    get color(): string {
        return this._color || 'green';
    }
    set color(value: string) {
        this._color = value;
    }

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myGuid;
    }

    get asJson() {
        let parent = <foGlyph>this.myParent();
        return {
            parentGuid: parent && parent.myGuid,
            myGuid: this.myGuid,
            myType: this.myType,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            opacity: this.opacity,
            color: this.color,
        }
    }

    public drop(params: any) {
        this.override(params);
        return this;
    }

    public hitTest = (hit: iPoint, ctx: CanvasRenderingContext2D): boolean => {
        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;

        ctx.save();
        ctx.globalAlpha = .5;
        ctx.fillRect(x, y, width, height);
        ctx.restore();

        if (hit.x < x) return false;
        if (hit.x > x + width) return false;
        if (hit.y < y) return false;
        if (hit.y > y + height) return false;
        return true;
    }

    public overlapTest = (hit: iShape, ctx: CanvasRenderingContext2D): boolean => {
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

    public getOffset = (loc: iPoint): iPoint => {
        let x = this.x;
        let y = this.y;
        return new cPoint(x - loc.x, y - loc.y);
    }

    public getLocation = (): iPoint => {
        let x = this.x;
        let y = this.y;
        return new cPoint(x, y);
    }

    public setLocation = (loc: iPoint): iPoint => {
        this.x = loc.x;
        this.y = loc.y;
        return this.getLocation();
    }

    public getSize = (scale: number = 1): iSize => {
        //structual type
        return {
            width: this.width * scale,
            height: this.height * scale
        }
    }

    public scaleSize = (scale: number): iSize => {
        //structual type
        this.x -= (this.width * (scale - 1)) / 2.0;
        this.y -= (this.height * (scale - 1)) / 2.0;
        this.width *= scale;
        this.height *= scale;
        return this.getSize(1.0);
    }

    public doMove(loc: iPoint, offset?: iPoint): iPoint {
        this.x = loc.x + (offset ? offset.x : 0);
        this.y = loc.y + (offset ? offset.y : 0);

        return new cPoint(this.x, this.y);
    }

    public setColor(color: string): string {
        this.color = color;
        return this.color;
    };

    public setOpacity(opacity: number): number {
        this.opacity = opacity;
        return this.opacity;
    };

    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        ctx.save();
        //this.drawOrigin(ctx);
        ctx.translate(this.x, this.y);
        //this.drawOriginX(ctx);

        this.preDraw(ctx);
        this.draw(ctx); 
        this.postDraw(ctx);
        this.isSelected && this.drawPin(ctx); 
        
        deep && this._subcomponents.forEach(item => {
            item.render(ctx, deep);
        });



        ctx.restore();
    }

    drawText(ctx: CanvasRenderingContext2D, text: string) {
        //http://junerockwell.com/end-of-line-or-line-break-in-html5-canvas/
        let fontsize = 20;
        let array = text.split('|');
        let dx = 10;
        let dy = 20;
        for (var i = 0; i < array.length; i++) {
            ctx.fillText(array[i], dx, dy);
            dy += (fontsize + 4);
        }
    };

    public drawPin(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();

        ctx.arc(0, 0, 6, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'pink';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.restore();
    }

    public drawOrigin(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(-50,0);
        ctx.lineTo(50,0);
        ctx.moveTo(0,-50);
        ctx.lineTo(0,50);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.restore();
    }
    
    public drawOriginX(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(-50,-50);
        ctx.lineTo(50,50);
        ctx.moveTo(50,-50);
        ctx.lineTo(-50,50);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.restore();
    }

    public drawOutline(ctx: CanvasRenderingContext2D){
        let width = this.width;
        let height = this.height;

        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.beginPath()
        ctx.setLineDash([15, 5]);
        ctx.rect(0, 0, width, height);
        ctx.stroke();
    }


    public drawHover = (ctx: CanvasRenderingContext2D): void => { }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => { 
        this.drawOutline(ctx);
    }

    public preDraw = (ctx: CanvasRenderingContext2D): void => { }
    public postDraw = (ctx: CanvasRenderingContext2D): void => { }
    public draw = (ctx: CanvasRenderingContext2D): void => {

        let width = this.width;
        let height = this.height;

        ctx.fillStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(0, 0, width, height);

        //http://junerockwell.com/end-of-line-or-line-break-in-html5-canvas/
        let fontsize = 20;
        ctx.font = `${fontsize}px Calibri`;
        ctx.fillStyle = 'blue';

        // let text = `x1=${x} y1=${y}|x2=${x+width} y2=${y+height}|`;
        // let array = text.split('|');
        // let dx = x + 10;
        // let dy = y + 20;
        // for (var i = 0; i < array.length; i++) {
        //     ctx.fillText(array[i], dx, dy);
        //     dy += (fontsize + 4);
        //  }

        this.isSelected && this.drawOutline(ctx);
    }

    toggleSelected() {
        this._isSelected = !this._isSelected;
    }
}

export class Pallet {
    static lookup = {}
    static afterCreate: Action<foGlyph>;

    static create<T extends foGlyph>(type: { new(p?: any): T; }, properties?: any, func?: Action<T>): T {
        let instance = new type(properties);
        func && func(instance);
        this.afterCreate && this.afterCreate(instance);
        return instance;
    }

    static define<T extends foGlyph>(type: { new(p?: any): T; }, properties?: any) {
        let instance = new type();
        this.lookup[instance.myType] = { create: type, defaults: properties};
        return type;
    }

    static makeInstance<T extends foGlyph>(type: string, properties?: any, func?: Action<T>) {
        let { create, defaults} = this.lookup[type];
        let instance = new create(Tools.union(properties, defaults));
        func && func(instance);
        this.afterCreate && this.afterCreate(instance);
        return instance;
    }
}

