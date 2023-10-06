export type InterpolationCurve = (n: number) => number;

export class InterpolationCurves {
    static readonly Linear: InterpolationCurve = (n) => n;
    static readonly Quadratic: InterpolationCurve = (n) => n * n;

    static readonly EaseIn: InterpolationCurve = (n) => n * n;
    static readonly EaseOut: InterpolationCurve = (n) => -(n - 1) * (n - 1) + 1;
    static readonly EaseInOut: InterpolationCurve = (n) => n * n * (3 - 2 * n);
}
