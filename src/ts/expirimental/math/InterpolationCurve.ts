export type InterpolationCurve = (n: number) => number;

export class InterpolationCurves {
    static readonly Linear: InterpolationCurve = (n) => n;
    static readonly Quadratic: InterpolationCurve = (n) => n * n;
}