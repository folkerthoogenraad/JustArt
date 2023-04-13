import { Vector2 } from "expirimental/math/Vector2";
import { Constraint2D } from "./Constraint2D";
import { Rigidbody2D } from "./Rigidbody2D";
import { ConstraintAttachment2D } from "./ConstraintAttachment2D";


export class DistanceConstraint2D extends Constraint2D {
    compliance: number;
    restDistance: number;

    from: ConstraintAttachment2D;
    to: ConstraintAttachment2D;

    lambda: number = 0;

    constructor(from: ConstraintAttachment2D, to: ConstraintAttachment2D, distance: number, compliance: number = 0) {
        super();

        this.from = from;
        this.to = to;

        this.restDistance = distance;
        this.compliance = compliance;
    }

    resetRestDistance(){
        this.restDistance = this.calculateDistance();
    }

    calculateDistance(){
        // This doesn't take relative position and orientation into account currently.
        let dx = this.to.body.position.x - this.from.body.position.x;
        let dy = this.to.body.position.y - this.from.body.position.y;

        return Vector2.fLength(dx, dy);
    }

    init(delta: number): void {
        this.lambda = 0;
    }

    apply(delta: number): void {
        let dx = this.to.body.position.x - this.from.body.position.x;
        let dy = this.to.body.position.y - this.from.body.position.y;

        let w1 = this.from.getGeneralizedInverseMass();
        let w2 = this.to.getGeneralizedInverseMass();

        let distance = Vector2.fLength(dx, dy);

        if(distance == 0) return;

        dx /= distance;
        dy /= distance;

        let alpha = this.compliance / (delta * delta);

        let c = distance - this.restDistance;
        let deltaLambda = (-c + this.lambda * alpha) / (w1 + w2 + alpha);

        this.lambda += deltaLambda;

        let ix = dx * deltaLambda;
        let iy = dy * deltaLambda;

        this.from.body.addImmediateCentralImpulse(-ix, -iy, delta);
        this.to.body.addImmediateCentralImpulse(ix, iy, delta);
    }
}