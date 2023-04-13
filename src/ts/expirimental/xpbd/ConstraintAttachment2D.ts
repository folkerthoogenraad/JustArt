import { Vector2 } from "expirimental/math/Vector2";
import { Rigidbody2D } from "./Rigidbody2D";

export class ConstraintAttachment2D {
    readonly body: Rigidbody2D;
    readonly relativePosition: Vector2;
    readonly isCentral: boolean;

    constructor(body: Rigidbody2D, relativePosition?: Vector2){
        this.isCentral = relativePosition === undefined;
        this.body = body;
        this.relativePosition = relativePosition ?? new Vector2();
    }

    // TODO the normal vector and whatnot
    getGeneralizedInverseMass(){
        return this.body.inverseMass;
    }
}