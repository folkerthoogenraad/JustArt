import { Color } from "lib/graphics/Color";
import { ImageGrid } from "./ImageGrid";


export class Sampler{
    static loop(width: number, height: number, lambda: (x: number, y: number) => void){
        for(let i = 0; i < width; i++){
            for(let j = 0; j < height; j++){
                lambda(i, j);
            }
        }
    }
    static create<S>(width: number, height: number, lambda: (x: number, y: number) => S): ImageGrid<S>{
        let grid = new ImageGrid<S>(width, height);

        for(let i = 0; i < width; i++){
            for(let j = 0; j < height; j++){
                let value = lambda(i, j);

                grid.setPixel(i, j , value);
            }
        }

        return grid;
    }
    static avarage(...values: number[]){
        let sum = 0;

        for(let i = 0; i < values.length; i++){
            sum += values[i];
        }

        return sum / values.length;
    }
    static min(...values: number[]){
        let min = values[0];

        for(let i = 1; i < values.length; i++){
            if(values[i] < min) values[i] = min;
        }

        return min;
    }
    static max(...values: number[]){
        let max = values[0];

        for(let i = 1; i < values.length; i++){
            if(values[i] > max) values[i] = max;
        }

        return max;
    }
    static avarageColor(...values: Color[]){
        let sumr = 0;
        let sumg = 0;
        let sumb = 0;

        for(let i = 0; i < values.length; i++){
            sumr += values[i].r;
            sumg += values[i].g;
            sumb += values[i].b;
        }

        return new Color(sumr / values.length, sumg / values.length, sumb / values.length, 1);
    }
    static remap(min: number, max: number, newMin: number, newMax: number, v: number): number{
        let f = this.inverseLerp(min, max, v);

        return this.lerp(newMin, newMax, f);
    }
    static lerp(a: number, b: number, f: number): number{
        return a + (b - a) * f;
    }
    static inverseLerp(a: number, b: number, v: number): number{
        return (v - a) / (b - a);
    }
    static clamp(v: number, min: number, max: number): number{
        if(v < min) return min;
        if(v > max) return max;

        return v;
    }
    static clip(v: number): number{
        return this.clamp(v, 0, 1);
    }
}
