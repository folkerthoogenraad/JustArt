import { Vector2 } from "./Vector2";

export class BezierCurve {
    from : Vector2;
    p0 : Vector2;
    p1 : Vector2;
    to : Vector2;

    constructor(p0x: number, p0y : number, p1x : number, p1y : number){
        this.from = new Vector2(0, 0);
        this.p0 = new Vector2(p0x, p0y);
        this.p1 = new Vector2(p1x, p1y);
        this.to = new Vector2(1, 1);
    }

    lerp(f: number): Vector2 {
        let a = Vector2.lerp(this.from, this.p0, f);
        let b = Vector2.lerp(this.p0, this.p1, f);
        let c = Vector2.lerp(this.p1, this.to, f);
     
        let d = Vector2.lerp(a, b, f);
        let e = Vector2.lerp(b, c, f);
     
        let o = Vector2.lerp(d, e, f);
     
        return o;
    }

    static easeIn = new BezierCurve(0.42,-0.01,0.82,0.57);
    static easeOut = new BezierCurve(0.43,0.58,0.59,1);
    static easeInOut = new BezierCurve(0.5,0,0.5,1);
}