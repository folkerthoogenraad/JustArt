import { Vector2 } from "./Vector2";

export class Line2 {
    readonly from: Vector2;
    readonly to: Vector2;

    constructor(from: Vector2, to: Vector2) {
        this.from = from;
        this.to = to;
    }
}