
import { PubSub } from "../foundry/foPubSub";

import { cPoint } from "../foundry/foGeometry";

function doAnimate(mySelf) {
    function animate() {
        requestAnimationFrame(animate);
        mySelf.render(mySelf.context);
    }
    animate();
}


export class Sceen2D {

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    render: (context: CanvasRenderingContext2D) => void;

    go(next?: () => {}) {
        doAnimate(this);
        next && next();
    }

    setRoot(nativeElement: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement {
        this.canvas = nativeElement;
        this.context = this.canvas.getContext("2d");

        // set the width and height
        this.canvas.width = width;
        this.canvas.height = height;

        // set some default properties about the line
        this.context.lineWidth = 1;
        this.context.lineCap = 'round';
        this.context.strokeStyle = '#000';

        this.pubMouseEvents(nativeElement);

        return nativeElement;
    }

    pubMouseEvents(canvas: HTMLCanvasElement) {
        var rect = canvas.getBoundingClientRect();
        var body = canvas.ownerDocument.body;
        var pt = new cPoint();

        function getMousePos(event: MouseEvent): cPoint {
            let px = event.pageX;
            let py = event.pageY;

            let x = rect.left;
            let y = rect.top;
            return pt.set(event.clientX - x, event.clientY - y);
        }

        //http://jsfiddle.net/jy5yQ/1/
        function getMousePosition(event: MouseEvent): cPoint {
            let x: number;
            let y: number;

            if (event.pageX != undefined && event.pageY != undefined) {
                x = event.pageX;
                y = event.pageY;
            }
            else {
                x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            x -= canvas.offsetLeft;
            y -= canvas.offsetTop;


            return pt.set(x, y);
        }


        canvas.addEventListener('mousedown', (e: MouseEvent) => {
            e.preventDefault()
            let loc = getMousePos(e);
            let keys = { shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, button: e.button }
            PubSub.Pub('mousedown', loc, e, keys);
        });

        canvas.addEventListener('mousemove', (e: MouseEvent) => {
            e.preventDefault()
            let loc = getMousePos(e);
            let keys = { shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, button: e.button }
            PubSub.Pub('mousemove', loc, e, keys);
        });

        canvas.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault()
            let loc = getMousePos(e);
            let keys = { shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, button: e.button }

            let scale = 1.1;
            let zoom = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))) > 0 ? scale : 1 / scale;

            let g = new cPoint(e.offsetX, e.offsetY)

            PubSub.Pub('wheel', loc, g, zoom, e, keys);
        });

        canvas.addEventListener('dblclick', (e: MouseEvent) => {
            e.preventDefault()
            let loc = getMousePos(e);
            let keys = { shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, button: e.button }
            PubSub.Pub('dblclick', loc, e, keys);
        });

        canvas.addEventListener('click', (e: MouseEvent) => {
            e.preventDefault()
            let loc = getMousePos(e);
            let keys = { shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, button: e.button }
            PubSub.Pub('click', loc, e, keys);
        });

        canvas.addEventListener('mouseup', (e: MouseEvent) => {
            e.preventDefault()
            let loc = getMousePos(e);
            let keys = { shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, button: e.button }
            PubSub.Pub('mouseup', loc, e, keys);
        });

        canvas.addEventListener('mouseover', (e: MouseEvent) => {
            e.preventDefault()
            let loc = getMousePos(e);
            let keys = { shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, button: e.button }
            PubSub.Pub('mouseover', loc, e, keys);
        });

        canvas.addEventListener('mouseout', (e: MouseEvent) => {
            e.preventDefault()
            let loc = getMousePos(e);
            let keys = { shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, button: e.button }
            PubSub.Pub('mouseout', loc, e, keys);
        });

    }
}