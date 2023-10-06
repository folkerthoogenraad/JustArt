import { Color } from "lib/graphics/Color";
import { ImageGrid } from "./ImageGrid";
import { Vector2 } from "lib/math/Vector2";


export class Sampler {
    static loop(width: number, height: number, lambda: (x: number, y: number) => void) {
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                lambda(i, j);
            }
        }
    }
    static create<S>(width: number, height: number, lambda: (x: number, y: number) => S): ImageGrid<S> {
        let grid = new ImageGrid<S>(width, height);

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let value = lambda(i, j);

                grid.setPixel(i, j, value);
            }
        }

        return grid;
    }
    static avarage(...values: number[]) {
        let sum = 0;

        for (let i = 0; i < values.length; i++) {
            sum += values[i];
        }

        return sum / values.length;
    }
    static min(...values: number[]) {
        let min = values[0];

        for (let i = 1; i < values.length; i++) {
            if (values[i] < min) values[i] = min;
        }

        return min;
    }
    static max(...values: number[]) {
        let max = values[0];

        for (let i = 1; i < values.length; i++) {
            if (values[i] > max) values[i] = max;
        }

        return max;
    }
    static avarageColor(...values: Color[]) {
        let sumr = 0;
        let sumg = 0;
        let sumb = 0;

        for (let i = 0; i < values.length; i++) {
            sumr += values[i].r;
            sumg += values[i].g;
            sumb += values[i].b;
        }

        return new Color(sumr / values.length, sumg / values.length, sumb / values.length, 1);
    }
    static remap(min: number, max: number, newMin: number, newMax: number, v: number): number {
        let f = this.inverseLerp(min, max, v);

        return this.lerp(newMin, newMax, f);
    }
    static lerp(a: number, b: number, f: number): number {
        return a + (b - a) * f;
        (b - a) * (3.0 - f * 2.0) * f * f + a
    }
    static inverseLerp(a: number, b: number, v: number): number {
        return (v - a) / (b - a);
    }
    static smoothstep(a: number, b: number, f: number): number {
        return (b - a) * (3.0 - f * 2.0) * f * f + a
    }

    static nearest(a: number, b: number, f: number): number {
        if(f < 0.5) return a;
        return b;
    }
    static clamp(v: number, min: number, max: number): number {
        if (v < min) return min;
        if (v > max) return max;

        return v;
    }
    static clip(v: number): number {
        return this.clamp(v, 0, 1);
    }

    static getGradientAt(grid: ImageGrid<number>, x: number, y: number): Vector2{
        // let self = grid.getPixel(x, y);

        let left = grid.getPixel(x - 1, y);
        let right = grid.getPixel(x + 1, y);
        let top = grid.getPixel(x, y - 1);
        let bottom = grid.getPixel(x, y + 1);

        return new Vector2(left - right, top - bottom);
    }

    static sampleGradientNormalized(grid: ImageGrid<number>, x: number, y: number): Vector2 {
        let xx = x * grid.width;
        let yy = y * grid.height;

        let px = Math.floor(xx);
        let py = Math.floor(yy);

        let rx = xx - px;
        let ry = yy - py;
        
        return this.interpolateQuad<Vector2>(
            this.getGradientAt(grid, px, py), this.getGradientAt(grid, px + 1, py),
            this.getGradientAt(grid, px, py + 1), this.getGradientAt(grid, px + 1, py + 1),
            rx,
            ry,
            (a, b, f) => Vector2.lerp(a, b, f)
        );
    }

    static sampleNormalized<T>(grid: ImageGrid<T>, x: number, y: number, interpolation: (a: T, b: T, f: number) => T) {
        let xx = x * grid.width;
        let yy = y * grid.height;

        let px = Math.floor(xx);
        let py = Math.floor(yy);

        let rx = xx - px;
        let ry = yy - py;

        return this.interpolateQuad<T>(
            grid.getPixel(px, py), grid.getPixel(px + 1, py),
            grid.getPixel(px, py + 1), grid.getPixel(px + 1, py + 1),
            rx,
            ry,
            interpolation
        );
    }

    static interpolateQuad<T>(tl: T, tr: T, bl: T, br: T, x: number, y: number, interpolation: (a: T, b: T, f: number) => T) {
        return interpolation(
            interpolation(tl, tr, x),
            interpolation(bl, br, x),
            y
        );
    }
}
