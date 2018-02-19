
import { Tools } from '../foTools'
import { cMargin } from './foGeometry2D';


import { foObject } from '../foObject.model'
import { foGlyph2D } from './foGlyph2D.model'

import { foShape2D } from './foShape2D.model'

let thumb = "M 263.9 190.1 C 263.9 182.1 257.4 175.6 249.4 175.6 C 249.4 175.6 248.3 175.6 246.6 175.6 C 238.6 175.6 216 175 216.1 168.7 C 216.1 166.8 216.2 164.7 216.4 162.4 C 216.7 159.7 217.2 157 217.4 154.7 C 218.8 138.1 213 129 208 129 C 206.8 129 197.7 129.6 198.3 134.5 C 198.5 136.8 199.5 148.4 196.5 158.3 C 191.7 167.1 177 183.2 168.1 190.5 C 167.9 189.8 167.6 189 167.4 188.3 C 166.8 186.2 166.2 184.1 165.6 182 C 163.4 182.6 161.3 183.2 159.2 183.9 C 150.8 186.3 142.5 188.8 134.1 191.3 C 132 191.9 129.9 192.5 127.8 193.1 C 128.4 195.3 129 197.4 129.6 199.5 C 135.8 220.4 141.9 241.3 148.1 262.3 C 148.7 264.4 149.4 266.5 150 268.6 C 152.1 268 154.2 267.4 156.4 266.8 C 164.7 264.3 173.1 261.8 181.4 259.4 C 183.6 258.7 185.7 258.1 187.8 257.5 C 187.2 255.4 186.6 253.2 185.9 251.1 C 184.5 246.3 183.1 241.5 181.7 236.7 C 184 236.1 187.7 235.6 193.3 235.6 C 196 235.6 199.1 235.7 202.6 236 C 213.2 237 223.2 237.7 228.8 238.4 C 230.1 238.6 231.6 238.7 233.1 238.7 C 238.1 238.7 243.6 237.5 245.1 233.3 C 245.6 232.1 245.8 231 246 229.9 C 250.5 228.2 254 224.1 254.2 219 C 254.3 218 254.2 217.1 254.1 216.2 C 257.5 214.2 259.9 210.6 260.1 206.4 C 260.2 204.4 259.8 202.5 259.1 200.8 C 262 198.1 263.9 194.4 263.9 190.1M 154.5 260.4 C 148.3 239.5 142.2 218.5 136 197.6 C 144.4 195.2 152.7 192.7 161.1 190.2 C 167.2 211.1 173.4 232.1 179.6 253 C 171.2 255.4 162.8 257.9 154.5 260.4z";
let apple = "M 158.5 182 C 140.1 197 148.7 237 171.9 252 C 179 256.6 187 257.3 197.2 252.6 C 211.1 258 217.4 257.5 228.1 247.6 C 246.9 230.3 252.7 195.7 235.8 182 C 221.4 170.2 208.9 173.4 202.3 176.8 C 202.3 172.8 201.6 168.3 199.8 163.5 C 200.8 163 201.8 162.4 202.8 161.8 C 203.4 161.5 203.9 161.1 204.5 160.8 C 205.5 160.2 206.4 159.5 207.3 158.9 C 213.8 154.3 219.5 148.5 224.1 142.1 C 224.1 142.1 220.8 154.8 213.3 161.6 C 248.2 172.9 246.2 133.6 245.8 123.1 C 245.8 122.4 244.7 122.4 244.2 123 C 237.6 130.7 219.8 121.1 208.9 132.9 C 201.1 141.2 203 150.1 205.2 155.3 C 204.3 155.9 203.3 156.5 202.3 157.1 C 200.9 157.9 199.5 158.7 198 159.4 C 196.3 155.8 194 152.2 190.9 148.4 C 190 147.4 188.4 147.3 187.4 148.2 C 186.3 149.2 185.2 150.2 184.1 151.2 C 183.1 152.1 183 153.7 183.9 154.8 C 190.9 163.3 192.8 171.2 192.9 177.3 C 186.5 173.7 173.7 169.7 158.5 182z";
let plug = "M 201.4 163.9 C 198.6 161.1 195.8 158.3 193 155.5 C 202.6 145.9 212.2 136.3 221.8 126.7 C 224.1 124.4 227.9 124.4 230.2 126.7 C 232.5 129 232.5 132.8 230.2 135.1 C 220.6 144.7 211 154.3 201.4 163.9M 270.3 166.8 C 268 164.5 264.2 164.5 261.9 166.8 C 252.3 176.4 242.7 186 233.1 195.6 C 235.9 198.4 238.7 201.3 241.5 204.1 C 251.1 194.5 260.7 184.9 270.3 175.3 C 272.7 172.9 272.7 169.2 270.3 166.8M 179.1 148.1 C 178.9 147.9 178.6 147.9 178.4 148.1 C 175.8 150.7 173.3 153.3 170.7 155.8 C 170.5 156 170.5 156.3 170.7 156.5 C 171.4 157.2 172.2 158 172.9 158.8 C 169.1 162.6 165.2 166.5 161.3 170.4 C 149.3 182.4 148.5 201.3 158.9 214.2 C 158.1 215 157.3 215.8 156.5 216.6 C 152.6 220.4 152 226.3 154.6 230.9 C 150.2 235.2 145.9 239.6 141.6 243.9 C 145.4 247.7 149.3 251.6 153.2 255.4 C 157.5 251.1 161.8 246.8 166.1 242.5 C 170.7 245 176.6 244.4 180.5 240.5 C 181.3 239.7 182 239 182.8 238.2 C 195.7 248.5 214.7 247.7 226.6 235.8 C 230.5 231.9 234.4 228 238.3 224.1 C 239 224.9 239.8 225.6 240.6 226.4 C 240.7 226.5 241 226.5 241.2 226.4 C 243.8 223.8 246.4 221.2 249 218.6 C 249.1 218.4 249.1 218.1 249 217.9 C 225.7 194.7 202.4 171.4 179.1 148.1z";
let light = "M 201.7 150.6 C 210 150.6 217.6 153.1 223.9 157.5 C 234.1 164.5 240.8 176.3 240.8 189.7 C 240.8 201.4 234.2 210.3 228.2 217.8 C 223.1 224.1 218.4 229.4 218.3 234.7 C 218.3 237.3 216 239.6 213.3 239.6 C 205.9 239.6 198.4 239.6 191 239.6 C 188.2 239.6 186 237.3 186 234.7 C 185.5 228.4 178.7 222.4 172.5 214.6 C 167.3 208 162.6 200.1 162.6 189.7 C 162.6 178.2 167.6 167.8 175.5 160.7 C 182.5 154.4 191.7 150.6 201.7 150.6 C 201.7 150.6 201.7 150.6 201.7 150.6M 258 217.7 C 259.8 218.7 260.5 221.1 259.4 223 C 258.3 224.9 255.9 225.5 254.1 224.5 C 249.7 221.9 245.3 219.4 240.9 216.8 C 242.4 214.7 243.7 212.4 244.8 210.1 C 249.2 212.6 253.6 215.1 258 217.7M 162.6 216.8 C 158.2 219.4 153.8 221.9 149.4 224.4 C 147.5 225.5 145.1 224.8 144.1 223 C 143 221.1 143.6 218.7 145.5 217.7 C 149.9 215.1 154.2 212.6 158.6 210.1 C 159.7 212.4 161.1 214.7 162.6 216.8 C 162.6 216.8 162.6 216.8 162.6 216.8M 154.2 193.6 C 149.1 193.6 144.1 193.6 139 193.6 C 136.9 193.6 135.1 191.8 135.1 189.7 C 135.1 187.6 136.9 185.8 139 185.8 C 144.1 185.8 149.1 185.8 154.2 185.8 C 154.1 187.1 154.1 188.4 154.1 189.7 C 154.1 191 154.1 192.3 154.2 193.6 C 154.2 193.6 154.2 193.6 154.2 193.6M 158.6 169.3 C 154.2 166.8 149.9 164.3 145.5 161.8 C 143.6 160.7 143 158.3 144.1 156.4 C 145.1 154.5 147.5 153.9 149.4 155 C 153.8 157.5 158.2 160 162.6 162.6 C 161.1 164.7 159.7 167 158.6 169.3 C 158.6 169.3 158.6 169.3 158.6 169.3M 174.6 150.5 C 172.1 146.1 169.5 141.7 167 137.3 C 165.9 135.5 166.6 133.1 168.4 132 C 170.3 130.9 172.7 131.6 173.8 133.5 C 176.3 137.8 178.8 142.2 181.4 146.6 C 179 147.7 176.7 149 174.6 150.5 C 174.6 150.5 174.6 150.5 174.6 150.5M 197.8 142.2 C 197.8 137.1 197.8 132 197.8 127 C 197.8 124.9 199.6 123.1 201.8 123.1 C 203.9 123.1 205.6 124.9 205.6 127 C 205.6 132 205.6 137.1 205.6 142.2 C 204.4 142.1 203.1 142 201.8 142 C 200.4 142 199.1 142.1 197.8 142.2 C 197.8 142.2 197.8 142.2 197.8 142.2M 222.1 146.6 C 222.8 145.4 223.5 144.3 224.1 143.1 C 224.9 141.8 225.7 140.5 226.4 139.1 C 227.5 137.2 228.6 135.3 229.7 133.4 C 230.8 131.6 233.1 130.9 235 132 C 236.9 133.1 237.5 135.5 236.5 137.3 C 235.3 139.3 234.2 141.3 233 143.3 C 232.3 144.5 231.6 145.7 230.9 146.9 C 230.2 148.1 229.5 149.3 228.9 150.5 C 227.7 149.7 226.4 148.9 225.2 148.2 C 224.2 147.6 223.1 147.1 222.1 146.6 C 222.1 146.6 222.1 146.6 222.1 146.6M 240.9 162.6 C 241.9 162 243 161.4 244 160.8 C 245.2 160.1 246.3 159.5 247.5 158.8 C 249.7 157.5 251.9 156.3 254.1 155 C 255.9 153.9 258.3 154.5 259.4 156.4 C 260.5 158.3 259.8 160.7 258 161.8 C 255.8 163 253.7 164.3 251.5 165.5 C 250.3 166.2 249.1 166.9 247.8 167.6 C 246.8 168.2 245.8 168.8 244.8 169.4 C 244.3 168.2 241.7 163.7 240.9 162.6 C 240.9 162.6 240.9 162.6 240.9 162.6M 249.2 185.8 C 254.3 185.8 259.4 185.8 264.4 185.8 C 266.6 185.8 268.3 187.5 268.3 189.7 C 268.3 191.8 266.6 193.6 264.4 193.6 C 259.4 193.6 254.3 193.6 249.2 193.6 C 249.3 192.3 249.4 191 249.4 189.7 C 249.4 188.4 249.3 187.1 249.2 185.8 C 249.2 185.8 249.2 185.8 249.2 185.8M 202.1 275.5 C 206.6 275.5 210.5 272.3 213.3 267.2 C 205.9 267.2 198.4 267.2 191 267.2 C 193.7 272.3 197.7 275.5 202.1 275.5 C 202.1 275.5 202.1 275.5 202.1 275.5M 191 254.7 C 198.4 254.7 205.9 254.7 213.3 254.7 C 216.1 254.7 218.3 256.9 218.3 259.6 C 218.3 259.6 218.3 259.6 218.3 259.6 C 218.3 262.4 216.1 264.5 213.3 264.5 C 205.9 264.5 198.4 264.5 191 264.5 C 188.2 264.5 186 262.4 186 259.6 C 186 259.6 186 259.6 186 259.6 C 186 256.9 188.2 254.7 191 254.7 C 191 254.7 191 254.7 191 254.7M 191 242.2 C 198.4 242.2 205.9 242.2 213.3 242.2 C 216.1 242.2 218.3 244.4 218.3 247.1 C 218.3 247.1 218.3 247.1 218.3 247.1 C 218.3 249.8 216.1 252 213.3 252 C 205.9 252 198.4 252 191 252 C 188.2 252 186 249.8 186 247.1 C 186 247.1 186 247.1 186 247.1 C 186 244.4 188.2 242.2 191 242.2 C 191 242.2 191 242.2 191 242.2z";
let heart = "M 226.3 157 C 205 157 201.4 171.1 201.4 171.1 C 201 172.7 200.3 172.7 199.9 171.1 C 199.9 171.1 196.4 157 175.1 157 C 153.8 157 146.4 179.7 146.4 189.3 C 146.4 219.9 198.2 251.3 198.2 251.3 C 199.5 252.2 201.8 252.2 203.2 251.3 C 203.2 251.3 255 219.9 255 189.3 C 255 179.7 247.5 157 226.3 157z";
let star = "M 262.6 182.4 C 261.7 179.7 259.3 177.7 256.4 177.2 C 245.3 175.7 234.3 174.1 223.3 172.5 C 218.4 162.7 213.4 152.8 208.5 143 C 207.2 140.4 204.5 138.7 201.5 138.7 C 198.6 138.7 195.9 140.4 194.6 143 C 189.7 152.8 184.7 162.7 179.8 172.5 C 168.8 174.1 157.8 175.7 146.7 177.2 C 143.8 177.6 141.4 179.7 140.5 182.4 C 139.6 185.2 140.3 188.2 142.4 190.3 C 150.4 197.9 158.4 205.6 166.4 213.3 C 164.5 224.1 162.6 234.9 160.7 245.7 C 160.2 248.6 161.4 251.5 163.8 253.2 C 165.1 254.1 166.7 254.6 168.4 254.6 C 169.6 254.6 170.8 254.3 172 253.8 C 181.8 248.6 191.7 243.5 201.5 238.4 C 211.4 243.5 221.3 248.6 231.1 253.8 C 232.3 254.3 233.5 254.6 234.7 254.6 C 236.3 254.6 237.9 254.1 239.3 253.2 C 241.7 251.5 242.9 248.6 242.4 245.7 C 240.5 234.9 238.6 224.1 236.7 213.3 C 244.7 205.6 252.7 197.9 260.7 190.3 C 262.8 188.3 263.5 185.2 262.6 182.4z";
let rocket = "M 201.2 222.1 C 210 216.5 218.6 210.1 225.7 203 C 249.9 178.8 252.6 157.5 250.1 149.9 C 253.7 146.3 257.3 142.7 260.9 139.1 C 261.9 138.1 261.9 136.5 260.9 135.5 C 259.9 134.5 258.3 134.5 257.3 135.5 C 253.7 139.1 250.1 142.7 246.5 146.3 C 238.9 143.8 217.6 146.5 193.4 170.7 C 186.3 177.8 179.9 186.4 174.3 195.2 C 166.2 193.2 152.1 193.2 142.3 204.1 C 131.1 216.4 137.7 228.1 140.2 225.7 C 142.2 223.6 145.6 211.3 160.4 220.8 C 158 225.8 158.1 228.9 159.7 230.4 C 161.8 232.5 163.9 234.6 166 236.7 C 167.6 238.3 170.6 238.5 175.7 236 C 185.1 250.8 172.8 254.2 170.8 256.3 C 168.3 258.7 180 265.3 192.3 254.1 C 203.2 244.3 203.2 230.2 201.2 222.1M 216.5 179.9 C 212.9 176.3 212.9 170.3 216.5 166.7 C 220.2 163 226.1 163 229.7 166.7 C 233.4 170.4 233.4 176.2 229.7 179.9 C 226.1 183.5 220.2 183.5 216.5 179.9M 156.4 233.5 C 156.4 233.5 146.4 235.3 142.7 253.7 C 161.1 250.1 162.9 240 162.9 240 C 160.8 237.8 158.6 235.7 156.4 233.5z";


//https://codepen.io/osublake/pen/pRNYRM


// https://codedump.io/share/uk73w56ISXrL/1/typescript-path2d-class-is-missing-a-string-constructor

// Class
interface Path2D {
    addPath(path: Path2D, transform?: SVGMatrix);
    closePath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    /*ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;*/
    rect(x: number, y: number, w: number, h: number): void;
}

// Constructor
interface Path2DConstructor {
    new (): Path2D;
    new (d: string): Path2D;
    new (path: Path2D, fillRule?: string): Path2D;
    prototype: Path2D;
}
declare var Path2D: Path2DConstructor;

// Extend CanvasRenderingContext2D
// interface CanvasRenderingContext2D {
//     fill(path: Path2D): void;
//     stroke(path: Path2D): void;
//     clip(path: Path2D, fillRule?: string): void;
// }

export class foPath2D extends foShape2D {
    path: string = thumb;

    constructor(properties?: any, subcomponents?: Array<foGlyph2D>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }


    public draw = (ctx: CanvasRenderingContext2D): void => {

        ctx.fillStyle = this.color;
        let path = new Path2D(thumb);
        ctx.fill(path);
    }

}

import { RuntimeType } from '../foRuntimeType';
RuntimeType.define(foPath2D);
