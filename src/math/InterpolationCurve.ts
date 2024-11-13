import { Vector2 } from "./Vector2";
import { MathHelper } from "./MathHelper";
import { BezierCurve } from "./BezierCurve";

export type InterpolationCurve = (n: number) => number;

export class InterpolationCurves {
    static readonly linear: InterpolationCurve = (n) => n;
    static readonly quadratic: InterpolationCurve = (n) => n * n;

    static readonly easeIn: InterpolationCurve = (n) => Math.pow(n, 4);
    static readonly easeOut: InterpolationCurve = (n) => 1 - Math.pow(1 - n, 4);
    static readonly easeInOut: InterpolationCurve = (n) => MathHelper.lerp(InterpolationCurves.easeIn(n), InterpolationCurves.easeOut(n), n);
}

const DefaultResolution = 32;

export class SampledInterpolationCurve {
    private samples: number[];

    constructor(resolution?: number){
        resolution = resolution ?? DefaultResolution;
        
        this.samples = Array(resolution).fill(0);
    }

    setSample(index: number, n: number){
        this.samples[index] = n;
        return this;
    }
    getSample(index: number){
        return this.samples[index];
    }

    get curve() {
        return (n: number) => this.lerp(n);
    }

    lerp(n: number) {
        let indexTotal = (this.samples.length - 1) * n;
        let index = Math.floor(indexTotal);
        let mod = indexTotal - index;

        let index0 = this.clampSampleIndex(index);
        let index1 = this.clampSampleIndex(index + 1);

        return MathHelper.lerp(this.samples[index0], this.samples[index1], mod);
    }

    clampSampleIndex(index: number) {
        if(index < 0) return 0;
        if(index >= this.samples.length) return this.samples.length - 1;

        return index;
    }

    /**
     * Converts a bezier curve to a sampled interpolation curve.
     * @param bezier The curve to sample
     * @param resolution The resolution of the final curve
     */
    static fromBezier(bezier: BezierCurve, resolution?: number){
        resolution = resolution ?? DefaultResolution;

        let sampled = SampledInterpolationCurve.fromPointCloud(new Array(resolution).fill(undefined).map((f, idx) => bezier.lerp(idx / (resolution - 1))), resolution);

        return sampled;
    }

    /**
     * Creates an interpolation curve from a set of points. All points outside of the x [0-1] range are discarded. Overlapping points are avaraged.
     * This function is useful for converting a non linear function into an interpolation curve.
     * @param points The points in the pointcloud
     * @param resolution The resolution of the final curve
     */
    static fromPointCloud(points: Vector2[], resolution?: number){
        resolution = resolution ?? DefaultResolution;

        // This algorithm is really not efficient but it works, so whatever... :')
        let samples = points.map(p => { return {index: p.x, value: p.y} });

        samples.sort((a, b) => a.index - b.index);

        // A helper function that, not very efficiently, gets the value from a sample
        const getValue = (valueIndex: number) => {
            for(let i = 0; i < samples.length; i++){
                let currentSample = samples[i];

                if(valueIndex > currentSample.index) continue;

                // Actual next sample or a semi next sample
                let previousSample = samples[i - 1] ?? {index: valueIndex - 1, value: currentSample.value};

                let indexDistance = currentSample.index - previousSample.index;
                let valueIndexOffset = valueIndex - previousSample.index;

                let value =  MathHelper.lerp(previousSample.value, currentSample.value, valueIndexOffset / indexDistance);

                return value;
            }

            return samples[samples.length - 1].value;
        };

        // Create the final curve
        let curve = new SampledInterpolationCurve(resolution);

        for(let i = 0; i < resolution; i++){
            curve.setSample(i, getValue(i / (resolution - 1)));
        }

        return curve;
    }
}