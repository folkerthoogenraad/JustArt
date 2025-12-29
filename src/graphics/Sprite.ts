import { ImageLoader } from "../loader/ImageLoader";

// This class should probably be removed or whatever. It's too specific for the implementation.
// It's great for rapid prototyping but doesn't allow much flexibility in implementation, which
// is a problem for bigger applications with slightly different needs.
export class Sprite {
    image: HTMLImageElement;

    sourceX: number;
    sourceY: number;
    sourceWidth: number;
    sourceHeight: number;

    originX: number;
    originY: number;

    constructor(image: HTMLImageElement|string, x: number = 0, y: number = 0, sourceWidth: number = 0, sourceHeight: number = 0, originX: number = 0, originY: number = 0) {
        if(image instanceof HTMLImageElement){
            this.image = image;
        }
        else{
            this.image = new Image();
            this.image.src = image;
        }

        this.sourceX = x;
        this.sourceY = y;
        this.sourceWidth = sourceWidth;
        this.sourceHeight = sourceHeight;

        this.originX = originX;
        this.originY = originY;
    }

    setOrigin(originX: number, originY: number): this {
        this.originX = originX;
        this.originY = originY;
        
        return this;
    }

    setSize(width: number, height: number): this {
        this.sourceWidth = width;
        this.sourceHeight = height;

        return this;
    }

    setPosition(x: number, y: number): this {
        this.sourceX = x;
        this.sourceY = y;

        return this;
    }

    get width(){
        return this.sourceWidth;
    }

    get height(){
        return this.sourceHeight;
    }
    
    get isLoaded() {
        return this.image.complete;
    }

    async waitForLoad(): Promise<this> {
        await ImageLoader.waitForLoad(this.image);

        return this;
    }
}