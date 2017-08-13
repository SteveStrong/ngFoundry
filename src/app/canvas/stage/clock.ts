import { iShape } from "./shape";
import { cText } from "./text";

export class cClock implements iShape {
    public x: number = 0;
    public y: number = 0;
    public radius: number = 10;
    public lineWidth: number = 2;
    public color: string = "red";
    private _text: cText;

    constructor(x: number, y: number, color: string = "red", line_width: number = 2) {
        this.x = x;
        this.y = y;

        this.color = color;
        this.lineWidth = line_width;
        this._text = new cText(x, y, "CLOCK", color, line_width);
    }

    clockText() {
        // clear the background
        function modify(s) {
            return (s < 10 ? '0' : '') + s;
        }

        // Get the current time
        var now = new Date(),
            h = now.getHours(),
            m = now.getMinutes(),
            s = now.getSeconds(),
            ampm = (h < 12 ? 'AM' : 'PM');

        // Make the hour between 0 and 12 (not 24)
        h = (h % 12);

        // Make values like '5' into '05'

        // Assemble the text
        var clockText = modify(h) + ':' + modify(m) + ':' + modify(s) + ' ' + ampm;
        return clockText;

    }

    public draw = (ctx: CanvasRenderingContext2D): void => {

        this._text.text = this.clockText();
        this._text.draw(ctx);

    }
}

