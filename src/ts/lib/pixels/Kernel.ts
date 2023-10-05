import { Color } from "lib/graphics/Color";
import { ImageGrid } from "./ImageGrid";
import { Sampler } from "./Sampler";

export class Kernel {
    static sharpen(grayscale: ImageGrid<number>) {
        let kernel = new ImageGrid<number>(3, 3, [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ]);

        return this.convolve(grayscale, kernel);
    }
    static blur(grayscale: ImageGrid<number>) {
        let kernel = new ImageGrid<number>(3, 3, [
            1, 2, 1,
            2, 4, 2,
            1, 2, 1
        ]).mapSelf(v => v / 16);

        return this.convolve(grayscale, kernel);
    }
    static boxblur(grayscale: ImageGrid<number>) {
        let kernel = new ImageGrid<number>(3, 3, [
            1, 1, 1,
            1, 1, 1,
            1, 1, 1
        ]).mapSelf(v => v / 9);

        return this.convolve(grayscale, kernel);
    }
    static grayscale(image: ImageGrid<Color>): ImageGrid<number>{
        return image.map(v => v.getValue());
    }
    static noise(grayscale: ImageGrid<number>){
        return grayscale.map((c, x, y) => {
            let diff = 0;

            for(let i = -1; i <= 1; i++){
                for(let j = -1; j <= 1; j++){
                    let s = grayscale.getPixel(x + i, y + j);

                    diff += (c - s) * (c - s);
                }
            }
            return diff;
        });
    }
    static normalize(grayscale: ImageGrid<number>){
        let max = 0.01;

        grayscale.foreachPixel(c => {
            if(c > max){ max = c;}
        });

        return grayscale.map((c, x, y) => {
            return c / max;
        });
    }

    static resample<T>(image: ImageGrid<T>, width: number, height: number){
        let aspect = image.width / image.height;
        let targetAspect = width / height;

        let xOffset = 0;
        let yOffset = 0;

        return Sampler.create(width, height, (x, y) => {
            let nx = Sampler.remap(0, width, 0, image.width, x);
            let ny = Sampler.remap(0, height, 0, image.height, y);

            return image.getPixel(Math.floor(nx), Math.floor(ny));
        });
    }

    static convolve(image: ImageGrid<number>, kernel: ImageGrid<number>){
        // Convolve :)
        let offsetX = Math.floor(kernel.width / 2);
        let offsetY = Math.floor(kernel.height / 2);

        return image.map((v, x, y) => {
            let sum = 0;

            kernel.foreachPixel((kernel, kx, ky) => {
                sum += kernel * image.getPixel(x + kx - offsetX, y + ky - offsetY);
            });

            return sum;
        });
    }
}