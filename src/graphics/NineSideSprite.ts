function _waitForLoad(image: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
        if(image.complete){
            resolve();
        }

        image.onload = () => resolve();
    });
}

export class NineSideSprite {
    image: HTMLImageElement;

    sourceX: number;
    sourceY: number;
    sourceWidth: number;
    sourceHeight: number;

    leftEdge: number;
    rightEdge: number;
    topEdge: number;
    bottomEdge: number;

    constructor(image: HTMLImageElement|string, x: number = 0, y: number = 0, sourceWidth: number = 0, sourceHeight: number = 0, leftEdge: number = 0, topEdge: number = 0, rightEdge: number = 0, bottomEdge: number = 0) {
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

        this.leftEdge = leftEdge;
        this.rightEdge = rightEdge;
        this.topEdge = topEdge;
        this.bottomEdge = bottomEdge;
    }

    setLeftEdge(left: number): this {
        this.leftEdge = left;
        
        return this;
    }

    setRightEdge(right: number): this {
        this.rightEdge = right;
        
        return this;
    }

    setBottomEdge(bottom: number): this {
        this.bottomEdge = bottom;
        
        return this;
    }

    setTopEdge(top: number): this {
        this.topEdge = top;
        
        return this;
    }

    setEdges(edges: number): this {
        this.leftEdge = edges;
        this.rightEdge = edges;
        this.bottomEdge = edges;
        this.topEdge = edges;
        
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
        await _waitForLoad(this.image);

        return this;
    }
}