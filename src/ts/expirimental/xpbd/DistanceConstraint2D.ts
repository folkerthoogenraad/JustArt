import { Vector2 } from "expirimental/math/Vector2";
import { Constraint2D } from "./Constraint2D";
import { Rigidbody2D } from "./Rigidbody2D";

class DistanceConstraintAttachment {
    readonly body: Rigidbody2D;
    readonly relativePosition: Vector2;
    readonly isCentral: boolean;

    constructor(body: Rigidbody2D, relativePosition: Vector2){
        this.isCentral = relativePosition.sqrLength == 0;
        this.body = body;
        this.relativePosition = relativePosition;
    }
}

export class DistanceConstraint2D extends Constraint2D {
    compliance: number;
    distance: number;

    from: DistanceConstraintAttachment;
    to: DistanceConstraintAttachment;

    lambda: number = 0;

    constructor(from: DistanceConstraintAttachment, to: DistanceConstraintAttachment, distance: number, compliance: number = 0) {
        super();

        this.from = from;
        this.to = to;

        this.distance = distance;
        this.compliance = compliance;
    }

    init(delta: number): void {
        this.lambda = 0;
    }

    apply(delta: number): void {

    }
}