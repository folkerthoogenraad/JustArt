import { Vector2 } from "./Vector2";

/**
 * A plane class, representing a two dimensional plane, or an infinite line.
 */
export class Ray2 {
    readonly origin: Vector2;
    readonly direction: Vector2;

    constructor(origin: Vector2, direction: Vector2) {
        this.origin = origin;
        this.direction = direction;
    }


    static intersect(a: Ray2, b: Ray2): Vector2 | undefined {
        const epsilon = 0.000001;

        const denominator = Vector2.cross(a.direction, b.direction);

        if (denominator > -epsilon && denominator < epsilon) return undefined;

        let r = b.origin.clone().sub(a.origin);
        let t = Vector2.cross(r, b.direction) / denominator;

        let out = a.origin.clone().addScaled(a.direction, t);

        return out;
    }
}