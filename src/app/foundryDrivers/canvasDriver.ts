
import { PubSub } from "../foundry/foPubSub";

import { cPoint2D } from '../foundry/foGeometry2D';

import { NgZone } from '@angular/core';


export class Screen2D {
    private stopped: boolean = true
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    //https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
    requestAnimation = window.requestAnimationFrame || window.webkitRequestAnimationFrame; // || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;;
    cancelAnimation = window.cancelAnimationFrame; // || window.mozCancelAnimationFrame;

    render: (context: CanvasRenderingContext2D) => void;


    public doAnimate = (): void => {
        // if ( NgZone.assertInAngularZone() ) {
        //     console.log('Screen2D: in the zone')
        // }
        this.render(this.context);
        this._request = this.requestAnimation(this.doAnimate);
    }


    private _request: any;
    go(next?: () => {}) {
        this.stopped = false;
        this.doAnimate();
        next && next();
    }


    stop(next?: () => {}) {
        this.stopped = true;
        this.cancelAnimation(this._request)
        next && next();
    }

    toggleOnOff(): boolean {
        this.stopped ? this.go() : this.stop();
        return this.stopped;
    }

    clear() {
        this.context && this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
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
        let rect = canvas.getBoundingClientRect();
        //let body = canvas.ownerDocument.body;
        let pt = new cPoint2D();

        function getMousePos(event: MouseEvent): cPoint2D {
            //let px = event.pageX;
            //let py = event.pageY;

            let x = rect.left;
            let y = rect.top;
            return pt.set(event.clientX - x, event.clientY - y);
        }

        // //http://jsfiddle.net/jy5yQ/1/
        // function getMousePosition(event: MouseEvent): cPoint {
        //     let x: number;
        //     let y: number;

        //     if (event.pageX != undefined && event.pageY != undefined) {
        //         x = event.pageX;
        //         y = event.pageY;
        //     }
        //     else {
        //         x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        //         y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        //     }

        //     x -= canvas.offsetLeft;
        //     y -= canvas.offsetTop;


        //     return pt.set(x, y);
        // }

        canvas.addEventListener('keypress', (e: KeyboardEvent) => {
            e.preventDefault();
            let keys = { code: e.keyCode, shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey }
            PubSub.Pub('onkeypress', e, keys);
        });


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

            let g = new cPoint2D(e.offsetX, e.offsetY)

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