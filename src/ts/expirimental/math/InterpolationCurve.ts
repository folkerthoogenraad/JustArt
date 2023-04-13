import { MathHelper } from "./MathHelper";

export type InterpolationCurve = (n: number) => number;

export class InterpolationCurves {
    static readonly Clamped: InterpolationCurve = MathHelper.clip;
    static readonly Linear: InterpolationCurve = (n) => n;

    static readonly Quadratic: InterpolationCurve = (n) => n * n;
    
    static readonly EaseIn: InterpolationCurve = (n) => n * n;
    static readonly EaseOut: InterpolationCurve = (n) => n * n;
    static readonly SmoothStep: InterpolationCurve = (n) => MathHelper.lerp(this.EaseIn(n), this.EaseOut(n), n);

    static readonly SignedSmoothstep: InterpolationCurve = (n) => this.SmoothStep(Math.abs(n)) * Math.sign(n);
}