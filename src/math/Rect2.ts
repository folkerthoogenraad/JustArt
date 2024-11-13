import { Vector2 } from "./Vector2";

export class Rect2 {
    position: Vector2;
    size: Vector2;

    constructor(position: Vector2, size: Vector2){
        this.position = position;
        this.size = size;
    }

    get x() { return this.position.x; }
    get y() { return this.position.y; }
    get width() { return this.size.x; }
    get height() { return this.size.y; }

    get left() { return this.position.x; }
    get right() { return this.position.x + this.size.x; }
    get top() { return this.position.y; }
    get bottom() { return this.position.y + this.size.y; }

    clone(){
        return new Rect2(this.position.clone(), this.size.clone());
    }

    static create(x: number, y: number, width: number, height: number): Rect2 {
        return new Rect2(new Vector2(x, y), new Vector2(width, height));
    }
    static createCentered(x: number, y: number, width: number, height: number): Rect2 {
        return new Rect2(new Vector2(x - width / 2, y - height / 2), new Vector2(width, height));
    }

    set left(left: number){
        let right = this.right;

        this.position.x = left;
        this.size.x = right - left;
    }
    set right(right: number){
        this.size.x = right - this.left;
    }
    set top(top: number){
        let bottom = this.bottom;

        this.position.y = top;
        this.size.y = bottom - top;
    }
    set bottom(bottom: number){
        this.size.y = bottom - this.top;
    }
}