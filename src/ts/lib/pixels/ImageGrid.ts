import { Rect2 } from "lib/math/Rect2";
import { Color } from "../graphics/Color";

export type ColorImage = ImageGrid<Color>;

export enum EdgeBehaviour{
    Disallow,
    Wrap,
    Clamp
}

export class ImageGrid<T>{
    readonly width: number;
    readonly height: number;
    readonly grid: T[];

    edgeBehaviour: EdgeBehaviour;

    constructor(width: number, height: number, grid?: T[]){
        this.width = width;
        this.height = height;

        if(grid){
            this.grid = grid;
            
            if(this.grid.length !== this.width * this.height) throw new Error("Incorrect array sizing.");
        }
        else{
            this.grid = Array<T>(width * height);
        }

        this.edgeBehaviour = EdgeBehaviour.Clamp;
    }

    // ===================================================== //
    // Modifications of self
    // ===================================================== //
    setPixel(x: number, y: number, color: T){
        this.grid[this.getIndex(x, y)] = color;
    }
    getPixel(x: number, y: number): T{
        return this.grid[this.getIndex(x, y)];
    }
    getIndex(x: number, y: number){
        if(this.edgeBehaviour == EdgeBehaviour.Disallow){
            if(x < 0) throw new Error("x < 0");
            if(y < 0) throw new Error("y < 0");
            if(x >= this.width) throw new Error("x >= this.width");
            if(y >= this.height) throw new Error("y >= this.height");
        }
        else if(this.edgeBehaviour == EdgeBehaviour.Clamp){
            if(x < 0) x = 0;
            if(y < 0) y = 0;
            if(x >= this.width) x = this.width - 1;
            if(y >= this.height) y = this.height - 1;
        }
        else if(this.edgeBehaviour == EdgeBehaviour.Wrap){
            if(x < 0) x = this.width + x % this.width;
            if(y < 0) y = this.height + y % this.height;
            if(x >= this.width) x %= this.width;
            if(y >= this.height) y %= this.height;
        }

        return x + y * this.width;
    }
    fill(v: T){
        this.mapSelf(() => v);

        return this;
    }

    foreachPixel(lambda: (color: T, x: number, y: number) => void){
        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                lambda(this.getPixel(i, j), i, j);
            }
        }
        return this;
    }

    foreachPixelIn(rect: Rect2, lambda: (color: T, x: number, y: number) => void){
        for(let i = Math.max(0, Math.floor(rect.left)); i < this.width && i < rect.right; i++){
            for(let j = Math.max(0, Math.floor(rect.top)); j < this.height && j < rect.bottom; j++){
                lambda(this.getPixel(i, j), i, j);
            }
        }
        return this;
    }

    mapSelf(lambda: (v: T, x: number, y: number) => T){
        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                let currentValue = this.getPixel(i, j);
                let newValue = lambda(currentValue, i, j);
                this.setPixel(i, j, newValue);
            }
        }
        return this;
    }

    processHorizontalSpans(processor: (v: ImageGrid<T>, x: number, y: number) => ImageGrid<T>, includer: (x: number, y: number) => boolean){
        let start = -1;
        let wasIncluded = false;

        for(let j = 0; j < this.height; j++) {
            for(let i = 0; i < this.width; i++) {
                let included = includer(i, j);
                
                if(!wasIncluded && included){
                    wasIncluded = true;
                    start = i;
                }
                if(wasIncluded && !included){
                    // [0 1 2 3 4 5 6 7]
                    //  x x x       x x
                    let subgrid = this.subGrid(start, j, i - start, 1);

                    this.blit(start, j, processor(subgrid, start, j));

                    wasIncluded = false;
                }
            }

            if(wasIncluded){
                // [0 1 2 3 4 5 6 7]
                //  x x x     x x   
                let subgrid = this.subGrid(start, j, this.width - start, 1);
    
                this.blit(start, j, processor(subgrid, start, j));
            }
            
            wasIncluded = false;
            start = -1;
        }
        return this;
    }
    processVerticalSpans(processor: (v: ImageGrid<T>, x: number, y: number) => ImageGrid<T>, includer: (x: number, y: number) => boolean){
        let start = -1;
        let wasIncluded = false;

        for(let i = 0; i < this.width; i++) {
            for(let j = 0; j < this.height; j++) {
                let included = includer(i, j);
                
                if(!wasIncluded && included){
                    wasIncluded = true;
                    start = j;
                }
                if(wasIncluded && !included){
                    // [0 1 2 3 4 5 6 7]
                    //  x x x       x x
                    let subgrid = this.subGrid(i, start, 1, j - start);

                    this.blit(i, start, processor(subgrid, i, start));

                    wasIncluded = false;
                }
            }

            if(wasIncluded){
                // [0 1 2 3 4 5 6 7]
                //  x x x     x x   
                let subgrid = this.subGrid(i, start, 1, this.height - start);
    
                this.blit(i, start, processor(subgrid, i, start));
            }
            
            wasIncluded = false;
            start = -1;
        }
        return this;
    }
    
    // ===================================================== //
    // Helpers
    // ===================================================== //
    subGrid(x: number, y: number, w: number, h: number): ImageGrid<T> {
        let grid = new ImageGrid<T>(w, h);

        for(let i = 0; i < w; i++){
            for(let j = 0; j < h; j++){
                grid.setPixel(i, j, this.getPixel(x + i, y + j));
            }
        }

        return grid;
    }
    blit(x: number, y: number, grid: ImageGrid<T>){
        for(let i = 0; i < grid.width; i++){
            for(let j = 0; j < grid.height; j++){
                this.setPixel(x + i, y + j, grid.getPixel(i, j));
            }
        }
    }

    // ===================================================== //
    // Clones
    // ===================================================== //
    clone(): ImageGrid<T>{
        let clone = new ImageGrid<T>(this.width, this.height, [...this.grid]);

        clone.edgeBehaviour = this.edgeBehaviour;

        return clone;
    }

    map<S>(lambda: (color: T, x: number, y: number) => S): ImageGrid<S> {
        let data = Array(this.grid.length);

        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                let index = this.getIndex(i, j);
                let currentValue = this.grid[index];
                
                let newValue = lambda(currentValue, i, j);
                
                data[index] = newValue;
            }
        }

        let g = new ImageGrid<S>(this.width, this.height, data);
        g.edgeBehaviour = this.edgeBehaviour;

        return g;
    }
}