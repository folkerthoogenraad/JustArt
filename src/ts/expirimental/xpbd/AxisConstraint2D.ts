import { Vector2 } from "expirimental/math/Vector2";
import { Constraint2D } from "./Constraint2D";
import { Rigidbody2D } from "./Rigidbody2D";
import { ConstraintAttachment2D } from "./ConstraintAttachment2D";

export class AxisConstraint2D extends Constraint2D {
    compliance: number;

    offset: Vector2;
    axis: Vector2;

    attachment: ConstraintAttachment2D;

    lambda: number = 0;

    constructor(attachment: ConstraintAttachment2D, offset: Vector2, axis: Vector2, compliance: number = 0) {
        super();

        this.attachment = attachment;

        this.offset = offset;
        this.axis = axis;

        this.compliance = compliance;
    }

    init(delta: number): void {
        this.lambda = 0;
    }

    apply(delta: number): void {
        let dx = (this.attachment.body.position.x - this.offset.x);
        let dy = (this.attachment.body.position.y - this.offset.y);

        dx -= this.axis.x * dx;
        dy -= this.axis.y * dy;

        let w1 = this.attachment.getGeneralizedInverseMass();
        let w2 = 0;

        let distance = Vector2.fLength(dx, dy);

        if(distance == 0) return;

        dx /= distance;
        dy /= distance;

        let alpha = this.compliance / (delta * delta);

        let c = distance;
        let deltaLambda = (-c + this.lambda * alpha) / (w1 + w2 + alpha);

        this.lambda += deltaLambda;

        let ix = dx * deltaLambda;
        let iy = dy * deltaLambda;

        this.attachment.body.addImmediateCentralImpulse(ix, iy, delta);
    }
}