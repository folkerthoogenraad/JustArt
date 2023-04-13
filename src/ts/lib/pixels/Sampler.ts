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
    static convolve(colorGrid: ImageGrid<Color>, weights: ImageGrid<number>): ImageGrid<Color>{
        let grid = new ImageGrid<Color>(colorGrid.width, colorGrid.height);

        let xoffset = -Math.floor(weights.width / 2);
        let yoffset = -Math.floor(weights.height / 2);

        let avarageBuffer = weights.map(x => Color.white);

        for(let i = 0; i < colorGrid.width; i++){
            for(let j = 0; j < colorGrid.height; j++){
                
                // Collect points
                weights.foreachPixel((c, x, y) => avarageBuffer.setPixel(x, y, colorGrid.getPixel(xoffset + i + x, yoffset + j + y)));

                // Get the sum avarage
                let avg = this.weightedSum(avarageBuffer.grid, weights.grid);

                // Set the pixel
                grid.setPixel(i, j, avg);
            }
        }

        return grid;
    }
    static convolveNumber(colorGrid: ImageGrid<number>, weights: ImageGrid<number>): ImageGrid<number>{
        let grid = new ImageGrid<number>(colorGrid.width, colorGrid.height);

        let xoffset = -Math.floor(weights.width / 2);
        let yoffset = -Math.floor(weights.height / 2);

        let avarageBuffer = weights.map(x => 0);

        for(let i = 0; i < colorGrid.width; i++){
            for(let j = 0; j < colorGrid.height; j++){
                
                // Collect points
                weights.foreachPixel((c, x, y) => avarageBuffer.setPixel(x, y, colorGrid.getPixel(xoffset + i + x, yoffset + j + y)));

                // Get the sum avarage
                let avg = this.weightedSumNumbers(avarageBuffer.grid, weights.grid);

                // Set the pixel
                grid.setPixel(i, j, avg);
            }
        }

        return grid;
    }

    static lambdaMin<T>(array: T[], f: (t: T) => number){
        let min = f(array[0]);

        for(let i = 1; i < array.length; i++){
            let v = f(array[i]);

            if(v < min){
                min = v;
            }
        }

        return min;
    }

    static lambdaMax<T>(array: T[], f: (t: T) => number){
        let max = f(array[0]);

        for(let i = 1; i < array.length; i++){
            let v = f(array[i]);

            if(v > max){
                max = v;
            }
        }

        return max;
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

    static weightedSum(values: Color[], weights: number[]){
        if(values.length !== weights.length) throw new Error("Cannot reduce weights and values");

        let sumr = 0;
        let sumg = 0;
        let sumb = 0;

        for(let i = 0; i < values.length; i++){
            sumr += values[i].r * weights[i];
            sumg += values[i].g * weights[i];
            sumb += values[i].b * weights[i];
        }

        return new Color(sumr, sumg, sumb, 1);
    }
    static weightedSumNumbers(values: number[], weights: number[]){
        if(values.length !== weights.length) throw new Error("Cannot reduce weights and values");

        let s = 0;

        for(let i = 0; i < values.length; i++){
            s  += values[i] * weights[i];
        }

        return s;
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
