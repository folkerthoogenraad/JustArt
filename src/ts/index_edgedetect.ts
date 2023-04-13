import { InterpolationCurves } from "expirimental/math/InterpolationCurve";
import { MathHelper } from "expirimental/math/MathHelper";
import { Color } from "lib/graphics/Color";
import { Graphics2D } from "lib/graphics/Graphics2D";
import { ImageLoader } from "lib/loader/ImageLoader";
import { ImageGrid } from "lib/pixels/ImageGrid";
import { Sampler } from "lib/pixels/Sampler";


let graphics: Graphics2D;

let imageInputColor: ImageGrid<Color>
let imageGrid: ImageGrid<Color>
let imageData: ImageData;
let outputImage: HTMLCanvasElement;

function redraw(){
    graphics.setup();
    graphics.drawImage(outputImage, 0, 0);
}

function intermediate(r: ImageGrid<number>,g: ImageGrid<number>,b: ImageGrid<number>): Promise<void> {
    imageGrid.mapSelf((c, x, y) => new Color(r.getPixel(x, y), g.getPixel(x, y), b.getPixel(x, y)).mul(imageInputColor.getPixel(x, y)));
    // imageGrid.mapSelf((c, x, y) => imageInputColor.getPixel(x, y));

    ImageLoader.getImageDataFromImageGrid(imageGrid, imageData);
    ImageLoader.getCanvasFromImageData(imageData, outputImage);

    redraw();
    return new Promise((resolve, reject) => setTimeout(resolve));
}

let edges = new ImageGrid(3, 3, [
    -1, -2, -1, 
    -2, 12, -2,
    -1, -2, -1]).map(c => c / 10);
let edges1 = new ImageGrid(3, 3, [
    -2, -2, -2, 
    -2, 12, -2,
    -2, -2, -2]).map(c => c / 9);
let blur = new ImageGrid(3, 3, [
    1, 2, 1, 
    2, 12, 2,
    1, 2, 1]).map(c => c / 12);

let blurOther = new ImageGrid(3, 3, [
    1, 2, 1,
    2, 2, 2,
    1, 2, 1]).map(c => c / 4);
let blurSad = new ImageGrid(3, 3, [
    1, 1, 1,
    1, 1, 1,
    1, 1, 1]).map(c => c / 9);

function sigmoid(f: number): number{
    // return f;
    // return 1 / (1 + Math.exp(-f));
    return Math.tanh(f);
}

async function processGrid(image: ImageGrid<Color>): Promise<ImageGrid<Color>>{
    imageInputColor = Sampler.convolve(imageInputColor, blurSad);
    imageInputColor = Sampler.convolve(imageInputColor, blurSad);
    imageInputColor = Sampler.convolve(imageInputColor, blurSad);

    let initialGridR = image.map(x => x.getValue()).mapSelf((c, x, y) => c * c);
    // let initialGridG = image.map(x => x.g);
    // let initialGridB = image.map(x => x.b);

    let b = blurOther;
    
    initialGridR = Sampler.convolveNumber(initialGridR, edges).map(sigmoid);
    // initialGridG = Sampler.convolveNumber(initialGridG, edges).mapSelf((c, x, y) => c * 0);
    // initialGridB = Sampler.convolveNumber(initialGridB, edges).mapSelf((c, x, y) => c * 0);

    let gridR = Sampler.convolveNumber(initialGridR, b);
    // let gridG = Sampler.convolveNumber(initialGridG, blur);
    // let gridB = Sampler.convolveNumber(initialGridB, blur);

    for(let i = 0; i < 500; i++){
        await intermediate(gridR, gridR, gridR);

        gridR = Sampler.convolveNumber(gridR, edges).map(sigmoid);
        gridR = Sampler.convolveNumber(gridR, b);
        // gridG = Sampler.convolveNumber(gridG, edges);
        // gridG = Sampler.convolveNumber(gridG, blur);
        // gridB = Sampler.convolveNumber(gridB, edges);
        // gridB = Sampler.convolveNumber(gridB, blur);
    }

    return image.map((c, x, y) => new Color(gridR.getPixel(x, y), gridR.getPixel(x, y), gridR.getPixel(x, y)));
}

async function process(image: HTMLImageElement|HTMLCanvasElement): Promise<HTMLImageElement> {
    let grid = ImageLoader.getImageGridFromImage(image);

    let out = await processGrid(grid);
    
    return await ImageLoader.getImageFromImageGrid(out);
}

function createImage(): HTMLCanvasElement{
    let canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;

    let g = new Graphics2D(canvas);

    g.setLineWidth(12);

    g.setStrokeColor("red");

    g.drawLine(12, 12, 534, 2345);

    return canvas;
}

function downsample(image: HTMLImageElement|HTMLCanvasElement, factor: number): HTMLCanvasElement{
    let canvas = document.createElement("canvas");
    canvas.width = image.width * factor;
    canvas.height = image.height * factor;

    let g = new Graphics2D(canvas);

    g.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas;
}

document.addEventListener("DOMContentLoaded", async ()=>{
    let canvas = document.getElementById("canvas") as HTMLCanvasElement;

    let inputImage = downsample(await ImageLoader.getImageFromURL("/assets/img/face.avif"), 0.25);
    outputImage = ImageLoader.imageToCanvas(inputImage);

    imageInputColor = ImageLoader.getImageGridFromImage(inputImage);

    imageData = ImageLoader.getImageDataFromImage(outputImage);

    imageGrid = ImageLoader.getImageGridFromImageData(imageData);

    canvas.width = outputImage.width;
    canvas.height = outputImage.height;

    graphics = new Graphics2D(canvas);

    redraw();
    
    process(outputImage);
 });
 