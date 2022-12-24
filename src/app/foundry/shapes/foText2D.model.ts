import { Tools } from '../foTools';
import { cMargin } from './foGeometry2D';

import { foObject } from '../foObject.model';
import { foGlyph2D } from './foGlyph2D.model';

import { foShape2D } from './foShape2D.model';

import { foUnDo } from '../foUnDo';

// ctx.textAlign = "left" || "right" || "center" || "start" || "end";

// ctx.textBaseline = "top" || "hanging" || "middle" || "alphabetic" || "ideographic" || "bottom";

// ctx.font = '48px serif';
// ctx.font = "20px Georgia";
// ctx.font = "italic 10pt Courier";
// ctx.font = "bold 10pt Courier";
// ctx.font = "italic bold 10pt Courier";

//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foText2D extends foShape2D {
  public text: string;
  public textAlign: string;
  public textBaseline: string;

  public margin: cMargin;
  public fontSize: number;
  public font: string;
  public resize: boolean = false;

  protected _background: string;
  get background(): string {
    return this._background;
  }
  set background(value: string) {
    this._background = value;
  }

  public pinX = (): number => {
    return 0.5 * this.width;
  }
  public pinY = (): number => {
    return 0.5 * this.height;
  }

  constructor(
    properties?: any,
    subcomponents?: Array<foGlyph2D>,
    parent?: foObject
  ) {
    super(properties, subcomponents, parent);

    this.setupPreDraw();
  }

  protected toJson(): any {
    return Tools.mixin(super.toJson(), {
      text: this.text,
      background: this.background,
      fontSize: this.fontSize,
      margin: this.margin
    });
  }

  get size(): number {
    return this.fontSize || 12;
  }

  updateContext(ctx: CanvasRenderingContext2D) {
    super.updateContext(ctx);

    this.renderFont(ctx, this.size, this.font, this.textAlign, this.textBaseline);
  }

  setupPreDraw() {
    const preDraw = (ctx: CanvasRenderingContext2D): void => {
      if ( this.resize) {
        const textMetrics = ctx.measureText(this.text);
        this.width = textMetrics.width + ((this.margin && this.margin.width) || 0);
        this.height = this.size + ((this.margin && this.margin.height) || 0);
      }
      this.createConnectionPoints();
      this.createHandles();
      this.preDraw = undefined;
    };

    this.preDraw = preDraw;
  }

  public drawOutline(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.setLineDash([15, 5]);
    ctx.rect(0, 0, this.width, this.height);
    ctx.stroke();
  }

  public drawDefaultSelected(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    this.drawOutline(ctx);
    this.drawHandles(ctx);
    this.drawConnectionPoints(ctx);
    this.drawPin(ctx);
  }

  public drawSelected = this.drawDefaultSelected;

  public drawText = (ctx: CanvasRenderingContext2D): void => {
    const left = (this.margin && this.margin.left) || 0;
    const top = (this.margin && this.margin.top) || 0;

    ctx.save();
    if (this.background) {
      ctx.fillStyle = this.background;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    ctx.fillStyle = this.color;
    this.renderText(ctx, this.text, this.pinX() + left, this.pinY() + top);

    ctx.restore();
  }

  public draw: (ctx: CanvasRenderingContext2D) => void = this.drawText;
}

export class foInputText2D extends foText2D {
  private UnDo: foUnDo = new foUnDo();
  private isEditing: boolean = false;
  private showCursor: boolean = false;
  private cursorStart: number;
  private cursorEnd: number;

  private timer: any;
  private undoRoot: any;
  private initState: any;

  private setState(state: any) {
    this.text = state.text;
    this.cursorStart = state.start;
    this.cursorEnd = state.end;
  }

  private getState() {
    return { text: this.text, start: this.cursorStart, end: this.cursorEnd };
  }

  public openEditor = () => {
    this.isEditing = true;
    this.drawSelected = this.drawIsEditing;
    this.timer = setInterval(() => {
      this.showCursor = !this.showCursor;
    }, 600);
    this.cursorStart = this.cursorEnd = this.text.length;
    this.initState = this.getState();

    this.UnDo.registerActions(
      'shapeTextChanged',
      p => {
        return p;
      },
      p => {
        return p;
      },
      (o, n) => {
        return o !== n;
      }
    );
  }

  public closeEditor = () => {
    this.isEditing = false;
    this.drawSelected = this.drawDefaultSelected;
    clearInterval(this.timer);
    this.UnDo.clear();
  }

  public addCharacter(char) {
    const state = this.getState();
    if (this.UnDo.verifyKeep(this.undoRoot, state)) {
      this.undoRoot = this.UnDo.do('shapeTextChanged', state);
    }

    const text =
      this.text.slice(0, this.cursorStart) +
      char +
      this.text.slice(this.cursorEnd);
    this.text = text;
    this.cursorStart += 1;
    this.cursorEnd = this.cursorStart;
  }

