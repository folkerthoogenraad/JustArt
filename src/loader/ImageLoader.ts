import { Color } from "../graphics/Color";
import { ImageGrid } from "../pixels/ImageGrid";
import { Sampler } from "../pixels/Sampler";

type UsableImage = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas;

export class ImageLoader {
    static getImageFromURL(url: string): Promise<HTMLImageElement>{
        return new Promise<HTMLImageElement>((resolve, reject) => {
            let image = new Image();

            image.onload = () => {
                resolve(image);
            };
            image.onerror = (evt) => {
                reject(evt);
            };

            image.src = url;
        });
    }

    static getImageFromCanvas(canvas: HTMLCanvasElement): Promise<HTMLImageElement>{
        return this.getImageFromURL(canvas.toDataURL());
    }
    
    static getImageDataFromImage(image: UsableImage): ImageData {
        let canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
    
        let context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
    
        return context.getImageData(0, 0, image.width, image.height, {});
    }
    
    static getImageFromImageData(data: ImageData): Promise<HTMLImageElement> {
        let canvas = this.getCanvasFromImageData(data);
     
        return this.getImageFromURL(canvas.toDataURL());
    }
    
    static getCanvasFromImageData(data: ImageData): HTMLCanvasElement {
        let canvas = document.createElement('canvas');
        canvas.width = data.width;
        canvas.height = data.height;
     
        let context = canvas.getContext('2d')!;
        context.putImageData(data, 0, 0);

        return canvas;
    }

    static getImageGridFromImage(image: UsableImage): ImageGrid<Color>{
        let data = this.getImageDataFromImage(image);

        return this.getImageGridFromImageData(data);
    }
    
    static getImageFromImageGrid(image: ImageGrid<Color>): Promise<HTMLImageElement>{
        let data = this.getImageDataFromImageGrid(image);

        return this.getImageFromImageData(data);
    }

    static getImageGridFromImageData(imageData: ImageData): ImageGrid<Color>{
        let image = new ImageGrid<Color>(imageData.width, imageData.height).fill(Color.grayscale(0));
    
        image.foreachPixel((color, x, y) => {
            let index = y * imageData.width * 4 + x * 4;
    
            let r = imageData.data[index + 0] / 255;
            let g = imageData.data[index + 1] / 255;
            let b = imageData.data[index + 2] / 255;
            let a = imageData.data[index + 3] / 255;
    
            image.setPixel(x, y, new Color(r,g,b,a));
        });
    
        return image;
    }

    static getImageDataFromImageGrid(image: ImageGrid<Color>): ImageData {
        let data = new ImageData(image.width, image.height, {colorSpace: "srgb"});
    
        image.foreachPixel((color, x, y) => {
            let index = y * image.width * 4 + x * 4;
    
            data.data[index + 0] = color.r * 255;
            data.data[index + 1] = color.g * 255;
            data.data[index + 2] = color.b * 255;
            data.data[index + 3] = color.a * 255;
        });
    
        return data;
    }
}