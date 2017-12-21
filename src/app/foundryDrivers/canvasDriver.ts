
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

        function getMousePos(evt: MouseEvent): cPoint {
            let x = rect.left;
            let y = rect.top;
            return pt.set(evt.clientX - x, evt.clientY - y);

            //let left = doc.scrollingElement.scrollLeft;
            //let top = doc.scrollingElement.scrollTop;

            //return new cPoint(evt.pageX - canvas.offsetLeft, evt.pageY - canvas.offsetHeight);
            //return new cPoint(evt.pageX - left - rect.left, evt.pageY - top - rect.top);
        }

        //http://jsfiddle.net/jy5yQ/1/
        function getMousePosition(event: MouseEvent): cPoint {
            let x:number;
            let y:number;
           
            if (event.pageX != undefined && event.pageY != undefined) {
               x = event.pageX;
               y = event.pageY;
            } else 
            {
               x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
               y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
           
            x -= canvas.offsetLeft;
            y -= canvas.offsetTop;

           
            return pt.set(x,y);
           }


        canvas.addEventListener('mousedown', (e: MouseEvent) => {
            e.preventDefault()
            let loc = getMousePos(e);
            PubSub.Pub('mousedown', loc, e, e.shiftKey, e.ctrlKey, e.altKey);
        });

        canvas.addEventListener('mousemove', (e: MouseEvent) => {
            e.preventDefault()
            let loc = getMousePos(e);
            PubSub.Pub('mousemove', loc, e, e.shiftKey, e.ctrlKey, e.altKey);
        });

        canvas.addEventListener('mouseup', (e: MouseEvent) => {
            e.preventDefault()
            let loc = getMousePos(e);
            PubSub.Pub('mouseup', loc, e, e.shiftKey, e.ctrlKey, e.altKey);
        });

        canvas.addEventListener('mouseover', (e: MouseEvent) => {
            e.preventDefault()
            let loc = getMousePos(e);
            PubSub.Pub('mouseover', loc, e, e.shiftKey, e.ctrlKey, e.altKey);
        });

        canvas.addEventListener('mouseout', (e: MouseEvent) => {
            e.preventDefault()
            let loc = getMousePos(e);
            PubSub.Pub('mouseout', loc, e, e.shiftKey, e.ctrlKey, e.altKey);
        });

    }
}