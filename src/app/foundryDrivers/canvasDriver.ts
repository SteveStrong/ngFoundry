
import { PubSub } from "../foundry/foPubSub";

import { cPoint } from "../canvas/point";

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

    go() {
        doAnimate(this);
    }

    setRoot(nativeElement: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement {
        this.canvas = nativeElement;
        this.context = this.canvas.getContext("2d");

        // set the width and height
        this.canvas.width = width;
        this.canvas.height = height;

        // set some default properties about the line
        this.context.lineWidth = 3;
        this.context.lineCap = 'round';
        this.context.strokeStyle = '#000';

        this.setupMouseEvents(nativeElement);

        return nativeElement;
    }

    setupMouseEvents(canvas: HTMLCanvasElement) {

        function getMousePos(evt):cPoint {
            var rect = canvas.getBoundingClientRect();
            return new cPoint(evt.clientX - rect.left,evt.clientY - rect.top);
        }


        canvas.addEventListener('mousedown', function (e) {
            let loc = getMousePos(e);
            PubSub.Pub('mousedown', loc, e);
        });

        canvas.addEventListener('mousemove', function (e) {
            let loc = getMousePos(e);
            PubSub.Pub('mousemove', loc, e);
        });

        canvas.addEventListener('mouseup', function (e) {
            let loc = getMousePos(e);
            PubSub.Pub('mouseup', loc, e);
        });

    }
}