  public delCharacter() {
    if (this.cursorStart === 0) return;

    const state = this.getState();
    if (this.UnDo.verifyKeep(this.undoRoot, state)) {
      this.undoRoot = this.UnDo.do('shapeTextChanged', state);
    }

    const text =
      this.text.slice(0, this.cursorStart - 1) +
      this.text.slice(this.cursorEnd);
    this.text = text;
    this.cursorStart -= 1;
    this.cursorEnd = this.cursorStart;
  }

  public sendKeys = (e: KeyboardEvent, keys: any) => {
    if (keys.ctrl && e.key === 'e') {
      this.isEditing ? this.closeEditor() : this.openEditor();
    } else if (keys.ctrl && e.key === 'z') {
      this.UnDo.canUndo() && this.setState(this.UnDo.unDo());
    } else if (this.isEditing) {
      this.editText(e, keys);
    }
    this.setupPreDraw();
  }

  editText(e: KeyboardEvent, keys: any) {
    if (keys.ctrl && e.key === 'a') {
      this.cursorStart = 0;
      this.cursorEnd = this.text.length;
    } else if (keys.ctrl) {
      return;
    } else if (e.keyCode >= 48 && e.keyCode <= 90) {
      this.addCharacter(e.key);
    } else if (e.keyCode === 32) {
      //space
      this.addCharacter(e.key);
    } else if (e.keyCode === 46) {
      //del
      this.delCharacter();
    } else if (e.keyCode === 8) {
      //backspace
      this.delCharacter();
    } else {
      this.processKeys(e, keys);
    }
  }

  // 27: "esc",
  // 32: "space",
  // 33: "pageup",
  // 34: "pagedown",
  // 35: "end",
  // 36: "home",
  // 37: "left",
  // 38: "up",
  // 39: "right",
  // 45: "insert",
  // 46: "delete",

  processKeys(e: KeyboardEvent, keys: any) {
    const select = keys.shift;
    switch (e.keyCode) {
      case 36: // home
        this.cursorStart = 0;
        if (!select) this.cursorEnd = this.cursorStart;
        break;
      case 35: // end
        this.cursorEnd = this.text.length;
        if (!select) this.cursorStart = this.cursorEnd;
        break;
      case 37: // left
        if (this.cursorStart > 0) {
          this.cursorStart -= 1;
          if (!select) this.cursorEnd = this.cursorStart;
        }
        break;
      case 39: // right
        if (this.cursorEnd < this.text.length) {
          this.cursorEnd += 1;
          if (!select) this.cursorStart = this.cursorEnd;
        }
        break;
      case 13: // return
        this.closeEditor();
        break;
      case 27: // esc
        this.setState(this.initState);
        this.closeEditor();
        break;
      default:
        if (e.key.length === 1) {
          this.addCharacter(e.key);
        }
        break;
    }
  }

  public drawIsEditing(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(0, 0, this.width, this.height);
    ctx.stroke();

    this.drawSelect(ctx);
    this.showCursor && this.drawCursor(ctx);
    this.draw(ctx);
  }

  public drawSelect(ctx: CanvasRenderingContext2D) {
    if (this.cursorStart === this.cursorEnd) return;

    const textStart = this.text.substr(0, this.cursorStart);
    const start = ctx.measureText(textStart);
    const startPos = start.width + ((this.margin && this.margin.width) || 0);

    const textEnd = this.text.substr(0, this.cursorEnd);
    const end = ctx.measureText(textEnd);
    const endPos = end.width + ((this.margin && this.margin.width) || 0);

    ctx.fillStyle = 'yellow';
    ctx.fillRect(startPos, 0, endPos - startPos, this.height);
  }

  public drawCursor(ctx: CanvasRenderingContext2D) {
    const textStart = this.text.substr(0, this.cursorStart);
    const start = ctx.measureText(textStart);
    const startPos = start.width + ((this.margin && this.margin.width) || 0);

    ctx.fillStyle = 'red';
    ctx.fillRect(startPos, 0, 2, this.height);
  }

  // drawMultiLineText(ctx: CanvasRenderingContext2D, text: string) {

  //     //let textMetrics = ctx.measureText(text);

  //     ctx.textAlign = "left" || "right" || "center" || "start" || "end";

  //     ctx.textBaseline = "top" || "hanging" || "middle" || "alphabetic" || "ideographic" || "bottom";

  //     ctx.font = '48px serif';
  //     ctx.font = "20px Georgia";
  //     ctx.font = "italic 10pt Courier";
  //     ctx.font = "bold 10pt Courier";
  //     ctx.font = "italic bold 10pt Courier";

  //     //http://junerockwell.com/end-of-line-or-line-break-in-html5-canvas/
  //     let fontsize = 60;
  //     let array = text.split('|');
  //     let dx = 10;
  //     let dy = 20;
  //     for (var i = 0; i < array.length; i++) {
  //         ctx.fillText(array[i], dx, dy);
  //         dy += (fontsize + 4);
  //     }

  // }
}

import { RuntimeType } from '../foRuntimeType';
RuntimeType.define(foText2D);
RuntimeType.define(foInputText2D);
